import React, { useEffect, useRef, useState } from 'react';
import { TESTIMONIALS } from '../constants';

const ROTATE_MS = 8000;

/** Quotes are stored with their own quotation marks; the design adds its own. */
const cleanQuote = (text: string) => text.trim().replace(/^["“]+|["”]+$/g, '');

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const Testimonials: React.FC = () => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cycle, setCycle] = useState(0); // restarts the progress bar when the slide changes
  const touchStartX = useRef<number | null>(null);
  const count = TESTIMONIALS.length;
  const autoplay = count > 1 && !prefersReducedMotion();

  const goTo = (index: number) => {
    setActive((index + count) % count);
    setCycle((c) => c + 1);
  };

  useEffect(() => {
    if (!autoplay || paused) return;
    const timer = setTimeout(() => goTo(active + 1), ROTATE_MS);
    return () => clearTimeout(timer);
  }, [active, paused, autoplay, cycle]);

  if (count === 0) return null;
  const current = TESTIMONIALS[active];

  return (
    <section
      className="relative overflow-hidden bg-slate-950 py-16 text-white sm:py-20 lg:py-28"
      aria-labelledby="testimonials-heading"
    >
      {/* Decorative background */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-lime-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-green-500/10 blur-3xl" />

      <div className="container relative mx-auto px-4 sm:px-6 md:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center lg:mb-16">
          <span className="text-sm font-bold uppercase tracking-widest text-lime-400">Testimonials</span>
          <h2 id="testimonials-heading" className="mt-3 text-3xl font-bold sm:text-4xl lg:text-5xl">
            What Our Clients Say
          </h2>
          <p className="mt-4 text-slate-300">Real feedback from the people and organisations we work with.</p>
        </div>

        <div
          className="grid grid-cols-1 items-center gap-8 lg:grid-cols-5 lg:gap-12"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          {/* Featured quote */}
          <figure
            className="relative rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-sm sm:p-10 lg:col-span-3"
            onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
              if (touchStartX.current === null) return;
              const delta = e.changedTouches[0].clientX - touchStartX.current;
              if (Math.abs(delta) > 50) goTo(active + (delta < 0 ? 1 : -1));
              touchStartX.current = null;
            }}
          >
            <i className="ri-double-quotes-l absolute -top-6 left-6 text-7xl leading-none text-lime-400 sm:left-10" aria-hidden="true"></i>

            <div key={current.id} className="testimonial-fade" aria-live="polite">
              <blockquote className="mt-4 text-lg leading-relaxed text-slate-100 sm:text-xl lg:text-2xl lg:leading-relaxed">
                {cleanQuote(current.content)}
              </blockquote>

              <figcaption className="mt-8 flex items-center gap-4">
                <img
                  src={current.avatar}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-lime-400 ring-offset-2 ring-offset-slate-900 sm:h-16 sm:w-16"
                />
                <div className="min-w-0">
                  <p className="font-bold text-white sm:text-lg">{current.name}</p>
                  <p className="text-sm text-slate-300">{current.company}</p>
                </div>
                {current.sector && (
                  <span className="ml-auto hidden rounded-full bg-lime-400/15 px-3 py-1 text-xs font-semibold text-lime-300 sm:inline-block">
                    {current.sector}
                  </span>
                )}
              </figcaption>
            </div>

            {/* Progress + controls */}
            {count > 1 && (
              <div className="mt-8 flex items-center gap-4">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                  {autoplay && (
                    <div
                      key={`${active}-${cycle}`}
                      className="testimonial-progress h-full rounded-full bg-lime-400"
                      style={{ animationDuration: `${ROTATE_MS}ms`, animationPlayState: paused ? 'paused' : 'running' }}
                    />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => goTo(active - 1)}
                  aria-label="Previous testimonial"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-xl transition-colors hover:bg-lime-400 hover:text-green-950"
                >
                  <i className="ri-arrow-left-line" aria-hidden="true"></i>
                </button>
                <button
                  type="button"
                  onClick={() => goTo(active + 1)}
                  aria-label="Next testimonial"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-xl transition-colors hover:bg-lime-400 hover:text-green-950"
                >
                  <i className="ri-arrow-right-line" aria-hidden="true"></i>
                </button>
              </div>
            )}
          </figure>

          {/* Client list (desktop) */}
          <div className="hidden space-y-3 lg:col-span-2 lg:block" role="tablist" aria-label="Choose a testimonial">
            {TESTIMONIALS.map((t, index) => {
              const isActive = index === active;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => goTo(index)}
                  className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                    isActive
                      ? 'border-lime-400/60 bg-white/10 shadow-lg'
                      : 'border-white/5 bg-transparent opacity-60 hover:bg-white/5 hover:opacity-100'
                  }`}
                >
                  <img loading="lazy" src={t.avatar} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">{t.name}</p>
                    <p className="truncate text-sm text-slate-300">
                      {t.company}{t.sector ? ` · ${t.sector}` : ''}
                    </p>
                  </div>
                  {isActive && <i className="ri-arrow-right-s-line ml-auto text-2xl text-lime-400" aria-hidden="true"></i>}
                </button>
              );
            })}
          </div>

          {/* Dots (mobile) */}
          {count > 1 && (
            <div className="flex justify-center gap-2 lg:hidden">
              {TESTIMONIALS.map((t, index) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={`Show testimonial from ${t.name}`}
                  aria-current={index === active}
                  className={`h-2.5 rounded-full transition-all ${index === active ? 'w-8 bg-lime-400' : 'w-2.5 bg-white/30'}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
