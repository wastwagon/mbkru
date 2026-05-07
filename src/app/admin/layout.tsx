import { AdminChrome } from "@/components/admin/AdminChrome";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--section-light)]">
      <AdminChrome>{children}</AdminChrome>
    </div>
  );
}
