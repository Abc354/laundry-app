import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Layout } from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";

export default function ManageItems() {
  const { toast } = useToast();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCategory, setNewCategory] = useState("");

  // 🔹 Fetch items
  const fetchItems = async () => {
    setLoading(true);
    //const { data, error } = await supabase.from("items").select("*");
    const { data, error } = await supabase
  .from("items")
  .select("*")
  .order("category", { ascending: true })
  .order("name", { ascending: true });

    if (!error) setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // 🔹 Update price
  const updatePrice = async (id: number, price: number) => {
    const { error } = await supabase
      .from("items")
      .update({ price })
      .eq("id", id);

    if (!error) {
      toast({ title: "Updated!" });
      fetchItems();
    }
  };

  // 🔹 Add item
  const addItem = async () => {
    if (!newName || !newCategory) return;

    const { error } = await supabase.from("items").insert([
      {
        name: newName,
        price: newPrice ? Number(newPrice) : null,
        category: newCategory,
      },
    ]);

    if (!error) {
      toast({ title: "Item Added!" });
      setNewName("");
      setNewPrice("");
      setNewCategory("");
      fetchItems();
    }
  };

  // 🔹 Delete item
  const deleteItem = async (id: number) => {
    await supabase.from("items").delete().eq("id", id);
    fetchItems();
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-4">Manage Items</h2>

      {/* ➕ Add Item */}
      <div className="bg-white p-4 rounded-xl mb-6">
        <h3 className="font-semibold mb-2">Add New Item</h3>

       <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <input
  placeholder="Name"
  value={newName}
  onChange={(e) => setNewName(e.target.value)}
  className="border p-2 rounded w-full"
/>

         <input
  placeholder="Price"
  value={newPrice}
  onChange={(e) => setNewPrice(e.target.value)}
  className="border p-2 rounded w-full"
/>

          <select
  value={newCategory}
  onChange={(e) => setNewCategory(e.target.value)}
  className="border p-2 rounded w-full"
>
  <option value="">Select Category</option>
  <option value="Men">Men</option>
  <option value="Women">Women</option>
  <option value="Household">Household</option>
</select>

          <button
            onClick={addItem}
            className="bg-primary text-white px-4 rounded w-full"
          >
            Add
          </button>
        </div>
      </div>

      {/* 📋 Items List */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
  key={item.id}
  className="bg-white rounded-2xl border border-border p-4 shadow-sm hover:shadow-md transition-all flex justify-between items-center"
>
              <div>
  <h3 className="font-semibold text-foreground">{item.name}</h3>
  <p className="text-xs text-muted-foreground mt-1">{item.category}</p>
</div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
  <input
    type="number"
    value={item.price || ""}
    onChange={(e) => {
      const newItems = items.map((i) =>
        i.id === item.id ? { ...i, price: e.target.value } : i
      );
      setItems(newItems);
    }}
    className="border p-2 rounded w-24"
  />

  <button
    onClick={() => updatePrice(item.id, Number(item.price))}
    className="bg-primary text-white px-3 py-1 rounded-lg text-sm hover:bg-primary/90"
  >
    Update
  </button>

  <button
    onClick={() => deleteItem(item.id)}
    className="text-destructive hover:text-destructive/80 font-medium text-sm"
  >
    Delete
  </button>
</div>

                
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}