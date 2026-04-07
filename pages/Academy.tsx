import React, { useState } from "react";
import AnimatedSection from "../components/AnimatedSection";

const courses = [
  {
    id: "drone-basics",
    title: "Drone Basics for Field Operators Certification",
    image: "public/train.jpg",
    summary:
      "Introduction to drone types, regulations, safety checks, and manual operation for agriculture use.",
    outline: [
      "Regulations & permits",
      "Pre-flight checks",
      "Battery and payload management",
      "Basic flight exercises",
    ],
    duration: "1 weeks",
    price: "$288",
  },
  {
    id: "precision-spraying",
    title: "Precision Aerial Spraying Certification",
    image: "public/spray1.jpg",
    summary:
      "Advanced spraying techniques, nozzle calibration, chemical safety, and precision application planning.",
    outline: [
      "Spray path planning",
      "Droplet size & drift reduction",
      "Product handling",
      "Field verification & reporting",
    ],
    duration: "3 weeks",
    price: "$599",
  },
  {
    id: "mapping-analytics",
    title: "Drone Aerial Mapping Survey Certification",
    image: "public/mmap.jpeg",
    summary:
      "Comprehensive aerial survey and mapping with orthomosaic, DEM, and crop health layers for smarter field planning.",
    outline: [
      "Flight planning for mapping grids",
      "GCPs & control points",
      "Understanding RTK, GNSS, IMU, and flight logs",
      "Types of drone data: RGB, multispectral, thermal, LiDAR",
    ],
    duration: "3 weeks",
    price: "$399",
  },
  {
    id: "data-processing",
    title: "Drone Data Processing & Analysis Certification",
    image: "public/proce.png",
    summary:
      "Transform raw aerial capture into actionable farm intelligence with mapping, analytics, and report-driven decision support.",
    outline: [
      "Data ingestion & quality checks",
      "Orthomosaic and DEM generation",
      "NDVI/NDRE indices and thermal analytics",
      "Field-level recommendations & action plans",
    ],
    duration: "3 weeks",
    price: "$470",
  },
];

const Academy: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('drone-basics');
  const [message, setMessage] = useState('');
  const [activeFaq, setActiveFaq] = useState<string | null>(null);

  const faqItems = [
    {
      id: 'duration',
      question: 'How long does each course take?',
      answer: 'Courses range from 2 to 4 weeks depending on the track and depth. Each course includes interactive workshops, field sessions, and assessment.',
    },
    {
      id: 'certification',
      question: 'Do I get a certificate?',
      answer: 'Yes. Every completed course includes an official AA-PRECISION ACODEMY certificate, plus a digital badge for LinkedIn.',
    },
    {
      id: 'requirements',
      question: 'What are the academic prerequisites?',
      answer: 'No prior drone experience is required for beginner courses. Intermediate/advanced courses assume basic drone handling knowledge.',
    },
    {
      id: 'payment',
      question: 'How do I pay and enroll?',
      answer: 'Use the course application form, then our team will send payment details by WhatsApp and email. We support bank transfer and mobile money.',
    },
  ];

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const course = courses.find((c) => c.id === selectedCourse);
    const courseName = course?.title ?? 'selected course';
    const body = `Hello Agro Aerial Precision team,%0A%0AName: ${encodeURIComponent(name)}%0AEmail: ${encodeURIComponent(email)}%0APhone: ${encodeURIComponent(phone)}%0ACourse: ${encodeURIComponent(courseName)}%0AMessage: ${encodeURIComponent(message)}%0A%0APlease contact me with enrollment details.`;
    const mailTo = `mailto:info@agroaerialprecision.com?subject=AA-PRECISION%20ACODEMY%20Course%20Application&body=${body}`;
    const waMessage = `Hello Agro Aerial Precision team,\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nCourse: ${courseName}\nMessage: ${message}\n\nPlease contact me with enrollment details.`;
    const waUrl = `https://api.whatsapp.com/send?phone=+23277840105&text=${encodeURIComponent(waMessage)}`;

    window.open(waUrl, '_blank');
    window.location.href = mailTo;
	setIsOpen(false);
  };

  return (
    <div className="overflow-x-hidden">
      <section className="relative min-h-[60vh] bg-[url('public/train.jpg')] bg-cover bg-center bg-no-repeat opacity-80 sm:opacity-80">
        <div className="absolute inset-0 bg-gradient-to-b from-green-900 via-slate-900/70 to-lime-900/40" />
        <AnimatedSection className="relative container mx-auto px-4 sm:px-6 md:px-8 py-20 sm:py-24 text-white text-center flex flex-col items-center justify-center" animationType="unveil-scale" delay={0.1}>
            <div className="text-center mt-20 sm:mt-24 flex flex-col items-center justify-center">
                <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 mx-4 sm:mx-12 md:mx-24 max-w-5xl">
                    “Enhance Your Career With Professional UAV Data Collection &
                    Analysis Training.”
                </h1>
                <p className="max-w-xl sm:max-w-2xl text-sm sm:text-base md:text-lg/2 mb-8  text-slate-200">
                    Join our AA-PRECISION ACODEMY to gain hands-on experience in drone
                    operations, precision spraying, aerial mapping, and data analytics
                    for agriculture and environmental monitoring. Our expert-led courses are designed to equip you
                    with the skills needed to excel in the rapidly evolving field of
                    Drone technology.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href="https://whatsapp.com/channel/0029VbA1kgHC1FuH5zCjq132"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block bg-lime-600 hover:bg-green-800 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-300"
                    >
                      Join Our Channel
                    </a>
                    <button
                      onClick={() => setIsOpen(true)}
                      className="inline-block bg-white/20 hover:bg-white/40 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-300"
                    >
                      Enroll Now
                    </button>
                </div>
            </div>
          
        </AnimatedSection>
      </section>

      <section className="container mx-auto px-4 py-16">
        <AnimatedSection className="w-full" animationType="unveil" delay={0.05}>
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold">Courses We Provide</h2>
            <p className="mt-3 text-slate-500 max-w-3xl mx-auto">
              Pick the training path that fits your need as a student, farm, or
              organization. Each course is hands-on with certification on
              completion. This course equips learners with the skills to transform
              drone imagery into actionable insights using advanced processing
              techniques.
            </p>
          </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courses.map((course) => (
            <article
              key={course.id}
              className="bg-white rounded-3xl border border-lime-100 overflow-hidden shadow-xl transition-all duration-500 ease-out transform hover:shadow-2xl hover:-translate-y-1"
            >
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-44 object-cover"
              />
              <div className="p-5">
                <h3 className="text-xl font-bold text-green-900 mb-2">
                  {course.title}
                </h3>
                <p className="text-slate-600 mb-3">{course.summary}</p>
                <ul className="text-sm text-slate-600 space-y-1 mb-3">
                  {course.outline.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-lime-600 text-white text-xs">
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between items-center mt-5 text-slate-700">
                  <span className="text-sm">{course.duration}</span>
                  <span className="text-lg font-semibold">{course.price}</span>
                </div>
                <a
                  href={`https://api.whatsapp.com/send?phone=+23277840105&text=${encodeURIComponent(`Hi, I'm interested in ${course.title} at AA-PRECISION ACODEMY. Please send me details.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex w-full justify-center bg-green-800 text-white font-bold py-2 rounded-xl hover:bg-lime-700 transition-colors"
                >
                  Enquire Now
                </a>
              </div>
            </article>
          ))}
        </div>
        </AnimatedSection>
      </section>

      <section className="container mx-auto px-4 py-14">
        <AnimatedSection className="max-w-4xl mx-auto" animationType="unveil" delay={0.05}>
          <h2 className="text-3xl font-bold text-green-900 mb-6 text-center">AAP ACODEMY FAQ</h2>
          <div className="space-y-3">
            {faqItems.map((faq) => (
              <button
                key={faq.id}
                onClick={() => setActiveFaq(activeFaq === faq.id ? null : faq.id)}
                className="w-full rounded-2xl border border-lime-200 bg-white p-4 text-left shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-green-900">{faq.question}</span>
                  <span className="text-xl text-lime-700">{activeFaq === faq.id ? '−' : '+'}</span>
                </div>
                {activeFaq === faq.id && (
                  <p className="mt-3 text-slate-600">{faq.answer}</p>
                )}
              </button>
            ))}
          </div>
          </AnimatedSection>
      </section>

      <section className="bg-lime-50 py-14">
        <AnimatedSection className="container mx-auto px-4 text-center" animationType="unveil-left" delay={0.05}>
          <h2 className="text-3xl font-bold text-green-900 mb-4">
            Why AAP ACODEMY?
          </h2>
          <p className="max-w-3xl mx-auto text-slate-600 mb-8">
            Our curriculum is built from real-world project experience, with
            on-demand support for your operation and certification issued for
            immediate use.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-lime-200 rounded-xl p-5 shadow-sm">
              <h3 className="font-bold mb-2 text-green-800">Practical Field Training</h3>
              <p className="text-slate-600 ">
                Hands-on exercises with real operations and drone workflows. 
              </p>
            </div>
            <div className="bg-lime-200 rounded-xl p-5 shadow-sm">
              <h3 className="font-bold mb-2 text-green-800">Expert Instructors</h3>
              <p className="text-slate-600">
                Learn from seasoned agronomists and drone pilots in precision
                agriculture.
              </p>
            </div>
            <div className="bg-lime-200 rounded-xl p-5 shadow-sm">
              <h3 className="font-bold mb-2 text-green-800">Certification</h3>
              <p className="text-slate-600">
                Get a completion badge for credible skills in drone-based farm
                management.
              </p>
            </div>
          </div>
        </AnimatedSection>
      </section>

      <section className="container mx-auto px-4 py-14 text-center">
        <AnimatedSection className="w-full" animationType="unveil-scale" delay={0.05}>
          <h2 className="text-2xl font-bold mb-4">Ready to start?</h2>
          <p className="mb-6 text-slate-600">
            Send your details and we’ll help you choose the right course package.
          </p>
          <button
            onClick={() => setIsOpen(true)}
            className="bg-green-800 text-white px-8 py-3 rounded-full font-bold hover:bg-lime-700 transition-colors"
          >
            Apply for a Course
          </button>
        </AnimatedSection>
      </section>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-lime-800/70 p-4">
          <div className="w-full max-w-lg sm:max-w-xl mx-auto rounded-2xl bg-white/80 p-4 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-lime-900">Course Application</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-900">
                ✕
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-lime-700">Name</span>
                <input
                  required
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  className="mt-1 block w-full border border-slate-300 rounded-lg px-3 py-2 focus:border-lime-600 outline-none"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-lime-700">Email</span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  className="mt-1 block w-full border border-slate-300 rounded-lg px-3 py-2 focus:border-lime-600 outline-none"
                />
              </label>
                <label className="block">
                <span className="text-sm font-medium text-lime-700">Phone</span>
                <input
                  required
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]+"
                  value={phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="mt-1 block w-full border border-slate-300 rounded-lg px-3 py-2 focus:border-lime-600 outline-none"
                />
                </label>
              <label className="block">
                <span className="text-sm font-medium text-lime-700">Course</span>
                <select
                  required
                  value={selectedCourse}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCourse(e.target.value)}
                  className="mt-1 block w-full border border-slate-300 rounded-lg px-3 py-2 focus:border-lime-600 outline-none"
                >
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-lime-700">Message</span>
                <textarea
                  value={message}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full border border-slate-300 rounded-lg px-3 py-2 focus:border-lime-600 outline-none"
                  placeholder="Any additional notes..."
                />
              </label>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-orange-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-green-800 text-white font-bold hover:bg-lime-700"
                >
                  Submit via WhatsApp + Email
                </button>
              </div>
              <p className="text-xs text-slate-500">After submitting, WhatsApp opens in a new tab and your email client will prepare a message.</p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Academy;
