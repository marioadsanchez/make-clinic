import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_CLINIC_ID } from "@/lib/constants";
import { ConfigView } from "./config-view";

export const runtime = "edge";

export default async function ConfiguracionPage() {
  const supabase = createAdminClient();
  const { data: clinic } = await supabase
    .from("clinics")
    .select("name, email, phone, address")
    .eq("id", DEMO_CLINIC_ID)
    .single();

  return <ConfigView clinic={clinic} />;
}
