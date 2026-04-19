import type { Metadata } from "next";

import LandingHeader from "@/components/marketing/LandingHeader";
import PricingPageContent from "@/components/marketing/PricingPageContent";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Starter is free for small teams. Premium is coming soon — join the waitlist for early access.",
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
