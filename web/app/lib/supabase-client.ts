"use client";
import {cloudUrl,cloudPublishableKey} from "./cloud-config";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
let client: SupabaseClient | null = null;
export function cloudIsConfigured() {
  return Boolean(cloudUrl && cloudPublishableKey);
}
export function getCloudClient(): SupabaseClient | null {
  if (!cloudIsConfigured()) return null;
  if (!client) client = createClient(cloudUrl,cloudPublishableKey, {
    auth: { flowType: "pkce", persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return client;
}
