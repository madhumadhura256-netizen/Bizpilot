import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell, LabelList } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import api from "../api";
import { inr, card } from "./ui";
import { useLang } from "../i18n";

const label = (key, period, locale) => {
  if (period === "year") return key;
  const [y, m, d] = key.split("-");
  const date = new Date(Date.UTC(+y, +m - 1, +(d || 1)));
  return date.toLocaleDateString(
    locale,
    period === "month"
      ? { month: "short", year: "2-digit", timeZone: "UTC" }
      : { day: "numeric", month: "short", timeZone: "UTC" }
  );
};

const short = (v) => {
  const a = Math.abs(v);
  const s = a >= 100000 ? `${(a / 100000).toFixed(1)}L` : a >= 1000 ? `${(a / 1000).toFixed(1)}k` : a;
  return v < 0 ? `-${s}` : s;
};

const periods = [
  { id: "day", text: "daily", now: "today", before: "yesterday", sub: "last30" },
  { id: "month", text: "monthly", now: "thisMonth", before: "lastMonth", sub: "last12" },
  { id: "year", text: "yearly", now: "thisYear", before: "lastYear", sub: "last5" },
];
const metrics = ["sales", "expenses", "profit"];
const colors = { sales: "#4f46e5", expenses: "#e11d48", profit: "#059669" };

export default function SalesChart() {
  const { t, locale } = useLang();
  const [period, setPeriod] = useState("day");
  const [metric, setMetric] = useState("sales");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get(`/dashboard/trend?period=${period}`)
      .then((res) => setData(res.data.map((r) => ({ ...r, name: label(r.key, period, locale) }))))
      .catch(() => setError(t("chartError")))
      .finally(() => setLoading(false));
  }, [period, locale]);

  const p = periods.find((x) => x.id === period);
  const values = data.map((r) => r[metric]);
  const current = values.length ? values[values.length - 1] : 0;
  const previous = values.length > 1 ? values[values.length - 2] : 0;
  const change = previous !== 0 ? ((current - previous) / Math.abs(previous)) * 100 : null;
  const good = metric === "expenses" ? current <= previous : current >= previous;
  const barColor = (v, i) =>
    i === data.length - 1 ? "#f59e0b" : metric === "profit" && v < 0 ? "#dc2626" : colors[metric];

  const tabBtn = (active) =>
    `rounded-md px-4 py-2 text-sm font-semibold transition ${
      active ? "bg-indigo-600 text-white" : "text-slate-600 hover:text-slate-900"
    }`;

  return (
    <div className={`${card} p-4 sm:p-6`}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{t("trend")}</h3>
          <p className="text-sm text-slate-500">{t(p.sub)}</p>
        </div>
        <div className="inline-flex rounded-lg border border-slate-300 p-1">
          {periods.map((x) => (
            <button key={x.id} type="button" onClick={() => setPeriod(x.id)} className={tabBtn(period === x.id)}>
              {t(x.text)}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 inline-flex rounded-lg border border-slate-300 p-1">
        {metrics.map((m) => (
          <button key={m} type="button" onClick={() => setMetric(m)} className={tabBtn(metric === m)}>
            {t(m)}
          </button>
        ))}
      </div>
      {metric === "profit" && <p className="mb-3 text-xs text-slate-500">{t("profitNote")}</p>}

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-300 p-4">
          <p className="text-sm font-medium text-slate-500">{t(p.now)}</p>
          <p className="text-2xl font-bold">{inr(current)}</p>
        </div>
        <div className="rounded-lg border border-slate-300 p-4">
          <p className="text-sm font-medium text-slate-500">{t(p.before)}</p>
          <p className="text-2xl font-bold">{inr(previous)}</p>
        </div>
        <div className="rounded-lg border border-slate-300 p-4">
          <p className="text-sm font-medium text-slate-500">{t("change")}</p>
          {change === null ? (
            <p className="text-2xl font-bold text-slate-400">-</p>
          ) : (
            <p className={`flex items-center gap-1.5 text-2xl font-bold ${good ? "text-emerald-600" : "text-red-600"}`}>
              {current >= previous ? <TrendingUp size={22} /> : <TrendingDown size={22} />}
              {Math.abs(change).toFixed(1)}%
            </p>
          )}
        </div>
      </div>

      {error && <p className="text-base text-red-600">{error}</p>}
      {loading && !error && <p className="py-20 text-center text-base text-slate-500">{t("loading")}</p>}

      {!loading && !error && (
        <div className="h-80 w-full text-slate-600 dark:text-slate-300">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 24, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.2} vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "currentColor", fontSize: 13, fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: "currentColor", strokeOpacity: 0.3 }}
                interval={period === "day" ? 2 : 0}
              />
              <YAxis
                width={52}
                tick={{ fill: "currentColor", fontSize: 13, fontWeight: 500 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={short}
              />
              <Tooltip
                cursor={{ fill: "#4f46e5", fillOpacity: 0.1 }}
                formatter={(v) => [inr(v), t(metric)]}
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                  fontSize: 15,
                  fontWeight: 600,
                  backgroundColor: "#ffffff",
                  color: "#0f172a",
                }}
              />
              <Bar dataKey={metric} radius={[6, 6, 0, 0]} maxBarSize={48}>
                {data.map((r, i) => (
                  <Cell key={i} fill={barColor(r[metric], i)} />
                ))}
                {period !== "day" && (
                  <LabelList
                    dataKey={metric}
                    position="top"
                    formatter={short}
                    style={{ fill: "currentColor", fontSize: 13, fontWeight: 600 }}
                  />
                )}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}