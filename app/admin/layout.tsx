import { Sidebar } from "@/components/admin/Sidebar";
import { Header } from "@/components/admin/Header";
import { ToastProvider } from "@/components/ui/ToastProvider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-base">
        <Sidebar />
        <Header />
        <main className="md:ml-80 pt-16 p-6 md:p-8 min-h-screen">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
