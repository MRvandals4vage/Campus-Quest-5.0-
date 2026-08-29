import Hero from "../components/Hero";
import About from "../components/About";
import SponsorPage from "@/components/SponsorPage";
import PastEvents from "@/components/PastEvents";
import Timeline from "@/components/timeline";
import Footer from "@/components/footer";
import Chatbot from "@/components/Chatbot";

export default function Home() {
  return (
    <main className="bg-black text-white">
      <div>
        <Hero />
      </div>
      <div className="section-wrap">
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
      <Chatbot />
    </main>
  );
}
