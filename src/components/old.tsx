import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Minus, RefreshCw } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

// Replace these placeholders with your actual hooks/state functions from your tested setup
interface Message {
  id: string;
  sender: "user" | "agent";
  text: string;
  time: string;
}

export function LiveSupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  
  // Hook this array up to your existing, working message state
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", sender: "agent", text: "Hello! Thanks for reaching out to ShipSmart. How can I help you with your shipment today?", time: "10:00 AM" }
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll layout wrapper on fresh messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Call your existing backend send logic here
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: inputMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage("");

    // Simulate standard response placeholder for visual testing if needed
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 rounded-2xl font-sans selection:bg-orange-500/30">
      {/* FLOATING ACTION BUTTON */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-[#0F172A] hover:bg-[#1E293B] text-white shadow-xl transition-all duration-300 hover:scale-105 border border-orange-500/20"
        >
          <MessageSquare className="h-6 w-6 text-orange-500" />
        </Button>
      )}

      {/* CHAT WINDOW INTERFACE */}
      {isOpen && (
        <Card className="w-[380px] h-[520px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 bg-[#F8FAFC] transition-all duration-300 animate-in slide-in-from-bottom-5">
          
          {/* HEADER PANEL (Matching Brand Dark Slate) */}
          <div className="bg-[#0F172A] px-4 py-4 text-white flex items-center justify-between border-b border-orange-500/20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10 border border-slate-700">
                  <AvatarImage src="/assets/images/support-agent.png" alt="Support Agent" />
                  <AvatarFallback className="bg-orange-500 text-white font-bold">SS</AvatarFallback>
                </Avatar>
                {/* Active Online Status Dot */}
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#0F172A]" />
              </div>
              <div>
                <h3 className="font-semibold text-sm tracking-wide text-white flex items-center gap-1.5">
                  ShipSmart Assist
                </h3>
                <p className="text-xs text-slate-400 font-medium">Typically replies within minutes</p>
              </div>
            </div>
            
            {/* Window Minimizer Toggle */}
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full"
                onClick={() => setIsOpen(false)}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* CHAT STREAM CONTAINER */}
          <ScrollArea className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4 flex flex-col">
              {messages.map((msg) => {
                const isUser = msg.sender === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[80%] ${
                      isUser ? "self-end items-end" : "self-start items-start"
                    }`}
                  >
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                        isUser
                          ? "bg-orange-500 text-white rounded-tr-none"
                          : "bg-white text-slate-800 border border-slate-100 rounded-tl-none"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1 tracking-wider">
                      {msg.time}
                    </span>
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* INPUT BAR FOOTER (Clean Minimalist Wrapper) */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
          >
            <div className="relative flex-1 flex items-center">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message here..."
                className="w-full bg-slate-50 border-slate-200 rounded-xl pr-10 focus-visible:ring-orange-500 focus-visible:border-orange-500 text-sm h-10 text-slate-800 placeholder:text-slate-400"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!inputMessage.trim()}
                className={`absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-lg transition-all ${
                  inputMessage.trim() 
                    ? "bg-orange-500 hover:bg-orange-600 text-white" 
                    : "bg-transparent text-slate-300"
                }`}
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </form>

        </Card>
      )}
    </div>
  );
}