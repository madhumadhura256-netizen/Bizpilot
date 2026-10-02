import { useEffect, useState } from "react";
import api from "../api";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [amounts, setAmounts] = useState({});
  const [error, setError] = useState("");

  const load = async () => {
    const { data } = await api.get("/customers");
    setCustomers(data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await api.post("/customers", form);
    setForm({ name: "", phone: "" });
    load();
  };

  const updateDue = async (id, type) => {
    setError("");
    try {
      await api.put(`/customers/${id}/due`, { amount: amounts[id], type });
      setAmounts({ ...amounts, [id]: "" });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this customer?")) return;
    await api.delete(`/customers/${id}`);
    load();
  };

  const totalDue = customers.reduce((sum, c) => sum + c.due, 0);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Customers & Dues</h2>

      <form onSubmit={handleAdd} className="bg-white p-4 rounded shadow flex gap-2 mb-2">
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Customer name" required className="border p-2 rounded flex-1" />
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="border p-2 rounded w-40" />
        <button className="bg-blue-600 text-white px-4 rounded">Add</button>
      </form>

      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <p className="mb-2 font-semibold">Total Due: ₹{totalDue}</p>

      <table className="w-full bg-white rounded shadow text-left">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2">Name</th>
            <th className="p-2">Phone</th>
            <th className="p-2">Due</th>
            <th className="p-2">Update Due</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c._id} className="border-t">
              <td className="p-2">{c.name}</td>
              <td className="p-2">{c.phone}</td>
              <td className={`p-2 font-semibold ${c.due > 0 ? "text-red-600" : "text-green-600"}`}>₹{c.due}</td>
              <td className="p-2 flex gap-1">
                <input
                  type="number"
                  min="1"
                  placeholder="Amount"
                  value={amounts[c._id] || ""}
                  onChange={(e) => setAmounts({ ...amounts, [c._id]: e.target.value })}
                  className="border p-1 rounded w-24"
                />
                <button onClick={() => updateDue(c._id, "add")} className="bg-orange-500 text-white px-2 rounded">+ Due</button>
                <button onClick={() => updateDue(c._id, "pay")} className="bg-green-600 text-white px-2 rounded">Paid</button>
              </td>
              <td className="p-2">
                <button onClick={() => handleDelete(c._id)} className="text-red-600">Delete</button>
              </td>
            </tr>
          ))}
          {customers.length === 0 && (
            <tr><td colSpan="5" className="p-4 text-center text-gray-500">No customers yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}