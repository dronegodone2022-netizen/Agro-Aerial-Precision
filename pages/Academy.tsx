import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AnimatedSection from "../components/AnimatedSection";
import { verifyCertificate, type Certificate } from "../src/data/certificates";
import { currentUserEmail, enrollInCourse, getErrorMessage, getStudentProfile, type StudentProfile } from "../src/examApi";
import { COURSES as courses } from "../src/data/courses";

const asset = (file: string) => new URL(`../src/assets/${file}`, import.meta.url).href;


const Academy: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [selectedCourse, setSelectedCourse] = useState('drone-basics');
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState('');
  const [enrollSuccess, setEnrollSuccess] = useState('');
  const [message, setMessage] = useState('');
  const [activeFaq, setActiveFaq] = useState<string | null>(null);

  // Certificate verification state
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [certId, setCertId] = useState('');
  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [lookupError, setLookupError] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const faqItems = [
    {
      id: 'duration',
      question: 'How long does each course take?',
      answer: 'Courses run from 1 to 3 weeks depending on the track. Each course combines classroom sessions, hands-on field or lab work, and an assessment. Open any course to see its full curriculum.',
    },
    {
      id: 'certification',
      question: 'Do I get a certificate?',
      answer: 'Yes. Every completed course includes an official AA-PRECISION ACADEMY certificate with a QR code, so employers and clients can verify it online at any time.',
    },
    {
      id: 'requirements',
      question: 'What are the academic prerequisites?',
      answer: 'No prior drone experience is required for beginner courses. Intermediate/advanced courses assume basic drone handling knowledge.',
    },
    {
      id: 'payment',
      question: 'How do I pay and enroll?',
      answer: 'Create a free student account, then click Enroll on your course. Our team will send payment details by WhatsApp. We support bank transfer and mobile money. Your exam unlocks once your enrolment is approved.',
    },
  ];
  // Enrolling requires a student account: send visitors to sign in / register first,
  // then bring them back here with the course pre-selected.
  const openEnrollment = async (courseId?: string) => {
    const course = courseId || selectedCourse;
    setSelectedCourse(course);
    setEnrollError('');
    setEnrollSuccess('');

    try {
      if (!(await currentUserEmail())) {
        navigate(`/student-login?next=${encodeURIComponent(`/academy?enroll=${course}`)}`);
        return;
      }
      const profile = await getStudentProfile();
      if (!profile.student) {
        setEnrollError('This account is not a student account. Please sign out and create a student account to enrol.');
      }
      setStudent(profile.student);
    } catch (err) {
      setEnrollError(getErrorMessage(err));
    }
    setIsOpen(true);
  };

  // Returning from sign-in / registration with ?enroll=<course id>
  useEffect(() => {
    const courseId = searchParams.get('enroll');
    if (!courseId) return;
    setSearchParams({}, { replace: true });
    openEnrollment(courses.some((c) => c.id === courseId) ? courseId : undefined);
  }, []);

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!student) return;

    const course = courses.find((c) => c.id === selectedCourse);
    if (!course) return;

    setEnrolling(true);
    setEnrollError('');
    try {
      const enrollment = await enrollInCourse(course.id, course.title, message);

      const whatsappText = [
        'Hello Agro Aerial Precision team,',
        '',
        'I have enrolled for a course and would like the payment details.',
        '',
        `Student ID: ${student.id}`,
        `Name: ${student.name}`,
        `Phone: ${student.phone}`,
        `Course: ${course.title}`,
        ...(message ? [`Message: ${message}`] : []),
      ].join('\n');
      window.open(`https://api.whatsapp.com/send?phone=23277840105&text=${encodeURIComponent(whatsappText)}`, "_blank", "noopener");

      setMessage('');
      setEnrollSuccess(
        enrollment.alreadyEnrolled
          ? `You are already enrolled in ${course.title} (status: ${enrollment.status}). WhatsApp has opened so you can follow up with us.`
          : `Enrolment received for ${course.title}. We've emailed you a confirmation - please also send the WhatsApp message that just opened and we'll reply with payment details. You can track your status in the Student Portal.`
      );
    } catch (err) {
      setEnrollError(getErrorMessage(err));
    } finally {
      setEnrolling(false);
    }
  };

  const searchCertificate = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setLookupError(false);
    try {
      setCertificate(await verifyCertificate(query));
    } catch (error) {
      console.error("Certificate verification failed", error);
      setCertificate(null);
      setLookupError(true);
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  const handleVerifySearch = () => {
    if (!certId.trim()) return;
    searchCertificate(certId);
  };

  return (
    <div className="overflow-x-hidden">
      <section className="relative min-h-[60vh] bg-cover bg-center bg-no-repeat opacity-80 sm:opacity-80" style={{ backgroundImage: `url(${asset('train.jpg')})` }}>
        <div className="absolute inset-0 bg-linear-to-b from-green-900 via-slate-900/70 to-lime-900/40" />
        <AnimatedSection className="relative container mx-auto px-4 sm:px-6 md:px-8 py-20 sm:py-24 text-white text-center flex flex-col items-center justify-center" animationType="unveil-scale" delay={0.1}>
            <div className="text-center mt-20 sm:mt-24 flex flex-col items-center justify-center">
                <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 mx-4 sm:mx-12 md:mx-24 max-w-5xl">
                    “Enhance Your Career With Professional UAV Data Collection &
                    Analysis Training.”
                </h1>
                <p className="max-w-xl sm:max-w-2xl text-sm sm:text-base md:text-lg/6 mb-8  text-slate-200">
                    Join our AA-PRECISION ACADEMY to gain hands-on experience in drone
                    operations, aerial surveying, data processing, mining software and
                    precision agriculture. Our expert-led courses equip you with the skills
                    that mining, construction, infrastructure and agriculture employers need.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => setVerifyOpen(true)}
                      className="inline-block bg-lime-500 hover:bg-green-800 hover:text-white text-slate-900 font-bold py-3 px-6 rounded-xl transition-colors duration-300"
                    >
                      Verify Certificate
                    </button>
                    <button
                      onClick={() => openEnrollment()}
                      className="inline-block bg-lime-300 hover:bg-green-600 hover:text-white text-slate-900 font-bold py-3 px-6 rounded-xl transition-colors duration-300"
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
              Pick the training path that fits you - whether you are starting out
              as a pilot, working in mining or construction, or running a farm.
              Every course is hands-on and ends with a certificate anyone can verify
              online.
            </p>
          </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <article
              key={course.id}
              className="flex flex-col bg-white rounded-3xl border border-lime-100 overflow-hidden shadow-xl transition-all duration-500 ease-out transform hover:shadow-2xl hover:-translate-y-1"
            >
              <img loading="lazy"
                src={course.image}
                alt={course.title}
                className="w-full h-44 object-cover"
              />
              <div className="p-5 flex flex-1 flex-col">
                <h3 className="text-xl font-bold text-green-900 mb-2">
                  <Link to={`/academy/${course.id}`} className="hover:underline">{course.title}</Link>
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
                <div className="flex justify-between items-center mt-auto pt-5 text-slate-700">
                  <span className="text-sm">{course.duration}</span>
                  <span className="text-lg font-semibold">{course.price}</span>
                </div>
                <Link
                  to={`/academy/${course.id}`}
                  className="mt-4 inline-flex w-full justify-center border-2 border-green-800 text-green-800 font-bold py-2 rounded-xl hover:bg-green-50 transition-colors"
                >
                  View Course Details
                </Link>
                <button
                  type="button"
                  onClick={() => openEnrollment(course.id)}
                  className="mt-2 inline-flex w-full justify-center bg-green-800 text-white font-bold py-2 rounded-xl hover:bg-lime-700 transition-colors"
                >
                  Enrol Now
                </button>
              </div>
            </article>
          ))}
        </div>
        </AnimatedSection>
      </section>

      <section className="container mx-auto px-4 py-14">
        <AnimatedSection className="max-w-4xl mx-auto" animationType="unveil" delay={0.05}>
          <h2 className="text-3xl font-bold text-green-900 mb-6 text-center">AAP ACADEMY FAQ</h2>
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
            Why AAP ACADEMY?
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
                Learn from working drone pilots, surveyors and data analysts
                who fly real mining, construction and agriculture jobs.
              </p>
            </div>
            <div className="bg-lime-200 rounded-xl p-5 shadow-sm">
              <h3 className="font-bold mb-2 text-green-800">Certification</h3>
              <p className="text-slate-600">
                Earn a QR-verifiable certificate that proves your skills to
                employers and clients.
              </p>
            </div>
          </div>
        </AnimatedSection>
      </section>

      <section className="container mx-auto px-4 py-14 text-center">
        <AnimatedSection className="w-full" animationType="unveil-scale" delay={0.05}>
          <h2 className="text-2xl font-bold mb-4">Ready to start?</h2>
          <p className="mb-6 text-slate-600">
            Create a free student account, choose your course, and we’ll send you the payment details.
          </p>
          <button
            onClick={() => openEnrollment()}
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
              <h3 className="text-xl font-bold text-lime-900">Course Enrolment</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-900">
                ✕
              </button>
            </div>
            {enrollError && (
              <div role="alert" className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">{enrollError}</div>
            )}
            {enrollSuccess ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-green-400 bg-green-50 p-3 text-sm text-green-800">{enrollSuccess}</div>
                <div className="flex gap-3 justify-end">
                  <Link to="/student" className="px-5 py-2 rounded-lg bg-green-800 text-white font-bold hover:bg-lime-700">Go to Student Portal</Link>
                  <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2 rounded-lg border border-green-700 text-green-700 hover:bg-green-200">Close</button>
                </div>
              </div>
            ) : student && (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {student && (
                <div className="rounded-lg border border-green-700/40 bg-white p-3 text-sm text-slate-700">
                  <p><strong>{student.name}</strong> ({student.id})</p>
                  <p>{student.email}</p>
                  <p>{student.phone}</p>
                  <Link to="/student" className="text-green-700 underline text-xs">Edit my details</Link>
                </div>
              )}
              <label className="block">
                <span className="text-sm font-medium text-lime-700">Course</span>
                <select
                  required
                  value={selectedCourse}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCourse(e.target.value)}
                  className="mt-1 block w-full border border-green-700 rounded-lg px-3 py-2 focus:border-lime-600 outline-none"
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
                  className="mt-1 block w-full border border-green-700 rounded-lg px-3 py-2 focus:border-lime-600 outline-none"
                  placeholder="Any additional notes..."
                />
              </label>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2 rounded-lg border border-green-700 text-green-700 hover:bg-green-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={enrolling}
                  className="px-5 py-2 rounded-lg bg-green-800 text-white font-bold hover:bg-lime-700 disabled:opacity-60"
                >
                  {enrolling ? 'Enrolling...' : 'Enrol'}
                </button>
              </div>
              <p className="text-xs text-slate-500">Your enrolment is saved to your student account and emailed to you and our team. WhatsApp then opens so we can send you the payment details.</p>
            </form>
            )}
          </div>
        </div>
      )}

      {/* Certificate Verification Modal */}
      {verifyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-lime-800/70 p-4">
          <div className="w-full max-w-lg mx-auto rounded-2xl bg-white/95 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-lime-900">AAP Academy Certificate Verification</h3>
              <button onClick={() => {
                setVerifyOpen(false);
                setCertificate(null);
                setCertId('');
                setHasSearched(false);
              }} className="text-slate-500 hover:text-slate-900">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-slate-600 text-sm">Enter your certificate ID to verify its authenticity.</p>

              <input
                className="border p-3 rounded w-full"
                placeholder="Enter Certificate ID (e.g. AAP-001)"
                value={certId}
                onChange={(e) => {
                  setCertId(e.target.value);
                  setHasSearched(false);
                }}
              />

              <button
                onClick={handleVerifySearch}
                className="w-full bg-lime-600 text-white py-3 px-4 rounded hover:bg-green-700 transition-colors"
              >
                Verify Certificate
              </button>

              {loading && <p className="text-center text-slate-600">Checking…</p>}

              {certificate && (
                <div className="border border-green-500 bg-green-50 p-4 rounded">
                  <h4 className="text-lg font-semibold text-green-700 mb-2">Certificate Verified ✔</h4>
                  <p><strong>ID:</strong> {certificate.id}</p>
                  <p><strong>Name:</strong> {certificate.name}</p>
                  <p><strong>Course:</strong> {certificate.course}</p>
                  <p><strong>Issued:</strong> {certificate.issued_on}</p>

                  <a
                    href={certificate.drive_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                  >
                    View Certificate
                  </a>

                </div>
              )}

              {lookupError && !loading && (
                <div className="border border-amber-500 bg-amber-50 p-4 rounded">
                  <p className="text-amber-800 font-semibold">We couldn't check this certificate right now.</p>
                  <p className="text-sm text-slate-600 mt-1">Please check your connection and try again.</p>
                </div>
              )}

              {certificate === null && !loading && hasSearched && !lookupError && (
                <div className="border border-red-500 bg-red-50 p-4 rounded">
                  <p className="text-red-700 font-semibold">Certificate Not Found ❌</p>
                  <p className="text-sm text-slate-600 mt-1">Please check the certificate ID and try again.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Academy;
