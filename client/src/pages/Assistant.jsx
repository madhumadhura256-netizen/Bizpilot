import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import api from "../api";
import { input, btn } from "../components/ui";

const suggestions = [
  "What are my low stock items?",
  "Who owes me the most money?",
  "Which product sells the most?",
];

export default function Assistant() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const ask = async (q) => {
    if (!q.trim() || loading) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setQuestion("");
    setLoading(true);
    try {
      const { data } = await api.post("/assistant", { question: q });
      setMessages((m) => [...m, { role: "ai", text: data.answer }]);
    } catch (err) {
      setMessages((m) => [...m, { role: "ai", text: err.response?.data?.message || "I could not answer that. Try again." }]);
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto flex h-[calc(100dvh-8rem)] max-w-3xl flex-col lg:h-[calc(100dvh-4rem)]">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold tracking-tight">Assistant</h2>
        <p className="text-sm text-slate-500">Ask questions about your stock, sales and dues.</p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto rounded-xl border border-slate-200 bg-white p-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-slate-500">Try one of these to get started</p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((s) => (
                <button key={s} onClick={() => ask(s)} className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:border-teal-600 hover:text-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <p className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.role === "user" ? "rounded-br-sm bg-teal-600 text-white" : "rounded-bl-sm bg-slate-100 text-slate-800"}`}>
              {m.text}
            </p>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <p className="rounded-2xl rounded-bl-sm bg-slate-100 px-4 py-2.5 text-sm text-slate-500">Thinking...</p>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); ask(question); }} className="mt-3 flex gap-2">
        <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask about your business" className={input} />
        <button disabled={loading || !question.trim()} className={btn} aria-label="Send"><Send size={16} /><span className="hidden sm:inline">Ask</span></button>
      </form>
    </div>
  );
}