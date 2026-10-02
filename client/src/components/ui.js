export const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export const input =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20";

export const btn =
  "inline-flex items-center justify-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

export const btnOutline =
  "inline-flex items-center justify-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600";

export const card = "rounded-xl border border-slate-200 bg-white";
export const th = "bg-slate-50 px-4 py-3 text-left text-xs font-medium text-slate-500";
export const td = "px-4 py-3 text-sm text-slate-700";
export const errorBox = "rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700";