import { useEffect, useState } from "react";
import api from "../api";
import { inr, input, btn, card, th, td, errorBox } from "../components/ui";

export default function Sales() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [p, s] = await Promise.all([api.get("/products"), api.get("/sales")]);
    setProducts(p.data);
    setSales(s.data);
  };

  useEffect(() => {
    load();
  }, []);

  const selected = products.find((p) => p._id === productId);
  const total = selected ? selected.price * quantity : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post("/sales", { productId, quantity });
      setProductId("");
      setQuantity(1);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not record the sale. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Sales</h2>
        <p className="text-sm text-slate-500">Record a sale and stock updates automatically.</p>
      </div>

      <form onSubmit={handleSubmit} className={`${card} space-y-3 p-4 sm:p-5`}>
        <h3 className="text-sm font-semibold">New sale</h3>
        {error && <p className={errorBox}>{error}</p>}
        <div className="grid gap-3 sm:grid-cols-[1fr_7rem_9rem_auto] sm:items-center">
          <select value={productId} onChange={(e) => setProductId(e.target.value)} required className={input}>
            <option value="">Select product</option>
            {products.map((p) => (
              <option key={p._id} value={p._id} disabled={p.quantity === 0}>
                {p.name} ({inr(p.price)}, stock: {p.quantity})
              </option>
            ))}
          </select>
          <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className={input} aria-label="Quantity" />
          <p className="text-lg font-semibold text-slate-900 sm:text-center">{inr(total)}</p>
          <button disabled={saving} className={btn}>{saving ? "Saving..." : "Record sale"}</button>
        </div>
      </form>

      <div className={`${card} overflow-x-auto`}>
        <table className="w-full min-w-[420px]">
          <thead>
            <tr>
              <th className={th}>Date</th>
              <th className={th}>Product</th>
              <th className={th}>Qty</th>
              <th className={`${th} text-right`}>Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sales.map((s) => (
              <tr key={s._id}>
                <td className={td}>{new Date(s.createdAt).toLocaleDateString("en-IN")}</td>
                <td className={`${td} font-medium text-slate-900`}>{s.productName}</td>
                <td className={td}>{s.quantity}</td>
                <td className={`${td} text-right font-medium text-slate-900`}>{inr(s.total)}</td>
              </tr>
            ))}
            {sales.length === 0 && (
              <tr><td colSpan="4" className="px-4 py-10 text-center text-sm text-slate-500">No sales yet. Record your first sale above.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}