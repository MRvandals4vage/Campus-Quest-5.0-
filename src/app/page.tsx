import Hero from "../components/Hero";
import About from "../components/About";
import SponsorPage from "@/components/SponsorPage";
import PastEvents from "@/components/PastEvents";
import Timeline from "@/components/timeline";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050508] text-white">
      <div className="section-wrap">
        <Hero />
      </div>
      <div className="section-wrap">
        <About />
      </div>
      <div className="section-wrap">
        <Timeline />
      </div>
      <div className="section-wrap">
        <SponsorPage />
      </div>
      <div className="section-wrap">
        <PastEvents />
      </div>
      <Footer />
    </main>
  );
}
