import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Minus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Link } from "@tanstack/react-router";

// Import your existing project hooks and server actions
import { useAuth } from "@/hooks/use-auth";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getOrCreateConversation, listConversationMessages, sendSupportMessage } from "@/lib/support.functions";
import { supabase } from "@/integrations/supabase/client";

export function LiveSupportWidget() {
  const { user, loading } = useAuth();
  const qc = useQueryClient();
  
  // Connect your project's tested server functions
  const conv = useServerFn(getOrCreateConversation);
  const list = useServerFn(listConversationMessages);
  const send = useServerFn(sendSupportMessage);

  const [isOpen, setIsOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Fetch or create the active conversation if the user is authenticated
  const { data: conversation } = useQuery({
    queryKey: ["live-conv", user?.id],
    queryFn: () => conv(),
    enabled: !!user && isOpen, // Only execute fetch sequence when widget interface opens
  });

  // 2. Fetch all persisted database messages tied to this conversation
  const { data: messages } = useQuery({
    queryKey: ["live-msgs", conversation?.id],
    queryFn: () => list({ data: { conversationId: conversation!.id } }),
    enabled: !!conversation?.id,
  });

  // 3. Keep the stream real-time when new items hit the database pipeline
  useEffect(() => {
    if (!conversation?.id) return;
    const ch = supabase
      .channel(`widget-support:${conversation.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "support_messages", filter: `conversation_id=eq.${conversation.id}` },
        () => {
          qc.invalidateQueries({ queryKey: ["live-msgs", conversation.id] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [conversation?.id, qc]);

  // 4. Handle button shift configuration based on window scrolling position
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 5. Instantly align chat viewing pane on new item updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // 6. Handle action requests to persist text records to the backend
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputMessage.trim();
    if (!text || !conversation?.id) return;

    setInputMessage(""); // Clear text input array field layout immediately
    await send({ data: { conversationId: conversation.id, body: text } });
    qc.invalidateQueries({ queryKey: ["live-msgs", conversation.id] });
  };

  return (
    <div className="fixed bottom-6 z-50 font-sans transition-all duration-300 ease-in-out">
      
      {/* FLOATING ACTION TRIGGER BUTTON */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className={`h-14 w-14 text-white shadow-xl transition-all duration-300 hover:scale-105 border border-orange-500/20 bg-[#0F172A] hover:bg-[#1E293B]
            fixed bottom-6
            ${hasScrolled ? "right-[calc(1.5rem+50px)]" : "right-6"}
            ${hasScrolled ? "rounded-2xl" : "rounded-none"}
            sm:bottom-6 max-sm:bottom-4
          `}
        >
          <MessageSquare className="h-6 w-6 text-orange-500" />
        </Button>
      )}

      {/* EXPANDED INTERFACE MODULE */}
      {isOpen && (
        <Card className="shadow-2xl flex flex-col overflow-hidden border border-slate-200 bg-[#F8FAFC] transition-all duration-300 animate-in slide-in-from-bottom-5
          md:w-[380px] md:h-[520px] md:fixed md:bottom-6 md:right-6 md:rounded-2xl
          max-md:fixed max-md:inset-0 max-md:w-full max-md:h-full max-md:rounded-none"
        >
          {/* HEADER BAR PANEL */}
          <div className="bg-[#0F172A] px-4 py-4 text-white flex items-center justify-between border-b border-orange-500/20 max-md:pt-8">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10 border border-slate-700">
                  <AvatarImage src="/assets/images/support-agent.png" alt="Support Agent" />
                  <AvatarFallback className="bg-orange-500 text-white font-bold">SS</AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#0F172A]" />
              </div>
              <div>
                <h3 className="font-semibold text-sm tracking-wide text-white">
                  ShipSmart Assist
                </h3>
                <p className="text-xs text-slate-400 font-medium">Typically replies within minutes</p>
              </div>
            </div>
            
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

          {/* RENDERING INTERACTIVE INTERFACE BODY STATES */}
          {loading ? (
            <div className="flex-1 flex items-center justify-center text-sm text-slate-400">
              Loading conversation...
            </div>
          ) : !user ? (
            /* Authentication Fallback Request layout */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <h4 className="font-semibold text-slate-800 text-base mb-1">Sign in to start chat</h4>
              <p className="text-xs text-slate-400 mb-4 max-w-[240px]">We require authentication to log messages directly to your shipment profile.</p>
              <Link 
                to="/login" 
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center justify-center text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-xl transition-all shadow-md"
              >
                Sign In
              </Link>
            </div>
          ) : (
            <>
              {/* PERSISTED CHAT FLOW SCROLL AREA */}
              <ScrollArea className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4 flex flex-col">
                  {messages?.map((msg) => {
                    // Check if sender matching local auth session payload id
                    const isUser = msg.sender_id === user.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-[85%] ${
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
                          {msg.body}
                        </div>
                        {msg.created_at && (
                          <span className="text-[10px] text-slate-400 mt-1 px-1 tracking-wider">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    );
                  })}
                  {messages && messages.length === 0 && (
                    <p className="text-center text-xs text-slate-400 py-8">
                      Say hi to start the conversation!
                    </p>
                  )}
                  <div ref={scrollRef} />
                </div>
              </ScrollArea>

              {/* MESSAGE INTERACTION FOOTER INPUT */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 max-md:pb-6"
              >
                <div className="relative flex-1 flex items-center">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message here..."
                    className="w-full bg-slate-50 border-slate-200 rounded-xl pr-10 focus-visible:ring-orange-500 text-sm h-10 text-slate-800 placeholder:text-slate-400"
                  />
                  <Button
                    type="submit"
                    disabled={!inputMessage.trim()}
                    size="icon"
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
            </>
          )}

        </Card>
      )}
    </div>
  );
}