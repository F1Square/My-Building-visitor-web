import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import ScrollScrubSection from "@/components/landing/scroll/ScrollScrubSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import PricingSection from "@/components/landing/PricingSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FAQSection from "@/components/landing/FAQSection";
import ContactSection from "@/components/landing/ContactSection";
import Footer from "@/components/landing/Footer";
import { LandingSeo } from "@/components/landing/LandingSeo";
import { ScrollProgressBar } from "@/components/landing/scroll/ScrollProgressBar";
import { useLandingArrowNav } from "@/hooks/useLandingArrowNav";

const Index = () => {
  useLandingArrowNav(true);

  return (
    <div className="min-h-screen bg-background">
      <LandingSeo />
      <ScrollProgressBar />
      <Navbar />
      <HeroSection />
      <ScrollScrubSection />
      <FeaturesSection />
      <PricingSection />
      <TestimonialsSection />
      <FAQSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
