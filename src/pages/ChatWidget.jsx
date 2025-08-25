import { useState } from "react";

const ChatWidget = () => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    const sendMessage = () => {
        if (input.trim() === "") return;

        setMessages([...messages, { text: input, sender: "user" }]);
        const userMessage = input.toLowerCase();
        setInput("");

        setTimeout(() => {
            let reply = "Sorry, I didn't understand that.";
            if (userMessage.includes("hello")) reply = "Hi! How can I help you?";
            if (userMessage.includes("medicine")) reply = "Please check your medication schedule in the dashboard.";
            if (userMessage.includes("doctor")) reply = "You can contact your doctor through the support section.";

            setMessages((prev) => [...prev, { text: reply, sender: "bot" }]);
        }, 1000);
    };


    return (
        <div>
            <button
                onClick={() => setOpen(!open)}
                className="fixed bottom-4 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg"
            >
                💬
            </button>
            {open && (
                <div className="fixed bottom-16 right-4 w-72 bg-white shadow-lg rounded-lg border">
                    <div className="p-2 bg-blue-500 text-white rounded-t-lg">Live Chat</div>
                    <div className="p-2 h-48 overflow-y-auto">
                        {messages.map((m, i) => (
                            <div key={i} className={`my-1 ${m.sender === "user" ? "text-right" : "text-left"}`}>
                                <span className={`px-2 py-1 rounded ${m.sender === "user" ? "bg-blue-100" : "bg-gray-200"}`}>
                                    {m.text}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="flex border-t">
                        <input
                            className="flex-1 p-2 outline-none"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message..."
                        />
                        <button onClick={sendMessage} className="px-3 bg-blue-500 text-white">Send</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatWidget;
