import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import api from "../api";
import { inr, input, btn, card, th, td, errorBox } from "../components/ui";
import { useLang } from "../i18n";

const categories = ["rent", "electricity", "salary", "stock", "transport", "other"];
const today = () => new Date().toLocaleDateString("en-CA");

export default function Expenses() {
  const { t, locale } = useLang();
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ title: "", category: "rent", amount: "", date: today() });
  const [error, setError] = useState("");

  const load = async () => {
    const { data } = await api.get("/expenses");
    setList(data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/expenses", form);
      setForm({ ...form, title: "", amount: "" });
      load();
    } catch (err) {
      setError(err.response?.data?.message || t("genericError"));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t("confirmDelete"))) return;
    await api.delete(`/expenses/${id}`);
    load();
  };

  const now = new Date();
  const monthTotal = list
    .filter((x) => {
      const d = new Date(x.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, x) => sum + x.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{t("expenses")}</h2>
        <p className="text-sm text-slate-500">{t("expensesSub")}</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <p className="text-sm text-slate-500">{t("thisMonthTotal")}</p>
        <p className="mt-1 text-2xl font-semibold text-red-600">{inr(monthTotal)}</p>
      </div>

      <form onSubmit={handleSubmit} className={`${card} space-y-3 p-4 sm:p-5`}>
        <h3 className="text-sm font-semibold">{t("addExpense")}</h3>
        {error && <p className={errorBox}>{error}</p>}
        <div className="grid gap-3 sm:grid-cols-[1fr_11rem_8rem_10rem_auto]">
          <input name="title" value={form.title} onChange={handleChange} placeholder={t("whatFor")} required className={input} />
          <select name="category" value={form.category} onChange={handleChange} className={input} aria-label={t("category")}>
            {categories.map((c) => (
              <option key={c} value={c}>{t("cat_" + c)}</option>
            ))}
          </select>
          <input name="amount" type="number" min="1" value={form.amount} onChange={handleChange} placeholder={t("amount")} required className={input} />
          <input name="date" type="date" value={form.date} onChange={handleChange} required className={input} />
          <button className={btn}>{t("add")}</button>
        </div>
      </form>

      <div className={`${card} overflow-x-auto`}>
        <table className="w-full min-w-[480px]">
          <thead>
            <tr>
              <th className={th}>{t("date")}</th>
              <th className={th}>{t("whatFor")}</th>
              <th className={th}>{t("category")}</th>
              <th className={th}>{t("amount")}</th>
              <th className={th}></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map((x) => (
              <tr key={x._id}>
                <td className={td}>{new Date(x.date).toLocaleDateString(locale)}</td>
                <td className={`${td} font-medium text-slate-900`}>{x.title}</td>
                <td className={td}>{t("cat_" + x.category)}</td>
                <td className={td}>{inr(x.amount)}</td>
                <td className={`${td} text-right`}>
                  <button onClick={() => handleDelete(x._id)} className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Delete">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td colSpan="5" className="px-4 py-10 text-center text-sm text-slate-500">{t("noExpenses")}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}