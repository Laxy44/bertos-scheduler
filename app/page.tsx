import LandingPage from "@/components/marketing/LandingPage";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export default async function MarketingHomePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <LandingPage isAuthenticated={Boolean(user)} />;
}
