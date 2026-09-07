"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MessageSquare, Send, Sparkles, ChevronLeft, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function MessagesPage() {
  const { user } = useAuth();
  const [activeConversation, setActiveConversation] = useState(0);
  const [inputText, setInputText] = useState("");

  const conversations = [
    {
      id: 1,
      hostName: "Elena Rostova",
      hostAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
      listing: "Cliffside Santorini Caldera Villa",
      lastMessage: "Looking forward to hosting you in Oia! Let me know if you need airport transfer.",
      time: "2h ago",
      messages: [
        { sender: "Elena Rostova", text: "Hello! Thank you for booking our Caldera Villa.", time: "10:30 AM", isHost: true },
        { sender: user.name, text: "Hi Elena! What is the check-in process like?", time: "10:45 AM", isHost: false },
        { sender: "Elena Rostova", text: "Looking forward to hosting you in Oia! Let me know if you need airport transfer.", time: "11:00 AM", isHost: true }
      ]
    },
    {
      id: 2,
      hostName: "Liam Vance",
      hostAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      listing: "Modern Glass Cabin in Redwood Sanctuary",
      lastMessage: "The hot tub is heated and ready for your arrival this weekend!",
      time: "1d ago",
      messages: [
        { sender: "Liam Vance", text: "Welcome to Big Sur! The redwood trails are beautiful right now.", time: "Yesterday", isHost: true },
        { sender: "Liam Vance", text: "The hot tub is heated and ready for your arrival this weekend!", time: "Yesterday", isHost: true }
      ]
    }
  ];

  const current = conversations[activeConversation];
  const [chatMessages, setChatMessages] = useState(current.messages);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setChatMessages((prev) => [
      ...prev,
      { sender: user.name, text: inputText.trim(), time: "Just now", isHost: false }
    ]);
    setInputText("");
    toast.success("Message sent!");

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { sender: current.hostName, text: "Got it! Thanks for the update.", time: "Just now", isHost: true }
      ]);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-black mb-4 transition"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Messages</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Direct communication between guest and host
            </p>
          </div>
          <div className="flex items-center gap-2 bg-pink-50 border border-pink-200 px-3 py-1.5 rounded-full text-xs font-semibold text-[#FF385C]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Messaging Placeholder (WebSockets coming soon)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 rounded-3xl bg-white border border-gray-200 shadow-sm overflow-hidden min-h-[550px]">
          {/* Conversation List */}
          <div className="md:col-span-4 border-r border-gray-200 divide-y divide-gray-100">
            <div className="p-4 border-b bg-gray-50/50">
              <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">
                All Conversations
              </span>
            </div>
            {conversations.map((conv, idx) => (
              <button
                key={conv.id}
                onClick={() => {
                  setActiveConversation(idx);
                  setChatMessages(conv.messages);
                }}
                className={`w-full text-left p-4 hover:bg-gray-50 transition cursor-pointer flex items-start gap-3 ${
                  activeConversation === idx ? "bg-pink-50/40 border-l-4 border-l-[#FF385C]" : ""
                }`}
              >
                <img
                  src={conv.hostAvatar}
                  alt={conv.hostName}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between">
                    <h4 className="text-sm font-bold text-gray-900 truncate">{conv.hostName}</h4>
                    <span className="text-[10px] text-gray-400">{conv.time}</span>
                  </div>
                  <p className="text-[11px] font-semibold text-[#FF385C] truncate mt-0.5">
                    {conv.listing}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-1">{conv.lastMessage}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Active Chat Thread */}
          <div className="md:col-span-8 flex flex-col h-[550px]">
            <div className="p-4 border-b flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <img
                  src={current.hostAvatar}
                  alt={current.hostName}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    {current.hostName}
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </h3>
                  <p className="text-xs text-gray-500">{current.listing}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50/40">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${msg.isHost ? "items-start" : "items-end"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl p-3.5 text-sm shadow-xs ${
                      msg.isHost
                        ? "bg-white text-gray-800 border border-gray-200 rounded-tl-xs"
                        : "bg-[#FF385C] text-white rounded-tr-xs"
                    }`}
                  >
                    <p>{msg.text}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-gray-200 bg-white flex gap-2">
              <input
                type="text"
                placeholder={`Message ${current.hostName}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-black outline-hidden"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="rounded-xl bg-[#FF385C] px-5 py-2.5 text-white font-bold text-xs hover:bg-[#E00B41] transition disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}