"use client";
import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { getImageUrl } from "@/lib/supabase/storefront";

interface ImageUploaderProps {
  slug: string;
  bucket?: string;
  images: string[];        // array of storage paths (or full URLs for legacy)
  onChange: (images: string[]) => void;
}

export default function ImageUploader({
  slug,
  bucket = "product-images",
  images,
  onChange,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(async (files: FileList) => {
    if (!files.length || !slug) return;
    setUploading(true);
    const supabase = createClient();
    const newPaths: string[] = [...images];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${slug}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error) { console.error("Upload error:", error); continue; }
      // Store the full storage path including bucket prefix for getImageUrl()
      newPaths.push(`${bucket}/${data.path}`);
    }

    onChange(newPaths);
    setUploading(false);
  }, [images, slug, bucket, onChange]);

  async function removeImage(idx: number) {
    const path = images[idx];
    const supabase = createClient();
    // Only delete from storage if it's a storage path (not a /public/ local path or https URL)
    if (!path.startsWith("/") && !path.startsWith("http")) {
      const filePath = path.replace(`${bucket}/`, "");
      await supabase.storage.from(bucket).remove([filePath]);
    }
    onChange(images.filter((_, i) => i !== idx));
  }

  function setPrimary(idx: number) {
    if (idx === 0) return;
    const reordered = [...images];
    const [item] = reordered.splice(idx, 1);
    reordered.unshift(item);
    onChange(reordered);
  }

  return (
    <div className="space-y-4">
      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((img, idx) => (
            <div key={img + idx} className="relative group aspect-[3/4] rounded-[8px] overflow-hidden bg-[#1e2028]">
              <Image
                src={getImageUrl(img)}
                alt={`Image ${idx + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
              {idx === 0 && (
                <span className="absolute top-2 left-2 bg-[#c9a96e] text-[#0e0f11] font-inter-tight text-[10px] font-medium px-2 py-0.5 rounded-full">
                  Primary
                </span>
              )}
              {/* Hover actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                {idx !== 0 && (
                  <button
                    type="button"
                    onClick={() => setPrimary(idx)}
                    className="bg-[#c9a96e] text-[#0e0f11] font-inter-tight text-[10px] font-medium px-3 py-1.5 rounded-full hover:bg-[#d4b87a] transition-colors cursor-pointer"
                  >
                    Set primary
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="bg-red-500/80 hover:bg-red-500 text-white font-inter-tight text-[10px] px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); upload(e.dataTransfer.files); }}
        className={`border-2 border-dashed rounded-[12px] py-10 text-center cursor-pointer transition-colors ${
          dragOver
            ? "border-[#c9a96e]/60 bg-[#c9a96e]/5"
            : "border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.02)]"
        }`}
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin" />
            <span className="font-inter-tight text-[13px] text-[#888078]">Uploading…</span>
          </div>
        ) : (
          <>
            <svg className="mx-auto mb-3 text-[#888078]" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 16V8M8 12l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 16.5V19a1 1 0 001 1h16a1 1 0 001-1v-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <p className="font-inter-tight text-[13px] text-[#888078]">
              Drop images here or <span className="text-[#c9a96e]">click to browse</span>
            </p>
            <p className="font-inter-tight text-[11px] text-[#888078]/60 mt-1">JPEG, PNG, WebP · max 10MB</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={e => e.target.files && upload(e.target.files)}
        />
      </div>
    </div>
  );
}
