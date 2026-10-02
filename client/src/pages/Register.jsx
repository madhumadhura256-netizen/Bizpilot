import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import AuthLayout, { inputClass, buttonClass } from "../components/AuthLayout";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", form);
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
    <AuthLayout title="Create your account" subtitle="Start tracking sales, stock and customers">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">Name</label>
          <input id="name" name="name" required placeholder="Your name" onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input id="email" name="email" type="email" required placeholder="you@example.com" onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">Password</label>
          <input id="password" name="password" type="password" required placeholder="Choose a password" onChange={handleChange} className={inputClass} />
        </div>
        <button disabled={loading} className={buttonClass}>{loading ? "Creating account..." : "Create account"}</button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-teal-700 hover:underline">Log in</Link>
      </p>
    </AuthLayout>
  );
}