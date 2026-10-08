import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AnimatedSection from '../components/AnimatedSection';
import { COURSES, findCourse } from '../src/data/courses';

const CheckList: React.FC<{ items: string[] }> = ({ items }) => (
  <ul className="space-y-2">
    {items.map((item) => (
      <li key={item} className="flex items-start gap-3 text-slate-700">
        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime-600 text-xs text-white">✓</span>
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="rounded-2xl bg-white p-6 shadow-md sm:p-8">
    <h2 className="mb-4 text-2xl font-bold text-green-900">{title}</h2>
    {children}
  </section>
);

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const course = findCourse(courseId);
  const [openModule, setOpenModule] = useState<number | null>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  if (!course) {
    return (
      <div className="min-h-[70vh] px-4 pt-32 text-center">
        <h1 className="text-3xl font-bold text-green-900">Course not found</h1>
        <p className="mt-3 text-slate-600">This course may have been renamed or removed.</p>
        <Link to="/academy" className="mt-6 inline-block rounded-full bg-green-800 px-6 py-3 font-bold text-white hover:bg-lime-700">
          See all courses
        </Link>
      </div>
    );
  }

  // Reuses the Academy enrolment flow (sign in / register first if needed)
  const enrol = () => navigate(`/academy?enroll=${course.id}`);
  const otherCourses = COURSES.filter((c) => c.id !== course.id);
  const whatsappQuestion = `https://api.whatsapp.com/send?phone=23277840105&text=${encodeURIComponent(
    `Hello Agro Aerial Precision, I have a question about the "${course.title}" course.`
  )}`;

  return (
    <div className="bg-slate-50 pb-16">
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900 pt-28 pb-16 text-white">
        <img src={course.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-linear-to-r from-green-950 via-green-900/80 to-transparent" />
        <AnimatedSection className="container relative mx-auto px-4" animationType="unveil" delay={0.05}>
          <Link to="/academy" className="text-sm font-semibold text-lime-300 hover:underline">← All courses</Link>
          <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">{course.title}</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-200">{course.summary}</p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            {[
              ['ri-time-line', course.duration],
              ['ri-bar-chart-line', course.level],
              ['ri-map-pin-line', course.format],
              ['ri-award-line', 'Verifiable certificate'],
            ].map(([icon, label]) => (
              <span key={label} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur">
                <i className={icon} aria-hidden="true"></i>
                {label}
              </span>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button type="button" onClick={enrol} className="rounded-full bg-lime-500 px-8 py-3 font-bold text-slate-900 hover:bg-lime-400">
              Enrol now - {course.price}
            </button>
            <a href={whatsappQuestion} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-semibold text-lime-300 hover:underline">
              <i className="ri-whatsapp-line" aria-hidden="true"></i> Ask a question
            </a>
          </div>
        </AnimatedSection>
      </section>

      <div className="container mx-auto grid grid-cols-1 gap-8 px-4 pt-10 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-8 lg:col-span-2">
          <Section title="Course overview">
            <div className="space-y-4 leading-relaxed text-slate-700">
              {course.overview.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </Section>

          <Section title="What you will learn">
            <CheckList items={course.outcomes} />
          </Section>

          <Section title="Curriculum">
            <div className="space-y-3">
              {course.modules.map((module, index) => {
                const isOpen = openModule === index;
                return (
                  <div key={module.title} className="overflow-hidden rounded-xl border border-lime-200">
                    <button
                      type="button"
                      onClick={() => setOpenModule(isOpen ? null : index)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 bg-lime-50 px-5 py-4 text-left font-bold text-green-900 hover:bg-lime-100"
                    >
                      <span>{module.title}</span>
                      <i className={`ri-arrow-down-s-line text-2xl transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true"></i>
                    </button>
                    {isOpen && (
                      <ul className="list-disc space-y-2 px-10 py-4 text-slate-700">
                        {module.topics.map((topic) => <li key={topic}>{topic}</li>)}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </Section>

          <Section title="Hands-on training">
            <CheckList items={course.practical} />
          </Section>

          <Section title="Assessment & certification">
            <CheckList items={course.assessment} />
            <p className="mt-4 text-sm text-slate-600">
              Employers and clients can confirm your certificate at any time by scanning its QR code or entering its ID on our{' '}
              <Link to="/verify" className="font-semibold text-green-700 underline">verification page</Link>.
            </p>
          </Section>

          <Section title="Where this course can take you">
            <CheckList items={course.careers} />
          </Section>

          <Section title="Frequently asked questions">
            <div className="space-y-3">
              {course.faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={faq.question} className="rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-slate-800"
                    >
                      <span>{faq.question}</span>
                      <i className={`ri-add-line text-xl transition-transform ${isOpen ? 'rotate-45' : ''}`} aria-hidden="true"></i>
                    </button>
                    {isOpen && <p className="px-5 pb-4 text-slate-600">{faq.answer}</p>}
                  </div>
                );
              })}
            </div>
          </Section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <p className="text-sm text-slate-500">Course fee</p>
            <p className="text-4xl font-bold text-green-900">{course.price}</p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Duration</dt><dd className="font-semibold text-right">{course.duration}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Level</dt><dd className="font-semibold text-right">{course.level}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Format</dt><dd className="font-semibold text-right">{course.format}</dd></div>
            </dl>
            <button type="button" onClick={enrol} className="mt-6 w-full rounded-xl bg-green-800 py-3 font-bold text-white hover:bg-lime-700">
              Enrol now
            </button>
            <p className="mt-3 text-xs text-slate-500">
              Create a free student account, then we send payment details by WhatsApp. Bank transfer and mobile money accepted.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-md">
            <h3 className="mb-3 text-lg font-bold text-green-900">Who this course is for</h3>
            <CheckList items={course.audience} />
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-md">
            <h3 className="mb-3 text-lg font-bold text-green-900">Before you join</h3>
            <CheckList items={course.prerequisites} />
          </div>
        </aside>
      </div>

      {/* Other courses */}
      <section className="container mx-auto mt-14 px-4">
        <h2 className="mb-6 text-2xl font-bold text-green-900">Other courses</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {otherCourses.map((other) => (
            <Link key={other.id} to={`/academy/${other.id}`} className="group overflow-hidden rounded-2xl bg-white shadow-md transition-shadow hover:shadow-xl">
              <img loading="lazy" src={other.image} alt={other.title} className="h-40 w-full object-cover" />
              <div className="p-5">
                <h3 className="font-bold text-green-900 group-hover:underline">{other.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{other.duration} · {other.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CourseDetail;
