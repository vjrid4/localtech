import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import DeviceTimeline from "@/components/DeviceTimeline";
import RepairIntelligence from "@/components/RepairIntelligence";
import KnowledgeUniverse from "@/components/KnowledgeUniverse";
import MultiRoleEcosystem from "@/components/MultiRoleEcosystem";
import Pricing from "@/components/Pricing";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="bg-graphite-950">
      <Navigation />
      <Hero />
      <DeviceTimeline />
      <RepairIntelligence />
      <KnowledgeUniverse />
      <MultiRoleEcosystem />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
