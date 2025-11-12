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
      <main className="md:ml-64 pt-20 p-4 md:p-6">
        {children}
      </main>
    </div>
  );
}

