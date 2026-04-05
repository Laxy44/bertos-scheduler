"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function TestPage() {
  const [message, setMessage] = useState("Testing Supabase...");

  useEffect(() => {
    async function testSupabase() {
      const { error } = await supabase.from("test").select("*").limit(1);

      if (error) {
        setMessage("✅ Supabase connected (no table yet)");
      } else {
        setMessage("✅ Supabase connected successfully");
      }
    }

    testSupabase();
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>Supabase Test</h1>
      <p>{message}</p>
    </main>
  );
}