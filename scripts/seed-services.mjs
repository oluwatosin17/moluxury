// Run: node scripts/seed-services.mjs
// Creates the services table (if not exists) and seeds the 6 default services with pricing configs.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://aurirjornlsqepblndwa.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1cmlyam9ybmxzcWVwYmxuZHdhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDYyMTcyMSwiZXhwIjoyMDk2MTk3NzIxfQ.4OiRQlEa0dAMAjLKNAujNs1v76cl3S7WjwaHwkE6tts";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const DEFAULT_LENGTH_OPTIONS = [
  { label: "10 inch", surcharge: 0 },
  { label: "12 inch", surcharge: 3000 },
  { label: "14 inch", surcharge: 5000 },
  { label: "16 inch", surcharge: 8000 },
  { label: "18 inch", surcharge: 12000 },
  { label: "20 inch", surcharge: 16000 },
  { label: "22 inch", surcharge: 20000 },
  { label: "24 inch", surcharge: 25000 },
];

const DEFAULT_DENSITY_OPTIONS = [
  { label: "130%", surcharge: 0 },
  { label: "150%", surcharge: 5000 },
  { label: "180%", surcharge: 10000 },
  { label: "200%", surcharge: 15000 },
  { label: "250%", surcharge: 20000 },
];

const services = [
  {
    slug: "wig-styling",
    name: "Wig Styling",
    pricing_config: {
      base_price: 25000,
      show_length: true,
      show_density: true,
      length_options: DEFAULT_LENGTH_OPTIONS,
      density_options: DEFAULT_DENSITY_OPTIONS,
    },
  },
  {
    slug: "wig-revamping",
    name: "Wig Revamping",
    pricing_config: {
      base_price: 25000,
      show_length: true,
      show_density: true,
      length_options: DEFAULT_LENGTH_OPTIONS,
      density_options: DEFAULT_DENSITY_OPTIONS,
    },
  },
  {
    slug: "wig-installation",
    name: "Wig Installation",
    pricing_config: {
      base_price: 20000,
      show_length: true,
      show_density: true,
      length_options: DEFAULT_LENGTH_OPTIONS,
      density_options: DEFAULT_DENSITY_OPTIONS,
    },
  },
  {
    slug: "wig-coloring",
    name: "Wig Coloring",
    pricing_config: {
      base_price: 35000,
      show_length: true,
      show_density: false,
      length_options: DEFAULT_LENGTH_OPTIONS,
      density_options: [],
    },
  },
  {
    slug: "wig-maintenance",
    name: "Wig Maintenance",
    pricing_config: {
      base_price: 15000,
      show_length: true,
      show_density: false,
      length_options: DEFAULT_LENGTH_OPTIONS,
      density_options: [],
    },
  },
  {
    slug: "custom-consultation",
    name: "Custom Consultation",
    pricing_config: {
      base_price: 10000,
      show_length: false,
      show_density: false,
      length_options: [],
      density_options: [],
    },
  },
];

async function seed() {
  console.log("Seeding services...");
  const { data, error } = await supabase
    .from("services")
    .upsert(services, { onConflict: "slug" })
    .select("slug, name");

  if (error) {
    console.error("❌ Failed:", error.message);
    process.exit(1);
  }

  console.log(`✅ Seeded ${data.length} services:`);
  data.forEach((s) => console.log(`   ${s.slug} — ${s.name}`));
}

seed();
