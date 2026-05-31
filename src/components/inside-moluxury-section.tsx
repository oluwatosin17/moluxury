"use client";
import Script from "next/script";

const tiktoks = [
  { id: "7547427233611123975", cite: "https://www.tiktok.com/@moluxuryhairs/video/7547427233611123975" },
  { id: "7563737294310624530", cite: "https://www.tiktok.com/@moluxuryhairs/video/7563737294310624530" },
  { id: "7640221034725084423", cite: "https://www.tiktok.com/@moluxuryhairs/video/7640221034725084423" },
  { id: "7617554089324317970", cite: "https://www.tiktok.com/@moluxuryhairs/video/7617554089324317970" },
  { id: "7607909388048731400", cite: "https://www.tiktok.com/@moluxuryhairs/video/7607909388048731400" },
  { id: "7629799957968506120", cite: "https://www.tiktok.com/@moluxuryhairs/video/7629799957968506120" },
  { id: "7607016064681102600", cite: "https://www.tiktok.com/@moluxuryhairs/video/7607016064681102600" },
  { id: "7564474964246564104", cite: "https://www.tiktok.com/@moluxuryhairs/video/7564474964246564104" },
  { id: "7560402909851061522", cite: "https://www.tiktok.com/@moluxuryhairs/video/7560402909851061522" },
  { id: "7561507345499475218", cite: "https://www.tiktok.com/@moluxuryhairs/video/7561507345499475218" },
];

export default function InsideMoLuxurySection() {
  return (
    <>
      <Script src="https://www.tiktok.com/embed.js" strategy="lazyOnload" />
      <section className="bg-surface flex flex-col gap-8 lg:gap-[41px] items-center pb-16 lg:pb-[120px] pt-12 lg:pt-20 w-full overflow-hidden">
        {/* Heading */}
        <div className="flex flex-col gap-[7px] items-center text-center px-4 lg:px-0 lg:w-[443px]">
          <h2 className="font-cormorant italic text-[36px] lg:text-[60px] tracking-[-3px] lg:tracking-[-4px] text-primary leading-normal lg:whitespace-nowrap">
            Inside MoLuxury
          </h2>
          <p className="font-inter-tight font-light text-[14px] lg:text-[18px] text-tertiary leading-normal lg:w-[335px]">
            A closer look at how our pieces are worn and styled.
          </p>
        </div>

        {/* TikTok embeds — horizontal scroll row */}
        <div className="w-full overflow-x-auto scrollbar-hide">
          <div className="flex gap-3 lg:gap-4 px-4 lg:px-20 pb-4" style={{ minWidth: "max-content" }}>
            {tiktoks.map((tiktok) => (
              <div
                key={tiktok.id}
                className="shrink-0 rounded-[12px] overflow-hidden"
                style={{ width: 280 }}
              >
                <blockquote
                  className="tiktok-embed"
                  cite={tiktok.cite}
                  data-video-id={tiktok.id}
                  style={{ maxWidth: "280px", minWidth: "280px" }}
                >
                  <section>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      title="@moluxuryhairs"
                      href="https://www.tiktok.com/@moluxuryhairs?refer=embed"
                    >
                      @moluxuryhairs
                    </a>
                  </section>
                </blockquote>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
