import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const isDark = () => document.documentElement.classList.contains("dark");

function updateBrowserBar(dark) {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", dark ? "#0b1120" : "#ffffff");
}

function toggleTheme() {
  const root = document.documentElement;
  root.classList.add("theme-anim");

  const dark = !root.classList.contains("dark");
  root.classList.toggle("dark", dark);
  updateBrowserBar(dark);

  try {
    localStorage.setItem("theme", dark ? "dark" : "light");
  } catch {}

  window.dispatchEvent(new Event("themechange"));
  setTimeout(() => root.classList.remove("theme-anim"), 350);
}

export default function ThemeToggle({
  className = "flex h-11 w-11 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600",
}) {
  const [dark, setDark] = useState(isDark);

  useEffect(() => {
    const sync = () => setDark(isDark());
    window.addEventListener("themechange", sync);
    return () => window.removeEventListener("themechange", sync);
  }, []);

  return (
    <button
      onClick={toggleTheme}
      className={className}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}