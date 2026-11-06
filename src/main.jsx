import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MotionContext, useMotionSetting, useRevealAll } from "./lib/motion.js";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Work from "./components/Work.jsx";
import { Metrics, Toolkit, Services, About, Process, Experience, Contact, Footer } from "./components/Sections.jsx";

function App() {
  const [motionOn, setMotionOn] = useMotionSetting();
  useRevealAll([]);
  return (
    <MotionContext.Provider value={motionOn}>
      <a href="#main" className="skip">Skip to content</a>
      <Header motionOn={motionOn} setMotionOn={setMotionOn} />
      <main id="main">
        <Hero />
        <Work />
        <Metrics />
        <Toolkit />
        <Services />
        <About />
        <Process />
        <Experience />
        <Contact />
      </main>
      <Footer />
    </MotionContext.Provider>
  );
}

createRoot(document.getElementById("root")).render(<StrictMode><App /></StrictMode>);
