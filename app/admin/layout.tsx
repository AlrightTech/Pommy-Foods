import { Sidebar } from "@/components/admin/Sidebar";
import { Header } from "@/components/admin/Header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-base">
      <Sidebar />
      <Header />
      <main className="md:ml-72 pt-20 p-4 md:p-8 min-h-screen bg-gradient-to-br from-base via-primary-50/30 to-accent-50/20">
        {children}
      </main>
    </div>
  );
}

