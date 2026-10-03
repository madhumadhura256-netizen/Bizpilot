import { useEffect, useState } from "react";
import { Pencil, Trash2, ScanLine } from "lucide-react";
import api from "../api";
import { inr, input, btn, btnOutline, card, th, td, errorBox } from "../components/ui";
import Scanner from "../components/Scanner";

const empty = { name: "", price: "", quantity: "", barcode: "" };

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [scanMode, setScanMode] = useState("");   // "" | "form" | "restock"
  const [notice, setNotice] = useState("");

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
    setError("");
    try {
      if (editId) await api.put(`/products/${editId}`, form);
      else await api.post("/products", form);
      setForm(empty);
      setEditId(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save the product. Try again.");
    }
  };

  const handleEdit = (p) => {
    setEditId(p._id);
    setForm({ name: p.name, price: p.price, quantity: p.quantity, barcode: p.barcode || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm(empty);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    await api.delete(`/products/${id}`);
    load();
  };

  const handleScan = async (code) => {
    if (scanMode === "form") {
      setForm((f) => ({ ...f, barcode: code }));
      setScanMode("");
      return;
    }
    // restock mode: +1 stock per scan, camera stays open
    try {
      const { data } = await api.put(`/products/barcode/${encodeURIComponent(code)}/add`, { quantity: 1 });
      setNotice(`${data.name}: stock is now ${data.quantity}`);
      load();
    } catch (err) {
      setNotice(err.response?.data?.message || "Scan failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Inventory</h2>
          <p className="text-sm text-slate-500">Add products and keep track of your stock.</p>
        </div>
        <button type="button" onClick={() => { setNotice(""); setScanMode("restock"); }} className={btn}>
          <ScanLine size={14} /> Scan to restock
        </button>
      </div>

      {scanMode && (
        <div>
          <Scanner onScan={handleScan} onClose={() => setScanMode("")} />
          {scanMode === "restock" && notice && (
            <p className="-mt-2 mb-2 text-sm font-medium text-emerald-700">{notice}</p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className={`${card} space-y-3 p-4 sm:p-5`}>
        <h3 className="text-sm font-semibold">{editId ? "Edit product" : "Add a product"}</h3>
        {error && <p className={errorBox}>{error}</p>}

        <div className="grid gap-3 sm:grid-cols-[1fr_8rem_8rem]">
          <input name="name" value={form.name} onChange={handleChange} placeholder="Product name" required className={input} />
          <input name="price" type="number" min="0" value={form.price} onChange={handleChange} placeholder="Price (₹)" required className={input} />
          <input name="quantity" type="number" min="0" value={form.quantity} onChange={handleChange} placeholder="Quantity" required className={input} />
        </div>

        <div className="flex flex-wrap gap-2">
          <input name="barcode" value={form.barcode} onChange={handleChange} placeholder="Barcode (optional)" className={`${input} flex-1 min-w-[10rem]`} />
          <button type="button" onClick={() => setScanMode("form")} className={btnOutline}>
            <ScanLine size={14} /> Scan barcode
          </button>
          <button className={btn}>{editId ? "Save changes" : "Add product"}</button>
          {editId && <button type="button" onClick={cancelEdit} className={btnOutline}>Cancel</button>}
        </div>
      </form>

      <div className={`${card} overflow-x-auto`}>
        <table className="w-full min-w-[480px]">
          <thead>
            <tr>
              <th className={th}>Product</th>
              <th className={th}>Barcode</th>
              <th className={th}>Price</th>
              <th className={th}>Stock</th>
              <th className={`${th} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => (
              <tr key={p._id}>
                <td className={`${td} font-medium text-slate-900`}>{p.name}</td>
                <td className={td}>{p.barcode || "-"}</td>
                <td className={td}>{inr(p.price)}</td>
                <td className={td}>
                  {p.quantity <= 5 ? (
                    <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">{p.quantity} left</span>
                  ) : (
                    p.quantity
                  )}
                </td>
                <td className={`${td} text-right`}>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(p)} className={btnOutline} aria-label={`Edit ${p.name}`}><Pencil size={14} /> Edit</button>
                    <button onClick={() => handleDelete(p._id)} className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500" aria-label={`Delete ${p.name}`}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan="5" className="px-4 py-10 text-center text-sm text-slate-500">No products yet. Add your first product above.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}