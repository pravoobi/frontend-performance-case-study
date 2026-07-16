import { Providers } from "@/components/Providers";

// TanStack Query is only used by the dashboard, so its provider (and its
// hydration cost) is scoped to this route — the static landing page ships
// none of it.
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Providers>{children}</Providers>;
}
