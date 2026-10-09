
import React from 'react';
import { Link } from 'react-router-dom';
import { INDUSTRIES } from '../constants';
import Testimonials from '../components/Testimonials';
import AnimatedSection from '../components/AnimatedSection';

const asset = (file: string) => new URL(`../src/assets/${file}`, import.meta.url).href;
const heroBg = asset('sola3.jpg');
const aiphLogo = asset('aiph.jpeg');
const brand2Logo = asset('brand 2.png');
const brand3Logo = asset('brand 3.png');
const bayerLogo = asset('bayer.png');
const agricVideo = asset('agric-video.mp4');

const Home: React.FC = () => {
  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden py-12 sm:py-16 md:py-20">
        {/* Background Image */}
        <div className="absolute inset-0 bg-slate-900">
          <img
            src={heroBg}
            alt="Hero Background"
            className="w-full h-full object-cover opacity-40 sm:opacity-50"
          />
          <div className="absolute inset-0 bg-linear-to-r from-slate-900 via-slate-900/70 to-slate-900/40"></div>
        </div>

        {/* Content */}
        <AnimatedSection className="container mx-auto pt-16 px-4 sm:px-6 md:px-8 relative z-10 text-white w-full" animationType="unveil-scale" delay={0.1}>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl mx-4 sm:text-3xl md:text-4xl lg:text-5xl/tight xl:text-6xl/tight font-bold leading-tight mb-4 sm:mb-6 md:mb-4">
              Drone Surveys, Inspection &amp; Aerial Data for <span className="text-lime-500 sm:text-lime-600">Mining, Construction &amp; Infrastructure.</span>
            </h1>
            <p className="text-slate-300 sm:text-slate-400 text-base sm:text-lg md:text-lg lg:text-xl mb-8 max-w-xl mx-auto">
              Professional drone operations across Sierra Leone: mine and site surveys, stockpile volumes, infrastructure and thermal inspection, environmental monitoring and precision agriculture - plus professional drone training.
            </p>
            <div className="flex flex-col pt-12 md:pt-4 sm:flex-row gap-4 md:flex-row sm:gap-5 justify-center items-center">
              <Link
                to="/contact"
                className="w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-3 md:py-4 lg:py-2 bg-green-700 rounded-full font-bold text-lg sm:text-base md:text-lg hover:bg-lime-700 transition-all"
              >
                Request a Survey
              </Link>
              <Link
                to="/academy"
                className="w-full sm:w-auto px-6 sm:px-8 py-4 lg:py-2 sm:py-3 md:py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full font-bold text-lg sm:text-base md:text-lg hover:bg-lime-500/20 transition-all"
              >
                Training Academy
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* Trusted By */}
      <section className="py-4 bg-lime-100 border-b border-slate-300">
        <AnimatedSection className="container mx-auto px-4 lg:mb-2 sm:px-4" animationType="unveil" delay={0.05}>
          <h2 className="text-center text-slate-400 font-semibold uppercase tracking-widest text-sm mb-10">Trusted By Industry Leaders</h2>
          <div className="flex justify-center items-center gap-6 sm:gap-8 md:gap-10 lg:gap-12 opacity-90 flex-wrap">
            <div className="w-12 sm:w-12 md:w-14 lg:w-16 hover:scale-110 transition-transform duration-300">
              <img loading="lazy" src={aiphLogo} alt="AIPH industry partner logo displayed as trusted brand endorsement" />
            </div>
            <div className="w-16 sm:w-20 md:w-24 lg:w-28 hover:scale-110 transition-transform duration-300">
              <img loading="lazy" src={brand2Logo} alt="trust logos" />
            </div>
            <div className="w-12 sm:w-12 md:w-14 lg:w-16 hover:scale-110 transition-transform duration-300">
              <img loading="lazy" src={brand3Logo} alt="trust logos" />
            </div>
            <div className="w-20 sm:w-20 md:w-24 lg:w-28 hover:scale-110 transition-transform duration-300">
              <img loading="lazy" src={bayerLogo} alt="trust logos" />
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* Solutions Section */}
      <section id="services" className="scroll-mt-20 py-12 bg-slate-50">
        <AnimatedSection className="container mx-auto px-4" animationType="unveil" delay={0.05}>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4">Industries We Serve</h2>
            <div className="h-1.5 w-20 bg-lime-500 mx-auto rounded-full mb-6"></div>
            <p className="text-slate-600">Accurate aerial data and drone services that make operations safer, faster and better informed - from the mine pit to the farm field.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {INDUSTRIES.map((industry, index) => (
              <AnimatedSection
                key={industry.slug}
                className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-lime-100 flex flex-col"
                animationType="unveil"
                delay={index * 0.1}
              >
                <div className="relative h-56 overflow-hidden">
                  <img loading="lazy" src={industry.image} alt={industry.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-4 left-4 bg-lime-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <i className={industry.icon} aria-hidden="true"></i> {industry.tagline}
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <h3 className="text-2xl font-bold mb-3">{industry.name}</h3>
                  <p className="text-slate-600 mb-6">{industry.description}</p>
                  <Link to={`/services/${industry.slug}`} className="mt-auto inline-flex items-center gap-2 font-bold text-green-800 group-hover:gap-4 transition-all">
                    Explore {industry.name} <i className="ri-arrow-right-line"></i>
                  </Link>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-green-950 text-white relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-900/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-900/10 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2"></div>

        <AnimatedSection className="container mx-auto px-4 relative z-10" animationType="unveil-left" delay={0.05}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-8">How It Works</h2>
              <div className="space-y-10">
                <AnimatedSection className="flex gap-6" animationType="unveil-left" delay={0.2}>
                  <div className="shrink-0 w-12 h-12 bg-lime-600 rounded-xl flex items-center justify-center font-bold text-xl">1</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Plan the Mission</h4>
                    <p className="text-slate-400">We agree what you need - accuracy, outputs and deadlines - then plan safe, permitted flights for your site.</p>
                  </div>
                </AnimatedSection>
                <AnimatedSection className="flex gap-6" animationType="unveil-left" delay={0.4}>
                  <div className="shrink-0 w-12 h-12 bg-lime-600 rounded-xl flex items-center justify-center font-bold text-xl">2</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Capture the Data</h4>
                    <p className="text-slate-400">Experienced pilots fly RGB, thermal, multispectral or LiDAR sensors with ground control and RTK for survey-grade accuracy.</p>
                  </div>
                </AnimatedSection>
                <AnimatedSection className="flex gap-6" animationType="unveil-left" delay={0.6}>
                  <div className="shrink-0 w-12 h-12 bg-lime-600 rounded-xl flex items-center justify-center font-bold text-xl">3</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Deliver Insights</h4>
                    <p className="text-slate-400">Maps, 3D models, volumes, inspection reports and recommendations - in formats ready for your engineers, planners and managers.</p>
                  </div>
                </AnimatedSection>
              </div>
            </div>
            <AnimatedSection className="relative" animationType="unveil-right" delay={0.3}>
              <video
                src={agricVideo}
                className="rounded-3xl shadow-2xl border-2 border-lime-600"
                autoPlay
                loop
                muted
                playsInline
              />

              <div className="absolute -bottom-6 -left-6 bg-lime-600 p-8 rounded-3xl hidden md:block">
                <p className="text-2xl font-bold">24/7</p>
                <p className="text-sm opacity-80">Support & Monitoring</p>
              </div>
            </AnimatedSection>
          </div>
        </AnimatedSection>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* Contact CTA */}
      <section className="py-20 bg-lime-100 text-green-900">
        <AnimatedSection className="container mx-auto px-4 text-center" animationType="unveil-scale" delay={0.05}>
          <h2 className="text-4xl font-bold mb-6">Ready to put aerial data to work?</h2>
          <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
            Whether it's a mine pit, a construction site, a power line or a farm, tell us what you need to know and we'll plan the right survey.
          </p>
          <Link to="/contact" className="inline-block bg-lime-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-green-800 transition-all shadow-xl duration-500 hover:text-white">
            Get Started Today
          </Link>
        </AnimatedSection>
      </section>
    </div>
  );
};

export default Home;
