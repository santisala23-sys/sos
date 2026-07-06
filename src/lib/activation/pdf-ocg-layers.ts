import zlib from "zlib";

type LayerSpec = {
  begin: string;
  end: string;
  propertyKey: string;
  ocgName: string;
};

const LAYERS: LayerSpec[] = [
  {
    begin: "%__LAYER_DESIGN_BEGIN__",
    end: "%__LAYER_DESIGN_END__",
    propertyKey: "OCG_Design",
    ocgName: "Diseño",
  },
  {
    begin: "%__LAYER_CUT_BEGIN__",
    end: "%__LAYER_CUT_END__",
    propertyKey: "OCG_Cut",
    ocgName: "Corte y Perforado",
  },
];

type PdfObject = {
  id: number;
  header: string;
  body: string;
  stream?: Buffer;
  isStream: boolean;
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseObjects(pdf: string): PdfObject[] {
  const objects: PdfObject[] = [];
  const regex = /(\d+) 0 obj\r?\n([\s\S]*?)\r?\nendobj/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(pdf)) !== null) {
    const id = Number(match[1]);
    const rawBody = match[2];
    const streamIndex = rawBody.indexOf("stream");

    if (streamIndex === -1) {
      objects.push({ id, header: `${id} 0 obj`, body: rawBody, isStream: false });
      continue;
    }

    const header = rawBody.slice(0, streamIndex).trimEnd();
    const afterStream = rawBody.slice(streamIndex + "stream".length);
    const streamBody = afterStream.replace(/^\r?\n/, "").replace(/\r?\nendstream$/, "");
    objects.push({
      id,
      header: `${id} 0 obj`,
      body: header,
      stream: Buffer.from(streamBody, "latin1"),
      isStream: true,
    });
  }

  return objects;
}

function inflateStream(object: PdfObject): string {
  if (!object.isStream || !object.stream) {
    return "";
  }

  const isFlate = /\/Filter\s*\/FlateDecode/.test(object.body);
  if (!isFlate) {
    return object.stream.toString("latin1");
  }

  return zlib.inflateSync(object.stream).toString("latin1");
}

function deflateStream(content: string): Buffer {
  return zlib.deflateSync(Buffer.from(content, "latin1"));
}

function wrapLayerContent(content: string): string {
  const transformMatch = content.match(/^1 0 0 -1 [\d.]+ [\d.]+ cm\r?\n?/);
  const transform = transformMatch?.[0] ?? "";
  let body = content.slice(transform.length);

  for (const layer of LAYERS) {
    const pattern = new RegExp(
      `${escapeRegExp(layer.begin)}\\s*([\\s\\S]*?)\\s*${escapeRegExp(layer.end)}`,
      "g",
    );
    body = body.replace(
      pattern,
      `/OC /${layer.propertyKey} BDC\n$1\nEMC`,
    );
  }

  return `${transform}${body}`.trimEnd() + "\n";
}

function serializeObject(object: PdfObject): string {
  if (!object.isStream || object.stream === undefined) {
    return `${object.header}\n${object.body}\nendobj\n`;
  }

  const streamData = object.stream.toString("latin1");
  return `${object.header}\n${object.body}\nstream\n${streamData}\nendstream\nendobj\n`;
}

function rebuildPdf(objects: PdfObject[]): Buffer {
  let body = "%PDF-1.3\n%ÿÿÿÿ\n";
  const offsets: number[] = [];
  const maxId = objects.reduce((max, obj) => Math.max(max, obj.id), 0);

  for (let id = 0; id <= maxId; id++) {
    const object = objects.find((entry) => entry.id === id);
    if (!object) {
      continue;
    }
    offsets[id] = Buffer.byteLength(body, "latin1");
    body += serializeObject(object);
  }

  const xrefOffset = Buffer.byteLength(body, "latin1");
  body += `xref\n0 ${maxId + 1}\n`;
  body += "0000000000 65535 f \n";

  for (let id = 1; id <= maxId; id++) {
    const offset = offsets[id] ?? 0;
    body += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }

  const root = objects.find((object) => /\/Type\s*\/Catalog/.test(object.body));
  const info = objects.find(
    (object) =>
      object.id !== root?.id &&
      /\/Producer\s*\(/.test(object.body) &&
      !/\/Type\s*\/Page/.test(object.body),
  );

  body += "trailer\n<<\n";
  body += `/Size ${maxId + 1}\n`;
  if (root) {
    body += `/Root ${root.id} 0 R\n`;
  }
  if (info) {
    body += `/Info ${info.id} 0 R\n`;
  }
  body += ">>\n";
  body += `startxref\n${xrefOffset}\n`;
  body += "%%EOF\n";

  return Buffer.from(body, "latin1");
}

function addPropertiesToResources(resourcesBody: string, layerRefs: string): string {
  if (/\/Properties\s*<</.test(resourcesBody)) {
    return resourcesBody.replace(
      /\/Properties\s*<<([\s\S]*?)>>/,
      `/Properties <<$1\n${layerRefs}\n>>`,
    );
  }

  return resourcesBody.replace(
    />>\s*$/,
    `/Properties <<\n${layerRefs}\n>>\n>>`,
  );
}

/**
 * PDFKit does not emit Optional Content Groups. This post-processor wraps
 * marker-delimited content streams with OCG BDC/EMC operators and registers
 * the layer dictionary on the catalog.
 */
export function injectPdfOptionalContentGroups(pdfBuffer: Buffer): Buffer {
  const pdf = pdfBuffer.toString("latin1");
  const objects = parseObjects(pdf);

  const pageObjects = objects.filter((object) =>
    /\/Type\s*\/Page/.test(object.body),
  );
  if (pageObjects.length === 0) {
    return pdfBuffer;
  }

  const maxId = objects.reduce((max, object) => Math.max(max, object.id), 0);
  const designOcgId = maxId + 1;
  const cutOcgId = maxId + 2;
  const ocPropertiesId = maxId + 3;

  objects.push({
    id: designOcgId,
    header: `${designOcgId} 0 obj`,
    body: `<<\n/Type /OCG\n/Name (${LAYERS[0].ocgName})\n>>`,
    isStream: false,
  });
  objects.push({
    id: cutOcgId,
    header: `${cutOcgId} 0 obj`,
    body: `<<\n/Type /OCG\n/Name (${LAYERS[1].ocgName})\n>>`,
    isStream: false,
  });
  objects.push({
    id: ocPropertiesId,
    header: `${ocPropertiesId} 0 obj`,
    body: `<<\n/OCGs [${designOcgId} 0 R ${cutOcgId} 0 R]\n/D <<\n/Name (Layers)\n/Order [${designOcgId} 0 R ${cutOcgId} 0 R]\n/ON [${designOcgId} 0 R ${cutOcgId} 0 R]\n/OFF []\n/RBGroups []\n>>\n>>`,
    isStream: false,
  });

  const layerPropertyRefs = [
    `/${LAYERS[0].propertyKey} ${designOcgId} 0 R`,
    `/${LAYERS[1].propertyKey} ${cutOcgId} 0 R`,
  ].join("\n");

  const contentStreams = objects.filter(
    (object) => object.isStream && /\/Length/.test(object.body),
  );

  for (const streamObject of contentStreams) {
    const inflated = inflateStream(streamObject);
    if (!inflated.includes("%__LAYER_")) {
      continue;
    }

    const wrapped = wrapLayerContent(inflated);
    const deflated = deflateStream(wrapped);
    streamObject.stream = deflated;
    streamObject.body = streamObject.body.replace(
      /\/Length\s+\d+/,
      `/Length ${deflated.length}`,
    );
  }

  for (const page of pageObjects) {
    const resourcesMatch = page.body.match(/\/Resources\s+(\d+)\s+0\s+R/);
    if (!resourcesMatch) {
      continue;
    }

    const resourcesId = Number(resourcesMatch[1]);
    const resources = objects.find((object) => object.id === resourcesId);
    if (!resources || resources.isStream) {
      continue;
    }

    resources.body = addPropertiesToResources(resources.body, layerPropertyRefs);
  }

  const catalog = objects.find((object) => /\/Type\s*\/Catalog/.test(object.body));
  if (catalog) {
    if (/\/OCProperties/.test(catalog.body)) {
      catalog.body = catalog.body.replace(
        /\/OCProperties\s+\d+\s+0\s+R/,
        `/OCProperties ${ocPropertiesId} 0 R`,
      );
    } else {
      catalog.body = catalog.body.replace(
        />>\s*$/,
        `/OCProperties ${ocPropertiesId} 0 R\n>>`,
      );
    }
  }

  return rebuildPdf(objects);
}
