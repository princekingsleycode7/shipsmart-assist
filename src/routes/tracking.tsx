import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { TemplateShell } from "@/components/template-page";
import { Search, Package, Info } from "lucide-react";

export const Route = createFileRoute("/tracking")({
  component: Tracking,
  head: () => ({
    meta: [
      { title: "Track Shipment — Delflow Logistics" },
      { name: "description", content: "Enter your tracking code to see real-time shipment status, location, and ETA." },
    ],
  }),
});

function Tracking() {
  const nav = useNavigate();
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = code.trim();
    if (!t) {
      setErr("Please enter a tracking code.");
      return;
    }
    setErr("");
    nav({ to: "/track/$id", params: { id: t } });
  };

  return (
    <TemplateShell>
      <div className="row justify-content-center">
        <div className="col-lg-7 col-md-9 col-12">
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: "clamp(20px, 5vw, 40px)",
              boxShadow: "0 14px 40px rgba(15,23,42,.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <span
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "#fff5e6",
                  color: "#f5a623",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Package size={22} />
              </span>
              <h2 style={{ margin: 0, fontWeight: 700, fontSize: "clamp(20px, 5vw, 28px)", lineHeight: 1.2 }}>
                Track your shipment
              </h2>
            </div>
            <p style={{ color: "#64748b", marginBottom: 22, fontSize: 14 }}>
              Enter your tracking code for real-time status and delivery info.
            </p>

            <form onSubmit={submit}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5 }}>
                Tracking code
              </label>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginTop: 8,
                  flexWrap: "wrap",
                }}
              >
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. ER-454-152-47N"
                  autoComplete="off"
                  style={{
                    flex: "1 1 200px",
                    minWidth: 0,
                    padding: "14px 16px",
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    fontSize: 15,
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: "#f5a623",
                    color: "#fff",
                    border: "none",
                    borderRadius: 12,
                    padding: "14px 22px",
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                    flex: "0 0 auto",
                    width: "100%",
                    maxWidth: "100%",
                    justifyContent: "center",
                  }}
                  className="track-submit-btn"
                >
                  <Search size={16} /> Track now
                </button>
              </div>

              <div style={{ marginTop: 14, fontSize: 13, color: "#64748b", display: "flex", alignItems: "center", gap: 6 }}>
                <Info size={14} /> Try: <strong style={{ color: "#0c2340" }}>ER-454-152-47N</strong>
              </div>

              {err && (
                <div style={{ marginTop: 12, color: "#dc2626", fontSize: 13 }}>
                  {err}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 480px) {
          .track-submit-btn { width: auto !important; }
        }
      `}</style>
    </TemplateShell>
  );
}
