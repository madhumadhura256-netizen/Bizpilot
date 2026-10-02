import { useEffect, useState } from "react";
import api from "../api";

export default function Sales() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");

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
    try {
      await api.post("/sales", { productId, quantity });
      setProductId("");
      setQuantity(1);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Sales</h2>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow flex gap-2 items-center mb-2">
        <select value={productId} onChange={(e) => setProductId(e.target.value)} required className="border p-2 rounded flex-1">
          <option value="">Select product</option>
          {products.map((p) => (
            <option key={p._id} value={p._id} disabled={p.quantity === 0}>
              {p.name} (₹{p.price}, stock: {p.quantity})
            </option>
          ))}
        </select>
        <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="border p-2 rounded w-24" />
        <span className="w-28 font-semibold">₹{total}</span>
        <button className="bg-green-600 text-white px-4 py-2 rounded">Sell</button>
      </form>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      <table className="w-full bg-white rounded shadow text-left mt-4">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2">Date</th>
            <th className="p-2">Product</th>
            <th className="p-2">Qty</th>
            <th className="p-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((s) => (
            <tr key={s._id} className="border-t">
              <td className="p-2">{new Date(s.createdAt).toLocaleDateString()}</td>
              <td className="p-2">{s.productName}</td>
              <td className="p-2">{s.quantity}</td>
              <td className="p-2">₹{s.total}</td>
            </tr>
          ))}
          {sales.length === 0 && (
            <tr><td colSpan="4" className="p-4 text-center text-gray-500">No sales yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}