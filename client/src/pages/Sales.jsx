import { useEffect, useState } from "react";
import { ScanLine, Trash2, Plus, Minus } from "lucide-react";
import api from "../api";
import { inr, input, btn, btnOutline, card, th, td, errorBox } from "../components/ui";
import Scanner from "../components/Scanner";

export default function Sales() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [cart, setCart] = useState([]);
  const [pick, setPick] = useState("");
  const [paymentType, setPaymentType] = useState("paid");
  const [customerId, setCustomerId] = useState("new");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [scanning, setScanning] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [p, c, s] = await Promise.all([api.get("/products"), api.get("/customers"), api.get("/sales")]);
    setProducts(p.data);
    setCustomers(c.data);
    setSales(s.data);
  };

  useEffect(() => {
    load();
  }, []);

  const addToCart = (p) => {
    setCart((c) => {
      const found = c.find((i) => i.productId === p._id);
      if (found)
        return c.map((i) =>
          i.productId === p._id ? { ...i, quantity: Math.min(i.quantity + 1, p.quantity) } : i
        );
      return [...c, { productId: p._id, name: p.name, price: p.price, quantity: 1, stock: p.quantity }];
    });
  };

  const handleScan = (code) => {
    const p = products.find((x) => x.barcode === code);
    if (!p) setNotice(`No product with barcode ${code}. Add it in Inventory first.`);
    else if (p.quantity < 1) setNotice(`${p.name} is out of stock`);
    else {
      addToCart(p);
      setNotice(`Added: ${p.name}`);
    }
  };

  const handleManualAdd = () => {
    const p = products.find((x) => x._id === pick);
    if (!p) return;
    addToCart(p);
    setPick("");
    setNotice(`Added: ${p.name}`);
  };

  const changeQty = (id, delta) =>
    setCart((c) =>
      c.map((i) =>
        i.productId === id ? { ...i, quantity: Math.min(Math.max(1, i.quantity + delta), i.stock) } : i
      )
    );

  const removeItem = (id) => setCart((c) => c.filter((i) => i.productId !== id));

  const total = cart.reduce((t, i) => t + i.price * i.quantity, 0);

  const completeSale = async () => {
    setError("");
    if (cart.length === 0) return setError("Add at least one product to the bill");
    setSaving(true);
    try {
      const { data } = await api.post("/sales/bill", {
        items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        paymentType,
        customerId,
        customerName: newName,
        customerPhone: newPhone,
      });
      setCart([]);
      setPaymentType("paid");
      setCustomerId("new");
      setNewName("");
      setNewPhone("");
      setNotice(`Bill saved for ${data.customerName}: ${inr(data.total)}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save the bill. Try again.");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Sales</h2>
        <p className="text-sm text-slate-500">Scan or pick products to build a bill, then complete the sale.</p>
      </div>

      <div className={`${card} space-y-3 p-4 sm:p-5`}>
        <h3 className="text-sm font-semibold">Add products to the bill</h3>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setScanning(true)} className={btn}>
            <ScanLine size={14} /> Scan barcode
          </button>
          <select value={pick} onChange={(e) => setPick(e.target.value)} className={`${input} flex-1 min-w-[12rem]`}>
            <option value="">No barcode? Pick a product (eggs, etc.)</option>
            {products.map((p) => (
              <option key={p._id} value={p._id} disabled={p.quantity === 0}>
                {p.name} ({inr(p.price)}, stock: {p.quantity})
              </option>
            ))}
          </select>
          <button type="button" onClick={handleManualAdd} disabled={!pick} className={btnOutline}>
            <Plus size={14} /> Add
          </button>
        </div>
        {notice && <p className="text-sm font-medium text-emerald-700">{notice}</p>}
      </div>

      {scanning && <Scanner onScan={handleScan} onClose={() => setScanning(false)} />}

      <div className={`${card} overflow-x-auto`}>
        <table className="w-full min-w-[480px]">
          <thead>
            <tr>
              <th className={th}>Item</th>
              <th className={th}>Price</th>
              <th className={th}>Qty</th>
              <th className={th}>Amount</th>
              <th className={th}></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cart.map((i) => (
              <tr key={i.productId}>
                <td className={`${td} font-medium text-slate-900`}>{i.name}</td>
                <td className={td}>{inr(i.price)}</td>
                <td className={td}>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => changeQty(i.productId, -1)} className={btnOutline} aria-label="Decrease"><Minus size={14} /></button>
                    <span className="w-6 text-center">{i.quantity}</span>
                    <button type="button" onClick={() => changeQty(i.productId, 1)} className={btnOutline} aria-label="Increase"><Plus size={14} /></button>
                  </div>
                </td>
                <td className={td}>{inr(i.price * i.quantity)}</td>
                <td className={`${td} text-right`}>
                  <button type="button" onClick={() => removeItem(i.productId)} className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label={`Remove ${i.name}`}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {cart.length === 0 && (
              <tr><td colSpan="5" className="px-4 py-8 text-center text-sm text-slate-500">The bill is empty. Scan or pick a product.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={`${card} space-y-3 p-4 sm:p-5`}>
        <div className="flex flex-wrap items-center gap-2">
          <select value={paymentType} onChange={(e) => setPaymentType(e.target.value)} className={input}>
            <option value="paid">Paid (walk-in customer)</option>
            <option value="credit">On credit (due)</option>
          </select>

          {paymentType === "credit" && (
            <>
              <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className={input}>
                <option value="new">+ New customer</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>{c.name} (due {inr(c.due)})</option>
                ))}
              </select>
              {customerId === "new" && (
                <>
                  <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Name" className={input} />
                  <input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="Phone" className={input} />
                </>
              )}
            </>
          )}
        </div>

        {error && <p className={errorBox}>{error}</p>}

        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Total: {inr(total)}</p>
          <button type="button" onClick={completeSale} disabled={saving || cart.length === 0} className={btn}>
            {saving ? "Saving..." : "Complete sale"}
          </button>
        </div>
      </div>

      <div className={`${card} overflow-x-auto`}>
        <h3 className="px-4 pt-4 text-sm font-semibold">Recent sales</h3>
        <table className="w-full min-w-[560px]">
          <thead>
            <tr>
              <th className={th}>Date</th>
              <th className={th}>Product</th>
              <th className={th}>Qty</th>
              <th className={th}>Total</th>
              <th className={th}>Customer</th>
              <th className={th}>Payment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sales.slice(0, 20).map((s) => (
              <tr key={s._id}>
                <td className={td}>{new Date(s.createdAt).toLocaleDateString()}</td>
                <td className={td}>{s.productName}</td>
                <td className={td}>{s.quantity}</td>
                <td className={td}>{inr(s.total)}</td>
                <td className={td}>{s.customerName || "-"}</td>
                <td className={td}>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.paymentType === "credit" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
                    {s.paymentType === "credit" ? "Credit" : "Paid"}
                  </span>
                </td>
              </tr>
            ))}
            {sales.length === 0 && (
              <tr><td colSpan="6" className="px-4 py-8 text-center text-sm text-slate-500">No sales yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}