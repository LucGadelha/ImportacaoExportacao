import InventoryStats from "@/components/inventory/InventoryStats";
import InventoryList from "@/components/inventory/InventoryList";

export default function Inventory() {
  return (
    <section className="mb-8">
      <InventoryStats />
      <InventoryList />
    </section>
  );
}
