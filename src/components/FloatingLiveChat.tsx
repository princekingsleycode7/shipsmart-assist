import { MessageSquare } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";

export function FloatingLiveChat() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Only show on the home page. Hidden everywhere else (including /live-chat
  // where the chat interface itself is open).
  if (pathname !== "/") return null;

  return (
    <Link
      to="/live-chat"
      aria-label="Open live support chat"
      className="fixed z-[9999] flex h-14 w-14 items-center justify-center rounded-full border border-orange-500/20 bg-[#0F172A] text-white shadow-xl transition-all duration-300 hover:scale-105 hover:bg-[#1E293B] bottom-5 right-5 md:bottom-6 md:right-6"
    >
      <MessageSquare className="h-6 w-6 text-orange-500" />
    </Link>
  );
}
