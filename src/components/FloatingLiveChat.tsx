import { MessageSquare } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function FloatingLiveChat() {
  return (
    <Link
      to="/live-chat"
      aria-label="Open live support chat"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-none border border-orange-500/20 bg-[#0F172A] text-white shadow-xl transition-all duration-300 hover:scale-105 hover:bg-[#1E293B] sm:bottom-6"
    >
      <MessageSquare className="h-6 w-6 text-orange-500" />
    </Link>
  );
}