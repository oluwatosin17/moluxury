import HeroSection from "@/components/hero-section";
import MoodSection from "@/components/mood-section";
import NewCollectionSection from "@/components/new-collection-section";
import SignaturePiecesSection from "@/components/signature-pieces-section";
import TrendingSection from "@/components/trending-section";
import ExperienceSection from "@/components/experience-section";
import InsideMoLuxurySection from "@/components/inside-moluxury-section";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import FixedSearch from "@/components/fixed-search";
import WishlistOverlay from "@/components/wishlist-overlay";
import CartOverlay from "@/components/cart-overlay";
import HeartParticleLayer from "@/components/heart-particle-layer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <FixedSearch />
      <WishlistOverlay />
      <CartOverlay />
      <HeartParticleLayer />
      <main className="flex flex-col items-start w-full bg-surface">
        <HeroSection />
        <MoodSection />
        <NewCollectionSection />
        <SignaturePiecesSection />
        <TrendingSection />
        <ExperienceSection />
        <InsideMoLuxurySection />
        <Footer />
      </main>
    </>
  );
}
