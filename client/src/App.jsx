import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Placeholder from "./pages/Placeholder";
import Layout from "./components/Layout";
import Sales from "./pages/Sales";   // add with the other imports
import Customers from "./pages/Customers";   // add with the other imports
import Assistant from "./pages/Assistant";   // add with the other imports
import Expenses from "./pages/Expenses";   // with the imports



const Protected = ({ children }) =>
  localStorage.getItem("token") ? children : <Navigate to="/login" />;

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Protected><Layout /></Protected>}>
        <Route index element={<Dashboard />} />
       <Route path="sales" element={<Sales />} />   // replaces the Sales Placeholder line
        <Route path="inventory" element={<Inventory />} />
        <Route path="customers" element={<Customers />} />   // replaces the Customers placeholder line
       <Route path="assistant" element={<Assistant />} />   // replaces the Assistant placeholder line
       <Route path="expenses" element={<Expenses />} />   // with the other routes
      </Route>
    </Routes>
  );
}