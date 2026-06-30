import Link from "next/link";

function parseInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("**")) {
      parts.push(
        <strong key={`${match.index}-b`}>{token.slice(2, -2)}</strong>,
      );
    } else {
      const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (linkMatch) {
        const [, label, href] = linkMatch;
        const isExternal = href.startsWith("http");
        if (isExternal) {
          parts.push(
            <a
              key={`${match.index}-a`}
              href={href}
              className="font-medium text-violet-700 underline-offset-2 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {label}
            </a>,
          );
        } else {
          parts.push(
            <Link
              key={`${match.index}-l`}
              href={href}
              className="font-medium text-violet-700 underline-offset-2 hover:underline"
            >
              {label}
            </Link>,
          );
        }
      }
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length ? parts : [text];
}

function MarkdownTable({ lines }: { lines: string[] }) {
  const rows = lines
    .filter((line) => line.trim().startsWith("|"))
    .map((line) =>
      line
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim()),
    );

  if (rows.length < 2) return null;

  const [header, , ...body] = rows;

  return (
    <div className="my-6 overflow-x-auto rounded-xl border border-neutral-200">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-neutral-50">
          <tr>
            {header.map((cell, i) => (
              <th
                key={i}
                className="border-b border-neutral-200 px-4 py-3 font-semibold text-neutral-900"
              >
                {parseInline(cell)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, ri) => (
            <tr key={ri} className="border-b border-neutral-100 last:border-0">
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-3 align-top text-neutral-700">
                  {parseInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MarkdownBlock({ block }: { block: string }) {
  const trimmed = block.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("# ")) {
    return (
      <h1 className="mb-6 text-3xl font-black text-neutral-900">
        {parseInline(trimmed.slice(2))}
      </h1>
    );
  }
  if (trimmed.startsWith("## ")) {
    return (
      <h2 className="mb-4 mt-10 scroll-mt-24 text-xl font-bold text-neutral-900">
        {parseInline(trimmed.slice(3))}
      </h2>
    );
  }
  if (trimmed.startsWith("### ")) {
    return (
      <h3 className="mb-3 mt-8 text-lg font-semibold text-neutral-900">
        {parseInline(trimmed.slice(4))}
      </h3>
    );
  }
  if (trimmed === "---") {
    return <hr className="my-8 border-neutral-200" />;
  }
  if (trimmed.startsWith("> ")) {
    return (
      <blockquote className="my-4 rounded-xl border-l-4 border-violet-400 bg-violet-50 px-4 py-3 text-neutral-700">
        {parseInline(trimmed.replace(/^>\s?/gm, ""))}
      </blockquote>
    );
  }
  if (trimmed.includes("\n|") || trimmed.startsWith("|")) {
    return <MarkdownTable lines={trimmed.split("\n")} />;
  }
  if (/^-\s/.test(trimmed)) {
    const items = trimmed.split("\n").filter((l) => l.startsWith("- "));
    return (
      <ul className="my-4 list-disc space-y-2 pl-6 text-neutral-700">
        {items.map((item, i) => (
          <li key={i}>{parseInline(item.slice(2))}</li>
        ))}
      </ul>
    );
  }
  if (/^\d+\.\s/.test(trimmed)) {
    const items = trimmed.split("\n").filter((l) => /^\d+\.\s/.test(l));
    return (
      <ol className="my-4 list-decimal space-y-2 pl-6 text-neutral-700">
        {items.map((item, i) => (
          <li key={i}>{parseInline(item.replace(/^\d+\.\s/, ""))}</li>
        ))}
      </ol>
    );
  }

  return (
    <p className="my-4 leading-relaxed text-neutral-700">
      {parseInline(trimmed)}
    </p>
  );
}

export function MarkdownContent({ source }: { source: string }) {
  const blocks = source.split(/\n\n+/);
  return (
    <article className="legal-prose max-w-none">
      {blocks.map((block, i) => (
        <MarkdownBlock key={i} block={block} />
      ))}
    </article>
  );
}
