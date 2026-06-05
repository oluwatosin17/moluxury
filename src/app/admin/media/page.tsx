"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AdminTopbar from "@/components/admin/topbar";

const HOMEPAGE_SLOTS = [
  { key: "hero",              label: "Hero Image",              path: "homepage-assets/hero.jpg" },
  { key: "mood-body-wave",    label: "Mood: Body Wave",         path: "homepage-assets/mood-body-wave.jpg" },
  { key: "mood-pixie-curl",   label: "Mood: Pixie Curl",        path: "homepage-assets/mood-pixie-curl.jpg" },
  { key: "mood-silky-straight",label:"Mood: Silky Straight",    path: "homepage-assets/mood-silky-straight.jpg" },
  { key: "experience-bg",     label: "Experience Background",   path: "homepage-assets/experience-bg.jpg" },
];

const SERVICE_SLOTS = [
  { key: "wig-styling",         label: "Wig Styling",         path: "service-images/wig-styling.jpg" },
  { key: "wig-revamping",       label: "Wig Revamping",       path: "service-images/wig-revamping.jpg" },
  { key: "wig-installation",    label: "Wig Installation",    path: "service-images/wig-installation.jpg" },
  { key: "wig-coloring",        label: "Wig Coloring",        path: "service-images/wig-coloring.jpg" },
  { key: "wig-maintenance",     label: "Wig Maintenance",     path: "service-images/wig-maintenance.jpg" },
  { key: "custom-consultation", label: "Custom Consultation", path: "service-images/custom-consultation.jpg" },
];

function MediaSlot({ label, storagePath }: { label: string; storagePath: string }) {
  const [url, setUrl]         = useState("");
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied]   = useState(false);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  async function handleFile(file: File) {
    setUploading(true);
    const supabase = createClient();
    const [bucket, ...rest] = storagePath.split("/");
    const filePath = rest.join("/");
    const { error } = await supabase.storage.from(bucket).upload(filePath, file, { upsert: true, contentType: file.type });
    setUploading(false);
    if (!error) {
      const newUrl = `${supabaseUrl}/storage/v1/object/public/${storagePath}`;
      setUrl(newUrl);
    }
  }

  function copyUrl() {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-[#16181d] rounded-[12px] border border-[rgba(255,255,255,0.07)] p-4 space-y-3">
      <p className="font-inter-tight font-medium text-[13px] text-[#e8e4df]">{label}</p>
      <p className="font-mono text-[11px] text-[#888078]">{storagePath}</p>

      <label className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-[8px] font-inter-tight text-[13px] border transition-colors cursor-pointer ${
        uploading ? "border-[rgba(255,255,255,0.07)] text-[#888078]" : "border-dashed border-[rgba(255,255,255,0.15)] text-[#888078] hover:text-[#e8e4df] hover:border-[rgba(255,255,255,0.3)]"
      }`}>
        {uploading ? (
          <><div className="w-4 h-4 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin" /> Uploading…</>
        ) : (
          <><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 9V3M4 6l3-3 3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 11h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> Replace image</>
        )}
        <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </label>

      {url && (
        <div className="space-y-2">
          <p className="font-inter-tight text-[11px] text-green-400">✓ Uploaded successfully</p>
          <div className="flex gap-2">
            <input readOnly value={url} className="flex-1 bg-[#0e0f11] border border-[rgba(255,255,255,0.07)] rounded-[6px] px-2 py-1.5 font-mono text-[10px] text-[#888078] outline-none" />
            <button onClick={copyUrl}
              className="px-3 py-1.5 rounded-[6px] bg-[#c9a96e]/10 border border-[#c9a96e]/30 font-inter-tight text-[11px] text-[#c9a96e] hover:bg-[#c9a96e]/20 transition-colors cursor-pointer whitespace-nowrap"
            >
              {copied ? "Copied!" : "Copy URL"}
            </button>
          </div>
          <p className="font-inter-tight text-[11px] text-[#888078]">
            Paste this URL into <code className="text-[#c9a96e]">src/lib/assets.ts</code> for {label}.
          </p>
        </div>
      )}
    </div>
  );
}

export default function AdminMedia() {
  const [tab, setTab] = useState<"homepage" | "services">("homepage");

  return (
    <div className="flex flex-col flex-1">
      <AdminTopbar title="Media Manager" subtitle="Replace homepage and service images" />
      <div className="px-8 pt-5 border-b border-[rgba(255,255,255,0.07)]">
        <div className="flex gap-1">
          {(["homepage", "services"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2.5 font-inter-tight text-[13px] capitalize border-b-2 transition-colors cursor-pointer ${
                tab === t ? "border-[#c9a96e] text-[#e8e4df]" : "border-transparent text-[#888078] hover:text-[#e8e4df]"
              }`}
            >{t}</button>
          ))}
        </div>
      </div>
      <div className="flex-1 px-8 py-6 overflow-y-auto">
        <div className="grid grid-cols-3 gap-4">
          {(tab === "homepage" ? HOMEPAGE_SLOTS : SERVICE_SLOTS).map(slot => (
            <MediaSlot key={slot.key} label={slot.label} storagePath={slot.path} />
          ))}
        </div>
      </div>
    </div>
  );
}
