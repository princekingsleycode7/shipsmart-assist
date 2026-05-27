import { createFileRoute } from "@tanstack/react-router";
import { TemplatePage } from "@/components/template-page";

export const Route = createFileRoute("/")({
  component: () => <TemplatePage page="index-2" />,
  head: () => ({
    meta: [
      { title: "Safefreight Way — Logistics & Delivery" },
      { name: "description", content: "Safefreight Way - Logistics & Delivery Company" },
    ],
  }),
});
