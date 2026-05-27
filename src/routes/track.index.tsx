import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/track/")({
  beforeLoad: () => { throw redirect({ to: "/tracking" }); },
});
