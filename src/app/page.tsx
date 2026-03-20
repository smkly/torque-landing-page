import Hero from "./components/Hero";
import TrustBar from "./components/TrustBar";
import GrowthStack from "./components/GrowthStack";
import Solutions from "./components/Solutions";
import PlaybooksSection from "./components/PlaybooksSection";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import TopBanner from "./components/TopBanner";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Calculator, Terminal } from "lucide-react";

export default function Home() {
  return (
    <>
      {/* Top Banner */}
      <TopBanner />

      <Navbar />

      {/* Main content — sits above the fixed footer */}
      <div className="relative z-10 bg-background">
        {/* Hero */}
        <Hero />

        {/* Trust Bar — customer logos */}
        <TrustBar />

        {/* Platform Features */}
        <GrowthStack />

        {/* Solutions */}
        <Solutions />

        {/* ROI Calculator Teaser */}
        <section className="w-full px-6 md:px-12 lg:px-20 py-20 md:py-28 bg-black/[0.015] border-t border-black/10">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 mb-4 font-mono text-[10px] uppercase tracking-wider text-black/40 border border-black/10 px-2 py-1 rounded-[3px]">
              <Calculator className="w-3 h-3" />
              ROI Calculator
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-medium text-black leading-[1.1] tracking-tight mb-4">
              Model Your Impact
            </h2>
            <p className="text-base md:text-lg text-black/60 mb-8">
              See projected volume, users, and ROI across bear, base, and bull scenarios. Based on $10M+ in real campaign data.
            </p>
            <Button variant="accent" href="/roi" className="group">
              Open Calculator
              <ArrowUpRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Button>
          </div>
        </section>

        {/* Playbooks */}
        <PlaybooksSection />
      </div>

      {/* Footer — fixed behind content, revealed on scroll */}
      <div className="h-screen" />
      <Footer />
    </>
  );
}
