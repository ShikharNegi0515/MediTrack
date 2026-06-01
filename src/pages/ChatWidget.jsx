import { useState, useRef, useEffect } from "react";
import { FaComments, FaPaperPlane, FaTimes } from "react-icons/fa";

const FAQ_RESPONSES = [
  {
    keywords: ["hello", "hi", "hey"],
    reply: "Hello! I'm your MediTrack assistant. Ask about medications, reminders, or refills.",
  },
  {
    keywords: ["medicine", "medication", "dose", "pill"],
    reply: "Go to Medications to add prescriptions and mark doses as taken or missed.",
  },
  {
    keywords: ["remind", "alert", "notification"],
    reply: "Open Reminders to schedule date/time alerts for your medications.",
  },
  {
    keywords: ["refill", "pharmacy", "renew"],
    reply: "Use Refill Tracker to monitor pill counts and renewal dates.",
  },
  {
    keywords: ["report", "chart", "adherence"],
    reply: "Reports shows your taken vs missed doses and adherence percentage.",
  },
  {
    keywords: ["profile", "doctor", "allerg"],
    reply: "Update your health profile under Profile in the menu.",
  },
  {
    keywords: ["help", "how"],
    reply: "I can help with medications, reminders, refills, reports, and your profile. What do you need?",
  },
];

function getBotReply(message) {
  const lower = message.toLowerCase();
  for (const item of FAQ_RESPONSES) {
    if (item.keywords.some((k) => lower.includes(k))) return item.reply;
  }
  return "I'm not sure about that. Try asking about medications, reminders, refills, or reports.";
}

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Hi! How can I help you with MediTrack today?",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const sendMessage = (e) => {
    e?.preventDefault();
    if (input.trim() === "") return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { text: userText, sender: "user" }]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { text: getBotReply(userText), sender: "bot" },
      ]);
    }, 600);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/30 transition hover:scale-105 hover:bg-brand-700"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? <FaTimes size={20} /> : <FaComments size={22} />}
      </button>

      {open && (
        <div className="animate-slide-up fixed bottom-24 right-6 z-50 flex w-[min(100vw-2rem,22rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="bg-gradient-to-r from-brand-700 to-brand-600 px-4 py-3 text-white">
            <p className="font-semibold">MediTrack Assistant</p>
            <p className="text-xs text-teal-100">Usually replies instantly</p>
          </div>

          <div className="h-64 overflow-y-auto bg-slate-50 p-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`mb-2 flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <span
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    m.sender === "user"
                      ? "rounded-br-md bg-brand-600 text-white"
                      : "rounded-bl-md border border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {m.text}
                </span>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={sendMessage} className="flex border-t border-slate-200 bg-white">
            <input
              className="flex-1 px-4 py-3 text-sm outline-none placeholder:text-slate-400"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
            />
            <button
              type="submit"
              className="flex items-center justify-center px-4 text-brand-600 hover:text-brand-700"
              aria-label="Send"
            >
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
