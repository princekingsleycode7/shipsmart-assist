import { createFileRoute } from "@tanstack/react-router";
import { TemplatePage } from "@/components/template-page";

export const Route = createFileRoute("/about")({
  component: () => <TemplatePage page="about" />,
  head: () => ({ meta: [{ title: "About — Delflow Logistics" }] }),
});
