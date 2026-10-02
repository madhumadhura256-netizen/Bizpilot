import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import api from "../api";
import { inr, input, btn, card, th, td, errorBox } from "../components/ui";

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
      setError(err.response?.data?.message || "Could not update the due. Try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this customer?")) return;
    await api.delete(`/customers/${id}`);
    load();
  };

  const totalDue = customers.reduce((sum, c) => sum + c.due, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Customers and dues</h2>
          <p className="text-sm text-slate-500">Track who owes you and what they have paid.</p>
        </div>
        <div className={`${card} px-4 py-2`}>
          <p className="text-xs text-slate-500">Total due</p>
          <p className="text-lg font-semibold text-red-600">{inr(totalDue)}</p>
        </div>
      </div>

      <form onSubmit={handleAdd} className={`${card} space-y-3 p-4 sm:p-5`}>
        <h3 className="text-sm font-semibold">Add a customer</h3>
        <div className="grid gap-3 sm:grid-cols-[1fr_12rem_auto]">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Customer name" required className={input} />
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className={input} />
          <button className={btn}>Add customer</button>
        </div>
      </form>

      {error && <p className={errorBox}>{error}</p>}

      <div className={`${card} overflow-x-auto`}>
        <table className="w-full min-w-[640px]">
          <thead>
            <tr>
              <th className={th}>Name</th>
              <th className={th}>Phone</th>
              <th className={th}>Due</th>
              <th className={th}>Update due</th>
              <th className={th}></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((c) => (
              <tr key={c._id}>
                <td className={`${td} font-medium text-slate-900`}>{c.name}</td>
                <td className={td}>{c.phone || "-"}</td>
                <td className={td}>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${c.due > 0 ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
                    {c.due > 0 ? inr(c.due) : "Settled"}
                  </span>
                </td>
                <td className={td}>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="Amount"
                      value={amounts[c._id] || ""}
                      onChange={(e) => setAmounts({ ...amounts, [c._id]: e.target.value })}
                      className={`${input} !w-24 !py-1.5`}
                      aria-label={`Amount for ${c.name}`}
                    />
                    <button onClick={() => updateDue(c._id, "add")} className="rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">Add due</button>
                    <button onClick={() => updateDue(c._id, "pay")} className="rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-sm font-medium text-emerald-800 hover:bg-emerald-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">Mark paid</button>
                  </div>
                </td>
                <td className={`${td} text-right`}>
                  <button onClick={() => handleDelete(c._id)} className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500" aria-label={`Delete ${c.name}`}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr><td colSpan="5" className="px-4 py-10 text-center text-sm text-slate-500">No customers yet. Add your first customer above.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}