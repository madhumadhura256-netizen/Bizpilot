import { useEffect, useState } from "react";
import api from "../api";

const Card = ({ label, value, color }) => (
  <div className="bg-white p-4 rounded shadow">
    <p className="text-gray-500 text-sm">{label}</p>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </div>
);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    api.get("/dashboard").then((res) => setData(res.data));
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Welcome, {user.name}</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card label="Today's Sales" value={`₹${data.todaySales}`} color="text-green-600" />
        <Card label="Total Sales" value={`₹${data.totalSales}`} color="text-blue-600" />
        <Card label="Total Due" value={`₹${data.totalDue}`} color="text-red-600" />
        <Card label="Products" value={data.totalProducts} color="text-gray-800" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Low Stock (5 or less)</h3>
          {data.lowStock.length === 0 && <p className="text-gray-500">All good</p>}
          {data.lowStock.map((p) => (
            <p key={p._id} className="flex justify-between border-t py-1">
              <span>{p.name}</span>
              <span className="text-red-600 font-semibold">{p.quantity}</span>
            </p>
          ))}
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Recent Sales</h3>
          {data.recentSales.length === 0 && <p className="text-gray-500">No sales yet</p>}
          {data.recentSales.map((s) => (
            <p key={s._id} className="flex justify-between border-t py-1">
              <span>{s.productName} × {s.quantity}</span>
              <span>₹{s.total}</span>
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}