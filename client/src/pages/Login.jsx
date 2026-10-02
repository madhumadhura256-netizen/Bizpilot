import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import AuthLayout, { inputClass, buttonClass } from "../components/AuthLayout";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Could not reach the server. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to manage your business">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input id="email" name="email" type="email" required placeholder="you@example.com" onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">Password</label>
          <input id="password" name="password" type="password" required placeholder="Your password" onChange={handleChange} className={inputClass} />
        </div>
        <button disabled={loading} className={buttonClass}>{loading ? "Logging in..." : "Log in"}</button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-500">
        New to BizPilot?{" "}
        <Link to="/register" className="font-medium text-teal-700 hover:underline">Create an account</Link>
      </p>
    </AuthLayout>
  );
}