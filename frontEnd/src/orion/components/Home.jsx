import React, { useEffect } from "react";
import Header from "./Header";
import Hero from "./Hero";
import MeetORION from "./MeetORION";
import CoreBenefits from "./CoreBenefits";
import AIAdoption from "./AIAdoption";
import TrustedBy from "./TrustedBy";
import HowORIONWorksPage from "./HowORIONWorksPage";
import AgentORIONCapabilities from "./AgentORIONCapabilities";
import UseCasesCloud from "./UseCasesCloud";
import DelightfulService from "./DelightfulService";
import PricingSection from "./PricingSection";
import Testimonials from "./Testimonials";
import FAQs from "./FAQs";
import Contact from "./Contact";
import FinalCTA from "./FinalCTA";
import Footer from "./Footer";
import FloatingContactButtons from "./FloatingContactButtons";
import ScrollToTopButton from "./ScrollToTopButton";
import { initScrollAnimations } from "../utils/animations";
import "../styles/index.css";

function Home() {
  useEffect(() => {
    document.documentElement.classList.add("scroll-smooth");
    const cleanup = initScrollAnimations();
    return () => {
      document.documentElement.classList.remove("scroll-smooth");
      cleanup?.();
    };
  }, []);

  return (
    <div className="orion-landing App relative">
      <Header />
      <main>
        <Hero />
        <MeetORION />
        <CoreBenefits />
        <UseCasesCloud />
        <TrustedBy />
        <HowORIONWorksPage />
        <AgentORIONCapabilities />
        <DelightfulService />
        <AIAdoption />
        <PricingSection />
        <Testimonials />
        <FAQs />
        <Contact />
        <FinalCTA />
      </main>
      <Footer />
      <FloatingContactButtons />
      <ScrollToTopButton />
    </div>
  );
}

export default Home;

