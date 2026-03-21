import Hero from "./components/Hero";
import TrustBar from "./components/TrustBar";
import GrowthStack from "./components/GrowthStack";
import Solutions from "./components/Solutions";
import CaseStudies from "./components/CaseStudies";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import TopBanner from "./components/TopBanner";

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

        {/* Case Studies */}
        <CaseStudies />
      </div>

      {/* Footer — fixed behind content, revealed on scroll */}
      <div className="h-screen" />
      <Footer />
    </>
  );
}
