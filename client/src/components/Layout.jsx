import { NavLink, Outlet, useNavigate } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/sales", label: "Sales" },
  { to: "/inventory", label: "Inventory" },
  { to: "/customers", label: "Customers & Dues" },
  { to: "/assistant", label: "AI Assistant" },
];

export default function Layout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-56 bg-blue-900 text-white p-4 flex flex-col">
        <h1 className="text-xl font-bold mb-6">BizPilot</h1>
        <nav className="flex-1 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `block px-3 py-2 rounded ${isActive ? "bg-blue-700" : "hover:bg-blue-800"}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <p className="text-sm mb-2">{user.name}</p>
        <button onClick={logout} className="bg-red-500 py-2 rounded">Logout</button>
      </aside>
      <main className="flex-1 p-6"><Outlet /></main>
    </div>
  );
}