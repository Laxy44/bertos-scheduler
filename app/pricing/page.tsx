import type { Metadata } from "next";

import LandingHeader from "@/components/marketing/LandingHeader";
import PricingPageContent from "@/components/marketing/PricingPageContent";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple pricing for growing teams. Start free, upgrade when you need more.",
};

export default async function PricingPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <LandingHeader isAuthenticated={Boolean(user)} />
      <PricingPageContent />
    </>
  );
}
