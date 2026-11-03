import { SectionHeading } from "@/components/marketing/SectionHeading";
import { StoreCheckout } from "@/components/store/StoreCheckout";
import { listActiveStoreProducts } from "@/lib/db/queries-store";
import { pickPersonaStoreProducts } from "@/lib/store/persona-products";

export async function PersonaStoreProducts() {
  let products = pickPersonaStoreProducts([]);
  try {
    products = pickPersonaStoreProducts(await listActiveStoreProducts());
  } catch {
    products = pickPersonaStoreProducts([]);
  }

  return (
    <section className="mx-auto max-w-[88rem] px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Tienda"
        title="Credencial o sticker con QR"
        description="Para llevar el perfil encima. Agregalos al carrito y pedilos por WhatsApp."
      />
      <div className="mx-auto mt-12 max-w-4xl">
        <StoreCheckout
          products={products}
          layout="grid"
          showActivateLink={false}
        />
      </div>
    </section>
  );
}
