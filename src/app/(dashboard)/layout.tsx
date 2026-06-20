import { Sidebar } from "@/components/layout/sidebar";

export const runtime = "edge";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar clinicName="Make Clinic" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="hidden md:flex h-16 shrink-0 items-center border-b border-gray-200 bg-white px-6">
          <span className="text-sm text-gray-500">Demo — sin autenticación</span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">{children}</main>
      </div>
    </div>
  );
}
