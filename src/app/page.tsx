import Hero from "../components/Hero";
import About from "../components/About";
import SponsorPage from "@/components/SponsorPage";
import PastEvents from "@/components/PastEvents";
import Timeline from "@/components/timeline";
import Footer from "@/components/footer";
import Chatbot from "@/components/Chatbot";
import PrizePool from "@/components/PrizePool";

export default function Home() {
  return (
    <main className="bg-black text-white">
      <Hero />
      <About />
      <Timeline />
      <PrizePool />
      <SponsorPage />
      <PastEvents />
      <Footer />
      <Chatbot />
    </main>
  );
}
