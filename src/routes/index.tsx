import { createFileRoute } from "@tanstack/react-router";
import { TemplatePage } from "@/components/template-page";
import { HeroCarousel } from "@/components/hero-carousel";

export const Route = createFileRoute("/")({
  component: () => (
    <TemplatePage
      page="index-2"
      slot={{ mountId: "lov-hero-mount", node: <HeroCarousel /> }}
    />
  ),
  head: () => ({
    meta: [
      { title: "Delflow Logistics — Logistics & Delivery" },
      { name: "description", content: "Delflow Logistics - Logistics & Delivery Company" },
    ],
  }),
});
