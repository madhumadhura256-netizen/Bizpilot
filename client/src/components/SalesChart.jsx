import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import api from "../api";
import { inr, card } from "./ui";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const label = (key, period) => {
  if (period === "year") return key;
  const [y, m, d] = key.split("-");
  if (period === "month") return `${months[+m - 1]} ${y.slice(2)}`;
  return `${+d} ${months[+m - 1]}`;
};

const tabs = [
  { id: "day", text: "Daily", now: "Today", before: "Yesterday", sub: "Last 30 days" },
  { id: "month", text: "Monthly", now: "This month", before: "Last month", sub: "Last 12 months" },
  { id: "year", text: "Yearly", now: "This year", before: "Last year", sub: "Last 5 years" },
];

export default function SalesChart() {
  const [period, setPeriod] = useState("day");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get(`/dashboard/trend?period=${period}`)
      .then((res) => setData(res.data.map((r) => ({ ...r, name: label(r.key, period) }))))
      .catch(() => setError("Could not load the sales chart."))
      .finally(() => setLoading(false));
  }, [period]);

  const tab = tabs.find((t) => t.id === period);
  const current = data.length ? data[data.length - 1].total : 0;
  const previous = data.length > 1 ? data[data.length - 2].total : 0;
  const change = previous > 0 ? ((current - previous) / previous) * 100 : null;
  const up = current >= previous;

  return (
    <div className={`${card} p-4 sm:p-5`}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Sales trend</h3>
          <p className="text-xs text-slate-500">{tab.sub}</p>
        </div>
        <div className="inline-flex rounded-lg border border-slate-200 p-0.5">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setPeriod(t.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                period === t.id ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {t.text}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 p-3">
          <p className="text-xs text-slate-500">{tab.now}</p>
          <p className="text-lg font-semibold">{inr(current)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-3">
          <p className="text-xs text-slate-500">{tab.before}</p>
          <p className="text-lg font-semibold">{inr(previous)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-3">
          <p className="text-xs text-slate-500">Change</p>
          {change === null ? (
            <p className="text-lg font-semibold text-slate-400">-</p>
          ) : (
            <p className={`flex items-center gap-1 text-lg font-semibold ${up ? "text-emerald-600" : "text-red-600"}`}>
              {up ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
              {Math.abs(change).toFixed(1)}%
            </p>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading && !error && <p className="py-16 text-center text-sm text-slate-500">Loading chart...</p>}

      {!loading && !error && (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.25} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
              />
              <Tooltip
                cursor={{ fill: "#6366f1", fillOpacity: 0.08 }}
                formatter={(v) => [inr(v), "Sales"]}
                contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
              />
              <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                {data.map((_, i) => (
                  <Cell key={i} fill={i === data.length - 1 ? "#6366f1" : "#a5b4fc"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}