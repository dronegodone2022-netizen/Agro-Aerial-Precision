import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedSection from '../components/AnimatedSection';
import { INDUSTRIES, SERVICES } from '../constants';

// Overview of every industry and the services we offer in it (/services)
const Services: React.FC = () => (
  <div className="bg-slate-50 pb-16">
    <section className="bg-green-950 pt-32 pb-14 text-center text-white">
      <AnimatedSection className="container mx-auto px-4" animationType="unveil-scale" delay={0.05}>
        <h1 className="text-4xl font-bold sm:text-5xl">Our Services</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
          Drone surveys, inspection and aerial data for mining, construction, infrastructure, the environment and
          agriculture - plus drone repair and professional training.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/contact" className="rounded-full bg-lime-500 px-8 py-3 font-bold text-slate-900 hover:bg-lime-400">
            Request a Quote
          </Link>
          <Link to="/academy" className="rounded-full border border-white/30 px-8 py-3 font-bold hover:bg-white/10">
            Drone Training
          </Link>
        </div>
      </AnimatedSection>
    </section>

    <div className="container mx-auto space-y-10 px-4 pt-12">
      {INDUSTRIES.map((industry) => {
        const services = SERVICES.filter((s) => s.category === industry.category);
        return (
          <AnimatedSection key={industry.slug} animationType="unveil" delay={0.05}>
            <section className="overflow-hidden rounded-3xl bg-white shadow-md lg:grid lg:grid-cols-3">
              <Link to={`/services/${industry.slug}`} className="group relative block h-56 overflow-hidden lg:h-full">
                <img loading="lazy" src={industry.image} alt={industry.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-linear-to-t from-green-950/80 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <p className="text-sm font-semibold text-lime-300">
                    <i className={industry.icon} aria-hidden="true"></i> {industry.tagline}
                  </p>
                  <h2 className="text-2xl font-bold">{industry.name}</h2>
                </div>
              </Link>

              <div className="p-6 sm:p-8 lg:col-span-2">
                <p className="text-slate-600">{industry.description}</p>
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {services.map((service) => (
                    <Link
                      key={service.id}
                      to={`/services/${industry.slug}`}
                      className="rounded-xl border border-lime-200 p-4 transition-colors hover:border-lime-500 hover:bg-lime-50"
                    >
                      <h3 className="font-bold text-green-900">{service.title}</h3>
                      <p className="mt-1 text-sm text-slate-600 line-clamp-2">{service.description}</p>
                    </Link>
                  ))}
                </div>
                <Link to={`/services/${industry.slug}`} className="mt-5 inline-flex items-center gap-2 font-bold text-green-800 hover:gap-3 transition-all">
                  Explore {industry.name} <i className="ri-arrow-right-line" aria-hidden="true"></i>
                </Link>
              </div>
            </section>
          </AnimatedSection>
        );
      })}
    </div>
  </div>
);

export default Services;
