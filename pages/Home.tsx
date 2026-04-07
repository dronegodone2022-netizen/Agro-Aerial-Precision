
import React from 'react';
import { Link } from 'react-router-dom';
import { SERVICES, TESTIMONIALS } from '../constants';
import AnimatedSection from '../components/AnimatedSection';

const Home: React.FC = () => {
  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden py-12 sm:py-16 md:py-20">
        {/* Background Image */}
        <div className="absolute inset-0 bg-slate-900">
          <img
            src="public/service bg.jpg"
            alt="Hero Background"
            className="w-full h-full object-cover opacity-40 sm:opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/70 to-slate-900/40"></div>
        </div>

        {/* Content */}
        <AnimatedSection className="container mx-auto pt-16 px-4 sm:px-6 md:px-8 relative z-10 text-white w-full" animationType="unveil-scale" delay={0.1}>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl mx-4 sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-4 sm:mb-6 md:mb-8">
              Using Drones For Precision Agriculture Solutions to Empower <span className="text-lime-500 sm:text-lime-600">Modern Farmers.</span>
            </h1>
            <p className="text-xs mx-40 sm:text-sm md:text-base lg:text-lg text-slate-300 mb-6 sm:mb-10 md:mb-20 leading-relaxed">
              We are committed to providing farmers with advanced drone technology and data analytics tools tailored to their specific needs.
            </p>
            <div className="flex flex-col pt-12 md:pt-4 sm:flex-row gap-4 md:flex-row sm:gap-5 justify-center items-center">
              <Link
                to="/contact"
                className="w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-3 md:py-4 lg:py-2 bg-green-700 rounded-full font-bold text-lg sm:text-base md:text-lg hover:bg-lime-700 transition-all"
              >
                Consult for Free
              </Link>
              <Link
                to="/Academy"
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
          <div className="flex justify-center items-center gap-12 opacity-90">
            <div className="w-12 hover:scale-110 transition-transform duration-300"><img src="public/aiph.jpeg" alt="AIPH industry partner logo displayed as trusted brand endorsement" /></div>
            <div className="w-24 hover:scale-110 transition-transform duration-300"><img src="public/brand 2.png" alt="trust logos" /></div>
            <div className="w-12 hover:scale-110 transition-transform duration-300"><img src="public/brand 3.png" alt="trust logos" /></div>
            <div className="w-24 hover:scale-110 transition-transform duration-300"><img src="public/bayer.png" alt="trust logos" /></div>
          </div>
        </AnimatedSection>
      </section>

      {/* Solutions Section */}
      <section className="py-12 bg-slate-50">
        <AnimatedSection className="container mx-auto px-4" animationType="unveil" delay={0.05}>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4">Our Solutions</h2>
            <div className="h-1.5 w-20 bg-lime-500 mx-auto rounded-full mb-6"></div>
            <p className="text-slate-600">Comprehensive aerial intelligence services designed to maximize yield, reduce costs, and ensure sustainable operations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map((service, index) => (
              <AnimatedSection
                key={service.id}
                className="group bg-white md:grid-cols-2 gap-12 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-lime-100"
                animationType="unveil"
                delay={index * 0.1}
              >
                <div className="relative h-64 overflow-hidden">
                  <img src={service.image} alt={service.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-4 left-4 bg-lime-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {service.category}
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-3">{service.title}</h3>
                  <p className="text-slate-600 mb-6 line-clamp-3">{service.description}</p>
                  <Link to={`/services/${service.category.toLowerCase()}`} className="inline-flex items-center gap-2 font-bold text-green-800 group-hover:gap-4 transition-all">
                    Read More <i className="ri-arrow-right-line"></i>
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
                  <div className="flex-shrink-0 w-12 h-12 bg-lime-600 rounded-xl flex items-center justify-center font-bold text-xl">1</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Precision Crop Management</h4>
                    <p className="text-slate-400">Embracing a data-driven revolution that leverages advanced technologies to enhance productivity and sustainability.</p>
                  </div>
                </AnimatedSection>
                <AnimatedSection className="flex gap-6" animationType="unveil-left" delay={0.4}>
                  <div className="flex-shrink-0 w-12 h-12 bg-lime-600 rounded-xl flex items-center justify-center font-bold text-xl">2</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Data Collection & Analytics</h4>
                    <p className="text-slate-400">Redefining modern agriculture by enabling farmers to harness unprecedented levels of precision and insight.</p>
                  </div>
                </AnimatedSection>
                <AnimatedSection className="flex gap-6" animationType="unveil-left" delay={0.6}>
                  <div className="flex-shrink-0 w-12 h-12 bg-lime-600 rounded-xl flex items-center justify-center font-bold text-xl">3</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Transforming Data into Action</h4>
                    <p className="text-slate-400">Our high-resolution maps and specialized sensors turn raw aerial imagery into actionable management plans.</p>
                  </div>
                </AnimatedSection>
              </div>
            </div>
            <AnimatedSection className="relative" animationType="unveil-right" delay={0.3}>
              <video
                src="public/agric-video.mp4"
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
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white overflow-hidden">
        <AnimatedSection className="container mx-auto px-4 sm:px-6 md:px-8" animationType="unveil-right" delay={0.05}>
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">What Our Customers Say</h2>
            <div className="h-1 sm:h-1.5 w-16 sm:w-20 bg-green-800 mx-auto rounded-full mb-4 sm:mb-6"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {TESTIMONIALS.map((t, index) => (
              <AnimatedSection
                key={t.id}
                className="bg-green-50 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl relative hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-1"
                animationType="unveil"
                delay={index * 0.15}
              >
                <i className="ri-double-quotes-l text-3xl sm:text-4xl text-lime-400 absolute top-4 sm:top-6 right-4 sm:right-6"></i>
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <img src={t.avatar} alt={t.name} className="w-12 sm:w-14 h-12 sm:h-14 rounded-full border-2 border-lime-500 p-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <h5 className="font-bold text-slate-900 text-sm sm:text-base truncate">{t.name}</h5>
                    <p className="text-xs sm:text-sm text-slate-500 truncate">{t.company}</p>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-slate-700 italic leading-relaxed line-clamp-4">
                  {t.content}
                </p>
              </AnimatedSection>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-lime-100 text-green-900">
        <AnimatedSection className="container mx-auto px-4 text-center" animationType="unveil-scale" delay={0.05}>
          <h2 className="text-4xl font-bold mb-6">Ready to upgrade your farm management?</h2>
          <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
            Join hundreds of modern farmers who have increased their yield and reduced costs with our aerial solutions.
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
