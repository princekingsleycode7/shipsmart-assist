import { createFileRoute } from "@tanstack/react-router";
import { TemplatePage } from "@/components/template-page";

export const Route = createFileRoute("/")({
  component: () => <TemplatePage page="index-2" />,
  head: () => ({
    meta: [
      { title: "Delflow Logistics — Logistics & Delivery" },
      { name: "description", content: "Delflow Logistics - Logistics & Delivery Company" },
    ],
  }),
});
