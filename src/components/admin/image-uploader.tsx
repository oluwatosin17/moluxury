"use client";
import { useState } from "react";
import Image from "next/image";
import { getImageUrl } from "@/lib/supabase/utils";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);

  function openWidget() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cloudinary = (window as any).cloudinary;
    if (!cloudinary) {
      alert("Cloudinary widget not loaded yet. Please wait a moment and try again.");
      return;
    }

    setUploading(true);

    const widget = cloudinary.createUploadWidget(
      {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
        sources: ["local", "url"],
        multiple: true,
        maxFiles: 10,
        clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
        maxFileSize: 10000000,
        folder: "moluxury",
        styles: {
          palette: {
            window: "#16181d",
            windowBorder: "#c9a96e",
            tabIcon: "#c9a96e",
            menuIcons: "#888078",
            textDark: "#e8e4df",
            textLight: "#e8e4df",
            link: "#c9a96e",
            action: "#c9a96e",
            inactiveTabIcon: "#888078",
            error: "#f44235",
            inProgress: "#c9a96e",
            complete: "#20b832",
            sourceBg: "#0e0f11",
          },
        },
      },
      (error: unknown, result: { event: string; info: { secure_url: string } }) => {
        if (error) {
          setUploading(false);
          return;
        }
        if (result.event === "success") {
          onChange([...images, result.info.secure_url]);
        }
        if (result.event === "close") {
          setUploading(false);
        }
      }
    );

    widget.open();
  }

  function removeImage(idx: number) {
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

      <button
        type="button"
        onClick={openWidget}
        className={`w-full border-2 border-dashed rounded-[12px] py-10 text-center cursor-pointer transition-colors ${
          uploading
            ? "border-[#c9a96e]/40 bg-[#c9a96e]/5"
            : "border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.02)]"
        }`}
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin" />
            <span className="font-inter-tight text-[13px] text-[#888078]">Opening upload widget…</span>
          </div>
        ) : (
          <>
            <svg className="mx-auto mb-3 text-[#888078]" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 16V8M8 12l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 16.5V19a1 1 0 001 1h16a1 1 0 001-1v-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <p className="font-inter-tight text-[13px] text-[#888078]">
              Click to upload via <span className="text-[#c9a96e]">Cloudinary</span>
            </p>
            <p className="font-inter-tight text-[11px] text-[#888078]/60 mt-1">JPEG, PNG, WebP · max 10MB · multiple allowed</p>
          </>
        )}
      </button>
    </div>
  );
}
