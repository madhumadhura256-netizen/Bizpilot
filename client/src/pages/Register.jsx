import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/register", form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center">Register</h1>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <input name="name" placeholder="Name" onChange={handleChange} className="w-full border p-2 rounded" />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} className="w-full border p-2 rounded" />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} className="w-full border p-2 rounded" />
        <button className="w-full bg-blue-600 text-white p-2 rounded">Register</button>
        <p className="text-sm text-center">
          Have an account? <Link to="/login" className="text-blue-600">Login</Link>
        </p>
      </form>
    </div>
  );
}