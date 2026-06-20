import { Sidebar } from "@/components/layout/sidebar";

export const runtime = "edge";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f9f9ff] text-[#151c27]">
      <Sidebar clinicName="Make Clinic" />
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {children}
      </main>
    </div>
  );
}
