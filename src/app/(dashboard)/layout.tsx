import { Sidebar } from "@/components/layout/sidebar";

export const runtime = "edge";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f9f9ff]">
      <Sidebar clinicName="Make Clinic" />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Desktop header */}
        <header className="hidden md:flex h-16 shrink-0 items-center justify-between border-b border-[#e5e7eb] bg-white px-6">
          <div />
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-[#e7eefe] flex items-center justify-center">
              <span className="text-xs font-semibold text-[#5427e6]">DR</span>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-[#151c27]">Dra. Admin</p>
              <p className="text-xs text-[#797588]">Demo</p>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
