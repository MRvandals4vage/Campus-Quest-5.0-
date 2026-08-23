import Hero from "../components/Hero";
import About from "../components/About";
import SponsorPage from "@/components/SponsorPage";
import PastEvents from "@/components/PastEvents";
import Timeline from "@/components/timeline";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050508] text-white">
      {/* Hero: only bottom vignette, no top darkening */}
      <div className="section-wrap">
        <Hero />
      </div>
      {/* Mid-sections: top + bottom vignette for smooth transitions */}
      <div className="section-wrap-mid">
        <About />
      </div>
      <div className="section-wrap-mid">
        <Timeline />
      </div>
      <div className="section-wrap-mid">
        <SponsorPage />
      </div>
      <div className="section-wrap-mid">
        <PastEvents />
      </div>
      <Footer />
    </main>
  );
}
