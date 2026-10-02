import { useState } from "react";
import api from "../api";

const suggestions = [
  "What are my low stock items?",
  "Who owes me the most money?",
  "Which product sells the most?",
];

export default function Assistant() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const ask = async (q) => {
    if (!q.trim() || loading) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setQuestion("");
    setLoading(true);
    try {
      const { data } = await api.post("/assistant", { question: q });
      setMessages((m) => [...m, { role: "ai", text: data.answer }]);
    } catch (err) {
      setMessages((m) => [...m, { role: "ai", text: err.response?.data?.message || "Something went wrong" }]);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-4">AI Business Assistant</h2>

      <div className="flex flex-wrap gap-2 mb-4">
        {suggestions.map((s) => (
          <button key={s} onClick={() => ask(s)} className="bg-white border px-3 py-1 rounded text-sm hover:bg-gray-50">
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white rounded shadow p-4 h-96 overflow-y-auto space-y-3 mb-3">
        {messages.length === 0 && <p className="text-gray-500">Ask anything about your business.</p>}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : ""}>
            <p className={`inline-block px-3 py-2 rounded whitespace-pre-wrap ${m.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100"}`}>
              {m.text}
            </p>
          </div>
        ))}
        {loading && <p className="text-gray-500">Thinking...</p>}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); ask(question); }} className="flex gap-2">
        <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Type your question" className="border p-2 rounded flex-1" />
        <button className="bg-blue-600 text-white px-4 rounded">Ask</button>
      </form>
    </div>
  );
}