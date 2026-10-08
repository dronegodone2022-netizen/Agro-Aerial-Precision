import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudentSession, clearStudentSession } from '../src/students';
import {
  getExam,
  submitExam,
  getErrorMessage,
  type ExamQuestion,
  type ExamResult,
  type StudentProfile,
  type SubmitResponse,
} from '../src/examApi';

const LOW_TIME_WARNING_SECONDS = 60;
const PASSING_SCORE_PERCENTAGE = 80;
const RETAKE_PRICE = 'Le 250 (SLE)';
const ADMIN_PHONE = '+23277840105';

type Phase = 'loading' | 'error' | 'in_progress' | 'finished';

const shuffleArray = <T,>(items: T[]) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const DroneExam = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [review, setReview] = useState<SubmitResponse['review']>([]);
  const [explanations, setExplanations] = useState<SubmitResponse['explanations']>();
  const submittingRef = useRef(false);

  const sessionToken = getStudentSession()?.sessionToken || '';

  // Load the exam (or the existing result) from the server
  useEffect(() => {
    if (!sessionToken) {
      navigate('/student-login');
      return;
    }

    getExam(sessionToken)
      .then((state) => {
        setStudent(state.student);
        if (state.status === 'in_progress') {
          setQuestions(state.questions.map((q) => ({ ...q, options: shuffleArray(q.options) })));
          setTimeLeft(state.secondsRemaining);
          setPhase('in_progress');
        } else {
          setResult(state.result);
          setPhase('finished');
        }
      })
      .catch((err) => {
        setErrorMessage(getErrorMessage(err));
        setPhase('error');
      });
  }, []);

  // Timer countdown. The server enforces the real deadline; this is the visible clock.
  useEffect(() => {
    if (phase !== 'in_progress') return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (phase === 'in_progress' && timeLeft === 0) {
      finishExam(true);
    }
  }, [phase, timeLeft]);

  // Warn before leaving mid-exam (the server-side timer keeps running)
  useEffect(() => {
    if (phase !== 'in_progress') return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [phase]);

  const finishExam = async (isAutoSubmit: boolean) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      const response = await submitExam(sessionToken, selectedAnswers);
      setResult(response.result);
      setReview(response.review);
      setExplanations(response.explanations);
      setPhase('finished');
      if (isAutoSubmit) {
        alert('Time is up! Your exam has been auto-submitted.');
      }
    } catch (err) {
      submittingRef.current = false;
      alert(`${getErrorMessage(err)}\n\nYour answers are still on this page - please try submitting again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOptionChange = (questionId: string, optionId: number) => {
    if (phase !== 'in_progress') return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (Object.keys(selectedAnswers).length < questions.length) {
      alert('Please answer all questions before submitting the assessment.');
      return;
    }

    finishExam(false);
  };

  const handleLogout = () => {
    clearStudentSession();
    navigate('/student-login');
  };

  const openWhatsAppForRetake = () => {
    const message = `Hello Agro Aerial Precision admin, I did not pass the drone certification exam and would like to retake it.\n\nName: ${student?.name || 'Student'}\nStudent ID: ${student?.id || ''}\nScore: ${result?.percentage ?? 0}%\n\nPlease share the retake payment instructions.`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${encodeURIComponent(ADMIN_PHONE)}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener');
  };

  const isTimeRunningLow = timeLeft < LOW_TIME_WARNING_SECONDS;
  const isPassed = Boolean(result?.passed);
  const reviewByQuestion = Object.fromEntries(review.map((r) => [r.questionId, r]));
  const explanationByQuestion = Object.fromEntries((explanations || []).map((e) => [e.questionId, e]));

  // Inline Style Themes
  const styles = {
    container: { maxWidth: '800px', margin: '40px auto', marginTop: '60px', background: '#fff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#212529', lineHeight: '1.6' },
    header: { textAlign: 'center' as const, borderBottom: '3px solid #2e7d32', paddingBottom: '20px', marginBottom: '30px' },
    title: { color: '#2e7d32', margin: '0 0 10px 0', fontSize: '28px' },
    subtitle: { color: '#37474f', margin: '0', fontSize: '18px', fontWeight: '400' },
    branding: { fontSize: '14px', fontWeight: 'bold', color: '#37474f', marginTop: '5px' },
    card: { marginBottom: '30px', padding: '25px', border: '1px solid #dee2e6', borderRadius: '6px', backgroundColor: '#fff' },
    questionText: { fontSize: '17px', fontWeight: '600', marginBottom: '15px', color: '#111' },
    list: { listStyle: 'none' as const, padding: '0', margin: '0' },
    item: (questionId: string, optionId: number) => {
      let bg = '#fff';
      let border = '#dee2e6';
      let text = '#212529';
      const questionReview = reviewByQuestion[questionId];
      const correctOption = explanationByQuestion[questionId]?.correctOption;

      if (phase === 'finished' && questionReview) {
        if (correctOption === optionId || (questionReview.chosenOption === optionId && questionReview.isCorrect)) {
          bg = '#e8f5e9';
          border = '#2e7d32';
          text = '#2e7d32';
        } else if (questionReview.chosenOption === optionId) {
          bg = '#ffebee';
          border = '#c62828';
          text = '#c62828';
        }
      }
      return { display: 'flex' as const, alignItems: 'flex-start' as const, marginBottom: '12px', padding: '12px 15px', border: `1px solid ${border}`, borderRadius: '4px', backgroundColor: bg, color: text, cursor: phase === 'in_progress' ? 'pointer' : 'default' };
    },
    radio: { marginTop: '5px', marginRight: '12px', cursor: 'pointer' },
    label: { cursor: 'pointer', flex: 1 },
    submitBtn: { display: 'block' as const, width: '100%', backgroundColor: '#2e7d32', color: 'white', border: 'none', padding: '15px', fontSize: '18px', fontWeight: 'bold', borderRadius: '6px', cursor: isSubmitting ? 'not-allowed' : 'pointer', transition: 'background 0.2s', marginTop: '20px', opacity: isSubmitting ? 0.7 : 1 },
    rationale: { marginTop: '15px', padding: '12px 15px', borderLeft: '4px solid #6c757d', backgroundColor: '#f8f9fa', fontSize: '14px', color: '#333' },
    resultsPanel: { marginTop: '30px', padding: '25px', borderRadius: '6px', textAlign: 'center' as const, border: `2px solid ${isPassed ? '#2e7d32' : '#c62828'}`, backgroundColor: isPassed ? '#e8f5e9' : '#ffebee', color: isPassed ? '#2e7d32' : '#c62828' },
    scoreText: { fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' },
    timerContainer: {
      display: 'flex' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      padding: '15px 20px',
      background: isTimeRunningLow ? '#fff3cd' : '#f0f7f0',
      borderRadius: '6px',
      marginBottom: '20px',
      border: `2px solid ${isTimeRunningLow ? '#ff6b6b' : '#2e7d32'}`,
      position: 'sticky' as const,
      top: 0,
      zIndex: 50,
      boxShadow: '0 8px 20px rgba(0,0,0,0.08)'
    },
    modalOverlay: { position: 'fixed' as const, inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'center' as const, padding: '20px', zIndex: 100 },
    modalContent: { width: '100%', maxWidth: '520px', backgroundColor: '#fff', borderRadius: '16px', padding: '30px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', textAlign: 'center' as const, position: 'relative' as const },
    modalTitle: { fontSize: '22px', fontWeight: '700', marginBottom: '18px', color: '#2e7d32' },
    modalText: { color: '#394047', fontSize: '16px', lineHeight: '1.7', marginBottom: '18px' },
    modalButton: { width: '100%', backgroundColor: '#25d366', color: '#fff', border: 'none', borderRadius: '8px', padding: '14px 18px', cursor: 'pointer', fontSize: '16px', fontWeight: '700', marginBottom: '10px' },
    secondaryButton: { width: '100%', backgroundColor: '#fff', color: '#2e7d32', border: '2px solid #2e7d32', borderRadius: '8px', padding: '12px 18px', cursor: 'pointer', fontSize: '15px', fontWeight: '700' },
    timerText: { fontSize: '18px', fontWeight: 'bold', color: isTimeRunningLow ? '#c62828' : '#2e7d32', fontFamily: 'monospace' },
    studentInfo: { fontSize: '14px', color: '#666' },
    logoutBtn: { padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
    message: { textAlign: 'center' as const, color: '#4b5563', fontSize: '16px' },
    errorBox: { color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '16px', marginBottom: '20px', textAlign: 'center' as const },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Drone Operations & Mapping Certification Exam</h1>
        <h2 style={styles.subtitle}>Written Assessment Module</h2>
        <div style={styles.branding}>Agro Aerial Precision SL Ltd</div>
      </div>

      {phase === 'loading' && <p style={styles.message}>Loading your exam...</p>}

      {phase === 'error' && (
        <>
          <div style={styles.errorBox}>{errorMessage}</div>
          <button type="button" onClick={handleLogout} style={styles.secondaryButton}>Back to Login</button>
        </>
      )}

      {phase === 'in_progress' && (
        <div style={styles.timerContainer}>
          <div style={styles.studentInfo}>Student: <strong>{student?.name}</strong></div>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={styles.timerText}>⏱ Time Left: {formatTime(timeLeft)}</div>
            <button type="button" onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </div>
        </div>
      )}

      {questions.length > 0 && (
        <form onSubmit={handleSubmit}>
          {questions.map((q, qIdx) => (
            <div key={q.id} style={styles.card}>
              <div style={styles.questionText}>{qIdx + 1}. {q.question}</div>
              <ul style={styles.list}>
                {q.options.map((opt) => (
                  <li key={opt.id} style={styles.item(q.id, opt.id)}>
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      id={`q-${q.id}-o-${opt.id}`}
                      checked={selectedAnswers[q.id] === opt.id}
                      onChange={() => handleOptionChange(q.id, opt.id)}
                      disabled={phase !== 'in_progress'}
                      style={styles.radio}
                    />
                    <label htmlFor={`q-${q.id}-o-${opt.id}`} style={styles.label}>
                      {opt.text}
                    </label>
                  </li>
                ))}
              </ul>

              {explanationByQuestion[q.id]?.rationale && (
                <div style={styles.rationale}>
                  <strong>Rationale:</strong> {explanationByQuestion[q.id].rationale}
                </div>
              )}
            </div>
          ))}

          {phase === 'in_progress' && (
            <button type="submit" style={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
            </button>
          )}
        </form>
      )}

      {phase === 'finished' && result && (
        <div style={styles.resultsPanel}>
          <div style={styles.scoreText}>
            Final Score: {result.total ? `${result.score} / ${result.total} ` : ''}({result.percentage}%)
          </div>
          {isPassed ? (
            <span>
              <strong>Result: PASSED</strong><br />
              Congratulations! You have met the knowledge requirements for the Agro Aerial Precision SL Ltd Drone Operations & Mapping Certification.
            </span>
          ) : (
            <span>
              <strong>Result: NOT PASSED</strong><br />
              The minimum pass mark is {PASSING_SCORE_PERCENTAGE}%. Please review the operational documentation before your retake.
            </span>
          )}
        </div>
      )}

      {phase === 'finished' && result && !isPassed && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>Exam Retake Required</h3>
            <p style={styles.modalText}>
              You scored {result.percentage}%. The minimum pass mark is {PASSING_SCORE_PERCENTAGE}%.
            </p>
            <p style={styles.modalText}>
              Retake fee: <strong>{RETAKE_PRICE}</strong>
            </p>
            <p style={styles.modalText}>
              Your exam is locked. Contact the admin to pay the retake fee, and the admin will unlock your exam.
            </p>
            <button type="button" style={styles.modalButton} onClick={openWhatsAppForRetake}>
              Contact Admin on WhatsApp
            </button>
            <button type="button" style={styles.secondaryButton} onClick={handleLogout}>
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DroneExam;
