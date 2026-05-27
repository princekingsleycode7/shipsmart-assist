import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getWhatsAppNumber } from "@/lib/parcels.functions";

const TEMPLATE_CSS = [
  "/assets/css/bootstrap.min.css",
  "/assets/css/fontawesome-all.css",
  "/assets/css/flaticon.css",
  "/assets/css/animate.css",
  "/assets/css/nice-select.css",
  "/assets/css/jquery.mCustomScrollbar.min.css",
  "/assets/css/slick.css",
  "/assets/css/slick-theme.css",
  "/assets/css/rs6.css",
  "/assets/css/style.css",
];

// Template scripts (loaded once, in order, on first template page mount)
const TEMPLATE_SCRIPTS = [
  "/assets/js/jquery.min.js",
  "/assets/js/bootstrap.min.js",
  "/assets/js/popper.min.js",
  "/assets/js/jquery.magnific-popup.min.js",
  "/assets/js/appear.js",
  "/assets/js/slick.js",
  "/assets/js/jquery.counterup.min.js",
  "/assets/js/waypoints.min.js",
  "/assets/js/imagesloaded.pkgd.min.js",
  "/assets/js/jquery.filterizr.js",
  "/assets/js/jquery.mCustomScrollbar.concat.min.js",
  "/assets/js/wow.min.js",
  "/assets/js/jquery.cssslider.min.js",
  "/assets/js/rbtools.min.js",
  "/assets/js/rs6.min.js",
  "/assets/js/script.js",
];

let cssInjected = false;
function injectCss() {
  if (cssInjected || typeof document === "undefined") return;
  cssInjected = true;
  for (const href of TEMPLATE_CSS) {
    if (document.querySelector(`link[href="${href}"]`)) continue;
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = href;
    l.dataset.tpl = "1";
    document.head.appendChild(l);
  }
}

let scriptsLoaded: Promise<void> | null = null;
function loadScriptsOnce(): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();
  if (scriptsLoaded) return scriptsLoaded;
  scriptsLoaded = (async () => {
    for (const src of TEMPLATE_SCRIPTS) {
      await new Promise<void>((resolve) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const s = document.createElement("script");
        s.src = src;
        s.async = false;
        s.onload = () => resolve();
        s.onerror = () => resolve();
        document.body.appendChild(s);
      });
    }
  })();
  return scriptsLoaded;
}

async function reinitTemplate(container: HTMLElement) {
  // Fade out and remove the preloader immediately to prevent the UI from sticking
  // while scripts load sequentially.
  const preloader = document.getElementById("preloader");
  if (preloader) {
    preloader.style.transition = "opacity 0.4s ease";
    preloader.style.opacity = "0";
    setTimeout(() => {
      preloader.remove();
    }, 400);
  }

  await loadScriptsOnce();
  // Re-execute inline <script> tags inside the fragment (innerHTML scripts don't run)
  const inline = container.querySelectorAll("script");
  inline.forEach((old) => {
    const s = document.createElement("script");
    if (old.src) s.src = old.src;
    s.text = old.textContent || "";
    old.parentNode?.replaceChild(s, old);
  });
  // Try to re-trigger common template inits
  // @ts-expect-error jquery global
  const $ = window.jQuery;
  if ($) {
    try { $(".wow").each(function () { /* noop */ }); } catch {}
    try { $("#preloader").fadeOut(300); } catch {}
  }
}

export function WhatsAppFloat() {
  const fn = useServerFn(getWhatsAppNumber);
  const { data } = useQuery({ queryKey: ["wa-number"], queryFn: () => fn() });
  const number = (data?.whatsapp_number || "").replace(/[^0-9]/g, "");
  const href = number ? `https://wa.me/${number}` : "https://wa.me/";
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      style={{
        position: "fixed",
        right: 20,
        bottom: 20,
        zIndex: 9999,
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: "#25D366",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 8px 24px rgba(0,0,0,.25)",
        textDecoration: "none",
        fontSize: 28,
      }}
    >
      <i className="fab fa-whatsapp" />
    </a>
  );
}

export function TemplatePage({ page }: { page: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    injectCss();
    let alive = true;
    fetch(`/templates/fragments/${page}.html`)
      .then((r) => r.text())
      .then((t) => { if (alive) setHtml(t); });
    return () => { alive = false; };
  }, [page]);

  useEffect(() => {
    if (!html || !ref.current) return;
    reinitTemplate(ref.current);
    window.scrollTo(0, 0);
  }, [html]);

  return (
    <>
      <div ref={ref} dangerouslySetInnerHTML={{ __html: html }} />
      <WhatsAppFloat />
    </>
  );
}

function useFragment(name: string) {
  const [html, setHtml] = useState("");
  useEffect(() => {
    injectCss();
    let alive = true;
    fetch(`/templates/fragments/${name}.html`).then((r) => r.text()).then((t) => { if (alive) setHtml(t); });
    return () => { alive = false; };
  }, [name]);
  return html;
}

export function TemplateShell({ children }: { children: React.ReactNode }) {
  const header = useFragment("_header");
  const footer = useFragment("_footer");
  const hRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (header && hRef.current) reinitTemplate(hRef.current);
  }, [header]);

  return (
    <>
      <header ref={hRef} dangerouslySetInnerHTML={{ __html: header }} />
      <main style={{ minHeight: "60vh", padding: "60px 0", background: "#f7f9fc" }}>
        <div className="container">{children}</div>
      </main>
      <div dangerouslySetInnerHTML={{ __html: footer }} />
      <WhatsAppFloat />
    </>
  );
}
