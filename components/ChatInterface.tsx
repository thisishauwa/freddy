import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, ShieldCheck } from "lucide-react";
import { ChatMessage } from "../types";

interface Props {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isTyping: boolean;
}

const ChatInterface: React.FC<Props> = ({
  messages,
  onSendMessage,
  isTyping,
}) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input;
    setInput("");
    await onSendMessage(text);
  };

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] overflow-hidden relative">
      {/* Editorial Chat Header */}
      <div className="px-5 py-4 border-b border-gray-100 bg-white flex items-center gap-3 sticky top-0 z-10 shrink-0">
        <div className="w-8 h-8 bg-black flex items-center justify-center text-white shrink-0">
          <Bot size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-medium text-base text-black tracking-tight italic leading-none">
            Freddy
          </h3>
          <p className="text-[8px] text-gray-300 font-bold uppercase tracking-[0.15em] mt-0.5">
            Financial Assistant
          </p>
        </div>
        <div className="w-1.5 h-1.5 bg-brand-lime rounded-full animate-pulse"></div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar pb-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] px-3.5 py-2 text-[13px] leading-relaxed ${
                msg.role === "user"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-50 text-gray-900 border-l-2 border-gray-300"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Overlay */}
      <div className="p-4 bg-white border-t border-gray-100 sticky bottom-0 shrink-0 mb-20 md:mb-0">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Log expense, ask question..."
            className="flex-1 bg-gray-50 text-black placeholder:text-gray-300 px-4 py-3 focus:outline-none text-sm border border-gray-100 focus:border-gray-300 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="p-3 bg-black text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shrink-0"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
