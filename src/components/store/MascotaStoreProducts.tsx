import { SectionHeading } from "@/components/marketing/SectionHeading";
import { StoreCheckout } from "@/components/store/StoreCheckout";
import { listActiveStoreProducts } from "@/lib/db/queries-store";
import { pickMascotaStoreProducts } from "@/lib/store/mascota-products";

export async function MascotaStoreProducts() {
  let products = pickMascotaStoreProducts([]);
  try {
    products = pickMascotaStoreProducts(await listActiveStoreProducts());
  } catch {
    products = pickMascotaStoreProducts([]);
  }

  return (
    <section className="mx-auto max-w-[88rem] px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Tienda"
        title="Chapitas con QR"
        description="Para el collar. Agregalas al carrito y pedilas por WhatsApp."
      />
      <div className="mx-auto mt-12 max-w-5xl">
        <StoreCheckout
          products={products}
          layout="grid"
          showActivateLink={false}
        />
      </div>
    </section>
  );
}
