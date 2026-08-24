

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import RegisterModal from "./RegisterModal";

export default function Footer() {
  const [showRegister, setShowRegister] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.substring(1);
      const elem = document.getElementById(targetId);
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth" });
      }
    } else if (href === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "#about" },
    { name: "Timeline", href: "#timeline" },
    { name: "Prize Pool", href: "#prizepool" },
    { name: "Sponsors", href: "#sponsors" },
    { name: "Past Events", href: "#pastevents" },
  ];

  return (
    <>
      <footer className="relative w-full overflow-hidden flex flex-col items-center justify-center min-h-[600px] py-12">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/Footer/bg.png"
            alt="Footer Background"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="relative z-10 flex flex-col items-center w-full px-4 max-w-6xl mx-auto h-full justify-between gap-12">

          {/* Navigation Links */}
          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-white font-medium text-lg tracking-wide">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={(e) => handleScroll(e, link.href)}
                className="hover:text-red-500 transition-colors duration-300 decoration-2 underline-offset-4 hover:underline"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Logo */}
          <div className="w-full flex justify-center mt-8">
            <Image
              src="/assets/Footer/Logo.png"
              alt="Campus Quest 5.0"
              width={800}
              height={400}
              className="w-[90%] max-w-[800px] h-auto drop-shadow-2xl"
            />
          </div>

          {/* Register Button & Socials Wrapper */}
          <div className="flex flex-col items-center gap-8 mt-4">

            {/* Register Button */}
            {!isRegistered ? (
              <button
                onClick={() => setShowRegister(true)}
                className="bg-white text-black font-bold text-2xl px-16 py-4 min-w-[280px] rounded-full hover:scale-105 transition-transform duration-300 shadow-[0_0_15px_rgba(255,255,255,0.4)] whitespace-nowrap flex items-center justify-center tracking-widest"
              >
                REGISTER
              </button>
            ) : (
              <div className="bg-green-500 text-white font-bold text-2xl px-16 py-4 min-w-[280px] rounded-full shadow-[0_0_15px_rgba(72,187,120,0.4)] whitespace-nowrap flex items-center justify-center tracking-widest">
                REGISTERED
              </div>
            )}

            {/* Social Icons using icons.png sprite/image */}
            <div className="relative hover:scale-105 transition-transform duration-300 mt-2">
              <Image
                src="/assets/Footer/icons.png"
                alt="Social Icons"
                width={120}
                height={50}
                className="w-[120px] h-auto object-contain drop-shadow-lg"
              />
              {/* Invisible clickable overlays */}
              <a
                href="https://www.linkedin.com/company/coding-ninjas-club-srm/posts/?feedView=all"
                target="_blank"
                rel="noopener noreferrer"
                className="block absolute left-0 top-0 w-1/2 h-full z-10 cursor-pointer"
                aria-label="LinkedIn"
              />
              <a
                href="https://www.instagram.com/srm_cn/"
                target="_blank"
                rel="noopener noreferrer"
                className="block absolute right-0 top-0 w-1/2 h-full z-10 cursor-pointer"
                aria-label="Instagram"
              />
            </div>

          </div>
        </div>
      </footer>

      {/* Register Modal */}
      <RegisterModal
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        onSuccess={() => setIsRegistered(true)}
      />
    </>
  );
}
