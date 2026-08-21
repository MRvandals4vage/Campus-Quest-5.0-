export default function About() {
  return (
    <section id="about" className="relative min-h-screen w-full overflow-hidden">

      {/* ================= BACKGROUND ================= */}
      <div
        className="
          absolute
          inset-0
          bg-cover
          bg-center
          bg-no-repeat
        "
        style={{
          backgroundImage: "url('/assests/about/bg.png')",
        }}
      />

      {/* ============================================================
          DESKTOP / TABLET  –  fully absolute layout (unchanged)
          ============================================================ */}
      <div className="relative z-10 min-h-screen w-full max-sm:hidden">

        {/* ================= ABOUT HEADING ================= */}
        <img
          src="/assests/about/About heading.png"
          alt="About"
          className="
            absolute
            left-[13%]
            top-[15%]
            w-[600px]
            max-w-[48vw]
            h-auto
            z-20

            max-md:left-[7%]
            max-md:top-[20%]
            max-md:w-[420px]
            max-md:max-w-[50vw]
          "
        />

        {/* ================= SPIDER-MAN ================= */}
        <img
          src="/assests/about/Spiderman.png"
          alt="Spider-Man"
          className="
            absolute
            left-[28.5%]
            top-[17%]
            w-[180px]
            h-auto
            z-20
            animate-spiderman-swing

            max-md:left-[27%]
            max-md:top-[11%]
            max-md:w-[110px]
          "
        />

        {/* ================= HELICOPTER ================= */}
        <img
          src="/assests/about/Helicopter.png"
          alt="Helicopter"
          className="
            absolute
            right-[8%]
            top-[5%]
            w-[550px]
            max-w-[42vw]
            h-auto
            z-10

            max-md:right-[1%]
            max-md:top-[6%]
            max-md:w-[330px]
            max-md:max-w-[42vw]
          "
        />

        {/* ================= TEXT ================= */}
        <div
          className="
            absolute
            left-[5%]
            top-[40%]
            w-[56%]
            max-w-[900px]
            text-center
            text-white

            max-md:left-[5%]
            max-md:top-[38%]
            max-md:w-[90%]
            max-md:max-w-none
          "
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          <p
            className="
              text-[28px]
              font-normal
              leading-[1.2]
              tracking-normal
              text-white/80

              max-md:text-[21px]
              max-md:leading-[1.2]
            "
          >
            Gear up for an adrenaline-fueled journey into the
            <br />
            {" "}Multiverse with{" "}
            <span className="font-extrabold text-red-500">
              Campus Quest 5.0!
            </span>
          </p>

          <p
            className="
              mt-[28px]
              text-[26px]
              font-normal
              leading-[1.2]
              tracking-normal
              text-white/80

              max-md:mt-[18px]
              max-md:text-[17px]
              max-md:leading-[1.2]
            "
          >
            <br />
            {" "}If you thrive under pressure, think in code, and are ready to
            <br />
            {" "}swing through a crisis, this event is built specifically for
            <br />
            {" "}YOU. We&apos;re dropping you straight into the Spider-Verse,
            <br />
            {" "}where your programming instincts, lightning-fast problem
            <br />
            {" "}solving, and seamless team coordination are the only
            <br />
            {" "}things standing between victory and total chaos.
          </p>
        </div>

      </div>

      {/* ============================================================
          MOBILE  –  normal document flow, fills full screen height
          ============================================================ */}
      <div
        className="
          relative z-10
          hidden max-sm:flex
          flex-col items-center
          justify-between
          text-center text-white
          min-h-screen
          w-full
          px-6 pt-24 pb-10
        "
        style={{ fontFamily: "Montserrat, sans-serif" }}
      >
        {/* TOP GROUP: heading + spider-man */}
        <div className="flex flex-col items-center w-full">
          <img
            src="/assests/about/About heading.png"
            alt="About"
            className="w-[80vw] max-w-[300px] h-auto z-20"
          />
          <img
            src="/assests/about/Spiderman.png"
            alt="Spider-Man"
            className="w-[22vw] max-w-[90px] h-auto mt-3 animate-spiderman-swing z-20"
          />
        </div>

        {/* MIDDLE GROUP: text */}
        <div className="flex flex-col items-center w-full gap-4 px-1">
          <p className="text-[17px] font-normal leading-[1.55] text-white/90 w-full">
            Gear up for an adrenaline-fueled journey into the Multiverse with{" "}
            <span className="font-extrabold text-red-500">Campus Quest 5.0!</span>
          </p>
          <p className="text-[14px] font-normal leading-[1.7] text-white/80 w-full">
            If you thrive under pressure, think in code, and are ready to swing
            through a crisis, this event is built specifically for YOU. We&apos;re
            dropping you straight into the Spider-Verse, where your programming
            instincts, lightning-fast problem solving, and seamless team
            coordination are the only things standing between victory and total
            chaos.
          </p>
        </div>

        {/* BOTTOM GROUP: helicopter */}
        <img
          src="/assests/about/Helicopter.png"
          alt="Helicopter"
          className="w-[70vw] max-w-[270px] h-auto z-10"
        />
      </div>

    </section>
  );
}