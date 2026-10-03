import { useEffect, useState } from "react";
import api from "../api";
import SalesChart from "../components/SalesChart";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const Stat = ({ label, value, tone = "text-slate-900" }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
    <p className="text-sm text-slate-500">{label}</p>
    <p className={`mt-1 text-2xl font-semibold tracking-tight ${tone}`}>{value}</p>
  </div>
);

const Panel = ({ title, children }) => (
  <section className="rounded-xl border border-slate-200 bg-white">
    <h3 className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-900">{title}</h3>
    <div className="px-5 py-2">{children}</div>
  </section>
);

const Skeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="h-8 w-56 rounded bg-slate-200" />
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-slate-200" />)}
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      <div className="h-48 rounded-xl bg-slate-200" />
      <div className="h-48 rounded-xl bg-slate-200" />
    </div>
  </div>
);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    api.get("/dashboard")
      .then((res) => setData(res.data))
      .catch(() => setError("Could not load the dashboard. Refresh to try again."));
  }, []);

  if (error) return <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>;
  if (!data) return <Skeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Welcome, {user.name}</h2>
        <p className="text-sm text-slate-500">Here is how your business is doing.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Today's sales" value={inr(data.todaySales)} tone="text-teal-700" />
        <Stat label="Total sales" value={inr(data.totalSales)} />
        <Stat label="Total due" value={inr(data.totalDue)} tone="text-red-600" />
        <Stat label="Products" value={data.totalProducts} />
      </div>

      <SalesChart />

      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Low stock (5 or fewer)">
          {data.lowStock.length === 0 && <p className="py-4 text-sm text-slate-500">Every product is well stocked.</p>}
          {data.lowStock.map((p) => (
            <div key={p._id} className="flex items-center justify-between border-b border-slate-100 py-3 text-sm last:border-0">
              <span className="text-slate-700">{p.name}</span>
              <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">{p.quantity} left</span>
            </div>
          ))}
        </Panel>

        <Panel title="Recent sales">
          {data.recentSales.length === 0 && <p className="py-4 text-sm text-slate-500">No sales yet. Record your first sale to see it here.</p>}
          {data.recentSales.map((s) => (
            <div key={s._id} className="flex items-center justify-between border-b border-slate-100 py-3 text-sm last:border-0">
              <span className="text-slate-700">{s.productName} <span className="text-slate-400">× {s.quantity}</span></span>
              <span className="font-medium text-slate-900">{inr(s.total)}</span>
            </div>
          ))}
        </Panel>
      </div>
    </div>
  );
}