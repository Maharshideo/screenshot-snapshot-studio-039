import { createFileRoute } from "@tanstack/react-router";
import { DashHeader, Panel } from "@/components/dashboard/dashboard-shell";
import { CategoryManager } from "@/components/dashboard/category-manager";

export const Route = createFileRoute("/admin/categories")({
  component: () => (
    <>
      <DashHeader title="Food categories" description="Used for filters on the home page, search and every canteen menu." />
      <Panel><CategoryManager /></Panel>
    </>
  ),
});
