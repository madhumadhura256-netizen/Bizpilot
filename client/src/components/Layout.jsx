import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, ShoppingCart, Package, Users, Bot, LogOut, Menu, X } from "lucide-react";
import Themetoggle from "./Themetoggle";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/sales", label: "Sales", icon: ShoppingCart },
  { to: "/inventory", label: "Inventory", icon: Package },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/assistant", label: "Assistant", icon: Bot },
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const sidebar = (
    <div className="flex h-full flex-col bg-slate-900 text-slate-300">
      <div className="flex h-16 items-center gap-2 px-5 text-lg font-semibold text-white">
        <span className="grid h-8 w-8 place-items-center rounded-md bg-teal-600 text-sm font-bold">B</span>
        BizPilot
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
                isActive ? "bg-slate-800 text-white" : "hover:bg-slate-800/60 hover:text-white"
              }`
            }
          >
            <Icon size={18} /> {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <p className="truncate text-sm font-medium text-white">{user.name}</p>
        <p className="truncate text-xs text-slate-400">{user.email}</p>

        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={logout}
            className="flex flex-1 items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          >
            <LogOut size={16} /> Log out
          </button>

          <Themetoggle className="flex h-10 w-10 items-center justify-center rounded-md text-slate-300 hover:bg-slate-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 lg:block">{sidebar}</aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64">{sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-60">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            className="flex h-11 w-11 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>

          <span className="font-semibold">BizPilot</span>

          <Themetoggle />
        </header>

        <main className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}