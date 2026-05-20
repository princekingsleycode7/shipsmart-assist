import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";

export const Route = createFileRoute("/track/")({
  component: TrackIndex,
  head: () => ({
    meta: [
      { title: "Track parcel — Delvora" },
      { name: "description", content: "Enter your tracking number to see real-time delivery status." },
    ],
  }),
});

function TrackIndex() {
  const nav = useNavigate();
  const [code, setCode] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const c = code.trim().toUpperCase().replace(/^#/, "").replace(/\s+/g, "-");
    if (c) nav({ to: "/track/$id", params: { id: c } });
  };
  return (
    <div className="py-10">
      <h1 className="font-display text-4xl md:text-6xl"><em>Track</em> your parcel</h1>
      <p className="mt-2 text-muted-foreground">Enter your tracking number to see live status.</p>
      <form onSubmit={submit} className="card-soft mt-8 flex items-center gap-2 p-2">
        <Search className="ml-3 h-5 w-5 text-muted-foreground" />
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. ER-454-152-47N"
          className="flex-1 bg-transparent px-2 py-3 outline-none"
        />
        <button className="rounded-full bg-primary px-5 py-2 font-medium text-primary-foreground">Track</button>
      </form>
      <div className="mt-6 flex flex-wrap gap-2 text-sm text-muted-foreground">
        Try:{" "}
        {["ER-454-152-47N", "DL-882-001-12A", "DL-330-999-77B"].map((c) => (
          <button key={c} onClick={() => nav({ to: "/track/$id", params: { id: c } })} className="pill bg-secondary text-xs">{c}</button>
        ))}
      </div>
    </div>
  );
}
