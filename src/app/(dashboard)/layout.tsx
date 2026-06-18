import { Sidebar } from "@/components/layout/sidebar";

export const runtime = "edge";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar clinicName="Make Clinic" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center border-b border-gray-200 bg-white px-6">
          <span className="text-sm text-gray-500">Demo — sem autenticação</span>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
