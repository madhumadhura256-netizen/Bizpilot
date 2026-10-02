import { useEffect, useState } from "react";
import api from "../api";

const empty = { name: "", price: "", quantity: "" };

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);

  const load = async () => {
    const { data } = await api.get("/products");
    setProducts(data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) await api.put(`/products/${editId}`, form);
    else await api.post("/products", form);
    setForm(empty);
    setEditId(null);
    load();
  };

  const handleEdit = (p) => {
    setEditId(p._id);
    setForm({ name: p.name, price: p.price, quantity: p.quantity });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    await api.delete(`/products/${id}`);
    load();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Inventory</h2>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow flex gap-2 mb-6">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Product name" required className="border p-2 rounded flex-1" />
        <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="Price" required className="border p-2 rounded w-28" />
        <input name="quantity" type="number" value={form.quantity} onChange={handleChange} placeholder="Qty" required className="border p-2 rounded w-24" />
        <button className="bg-blue-600 text-white px-4 rounded">{editId ? "Update" : "Add"}</button>
      </form>

      <table className="w-full bg-white rounded shadow text-left">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2">Name</th>
            <th className="p-2">Price</th>
            <th className="p-2">Stock</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id} className="border-t">
              <td className="p-2">{p.name}</td>
              <td className="p-2">₹{p.price}</td>
              <td className={`p-2 ${p.quantity <= 5 ? "text-red-600 font-semibold" : ""}`}>{p.quantity}</td>
              <td className="p-2 space-x-2">
                <button onClick={() => handleEdit(p)} className="text-blue-600">Edit</button>
                <button onClick={() => handleDelete(p._id)} className="text-red-600">Delete</button>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr><td colSpan="4" className="p-4 text-center text-gray-500">No products yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}