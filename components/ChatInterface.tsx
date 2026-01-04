import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, Image as ImageIcon } from "lucide-react";
import { ChatMessage } from "../types";

interface Props {
  messages: ChatMessage[];
  onSendMessage: (text: string, image?: File) => Promise<void>;
  isTyping: boolean;
}

const ChatInterface: React.FC<Props> = ({
  messages,
  onSendMessage,
  isTyping,
}) => {
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !selectedImage) return;
    const text = input || "Uploaded receipt";
    const image = selectedImage;
    setInput("");
    setSelectedImage(null);
    await onSendMessage(text, image || undefined);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
    }
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
        {selectedImage && (
          <div className="mb-2 flex items-center gap-2 p-2 bg-gray-50 border border-gray-200">
            <ImageIcon size={16} className="text-gray-400" />
            <span className="text-xs text-gray-600 flex-1 truncate">
              {selectedImage.name}
            </span>
            <button
              onClick={() => setSelectedImage(null)}
              className="text-xs text-gray-400 hover:text-black"
            >
              Remove
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-black border border-gray-100 transition-all shrink-0"
            title="Upload receipt"
          >
            <ImageIcon size={16} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Log expense, upload receipt..."
            className="flex-1 bg-gray-50 text-black placeholder:text-gray-300 px-4 py-3 focus:outline-none text-sm border border-gray-100 focus:border-gray-300 transition-all"
          />
          <button
            type="submit"
            disabled={(!input.trim() && !selectedImage) || isTyping}
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
