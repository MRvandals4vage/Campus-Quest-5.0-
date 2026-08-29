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
      <Hero />
      <About />
      <Timeline />
      <SponsorPage />
      <PastEvents />
      <Footer />
      <Chatbot />
    </main>
  );
}
