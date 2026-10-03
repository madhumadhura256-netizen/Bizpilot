import { useEffect, useRef, useState } from "react";
import { Sparkles, SendHorizontal, Trash2, User, Package, Wallet, TrendingUp, AlertTriangle } from "lucide-react";
import api from "../api";
import { input, btn, btnOutline, card } from "../components/ui";

const suggestions = [
  { icon: AlertTriangle, title: "Low stock", text: "Which products have stock of 5 or less?" },
  { icon: Wallet, title: "Pending dues", text: "Who owes me the most money?" },
  { icon: TrendingUp, title: "Best sellers", text: "Which product sells the most?" },
  { icon: Package, title: "Sales summary", text: "Give me a summary of my sales." },
];

// Turns **bold** and "- item" lines from the AI into clean formatting
function Formatted({ text }) {
  const renderInline = (line) =>
    line.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
      ) : (
        part
      )
    );

  return (
    <div className="space-y-1.5">
      {text.split("\n").map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-1" />;
        if (/^[-*•]\s+/.test(trimmed))
          return (
            <div key={i} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
              <span>{renderInline(trimmed.replace(/^[-*•]\s+/, ""))}</span>
            </div>
          );
        return <p key={i}>{renderInline(trimmed)}</p>;
      })}
    </div>
  );
}

export default function Assistant() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
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
      setMessages((m) => [
        ...m,
        { role: "ai", error: true, text: err.response?.data?.message || "Something went wrong. Please try again." },
      ]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      ask(question);
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">BizPilot AI</h2>
            <p className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Online · Answers from your business data
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button type="button" onClick={() => setMessages([])} className={btnOutline}>
            <Trash2 size={14} /> Clear chat
          </button>
        )}
      </div>

      {/* Chat area */}
      <div className={`${card} flex-1 space-y-5 overflow-y-auto p-4 sm:p-6`}>
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg">
              <Sparkles size={26} />
            </div>
            <h3 className="text-lg font-semibold">How can I help your business today?</h3>
            <p className="mb-6 mt-1 text-sm text-slate-500">Ask about sales, stock, customers, or dues.</p>
            <div className="grid w-full max-w-xl gap-3 sm:grid-cols-2">
              {suggestions.map(({ icon: Icon, title, text }) => (
                <button
                  key={title}
                  type="button"
                  onClick={() => ask(text)}
                  className="group rounded-xl border border-slate-200 p-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-sm"
                >
                  <Icon size={18} className="mb-2 text-indigo-600" />
                  <p className="text-sm font-medium text-slate-900">{title}</p>
                  <p className="text-xs text-slate-500">{text}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex items-end gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ${
                m.role === "user" ? "bg-indigo-600" : "bg-gradient-to-br from-indigo-500 to-violet-600"
              }`}
            >
              {m.role === "user" ? <User size={16} /> : <Sparkles size={16} />}
            </div>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                m.role === "user"
                  ? "rounded-br-sm bg-indigo-600 text-white"
                  : m.error
                  ? "rounded-bl-sm border border-red-200 bg-red-50 text-red-700"
                  : "rounded-bl-sm border border-slate-200 bg-white text-slate-800"
              }`}
            >
              {m.role === "ai" ? <Formatted text={m.text} /> : m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-end gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
              <Sparkles size={16} />
            </div>
            <div className="flex gap-1 rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-3">
              <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(question);
        }}
        className="mt-3 flex items-center gap-2"
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about sales, stock, or dues..."
          className={`${input} flex-1`}
        />
        <button className={btn} disabled={loading || !question.trim()} aria-label="Send">
          <SendHorizontal size={16} /> Send
        </button>
      </form>
    </div>
  );
}