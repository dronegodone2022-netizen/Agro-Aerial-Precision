import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudentSession, clearStudentSession } from '../src/students';

interface QuizOption {
  text: string;
  isCorrect: boolean;
  rationale: string;
}

interface QuizItem {
  id: number;
  question: string;
  options: QuizOption[];
}

const shuffleArray = <T,>(items: T[]) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const DroneExam = () => {
  // Complete structured quiz database mapping directly to manual protocols
  const quizData: QuizItem[] = [
    {
      id: 1,
      question: "A drone operator notices that a lithium polymer (LiPo) battery cell has dropped to a 15% charge level during a mapping flight. Based on safety standards, what is the immediate risk associated with this condition?",
      options: [
        { text: "Permanent degradation of the cell chemistry or battery failure.", isCorrect: true, rationale: "Discharging LiPo cells below the critical 20% threshold alters chemical stability, permanently reducing performance and increasing risk of swelling or failure." },
        { text: "An automatic firmware lock that prevents subsequent recharges.", isCorrect: false, rationale: "While smart batteries track usage, standard firmware does not lock out recharging entirely based on a single low discharge incident." },
        { text: "A complete reversion of the flight controller to manual ATTI mode.", isCorrect: false, rationale: "Battery percentages dictate power supply status and trigger voltage alerts, but do not directly override the GNSS positioning sensors to force ATTI mode." },
        { text: "An instant reversal of motor rotation directions.", isCorrect: false, rationale: "Motor rotation patterns are strictly fixed by hardware connections and ESC signals, which do not change due to a low battery capacity level." }
      ]
    },
    {
      id: 2,
      question: "During a precision agriculture mission in Sierra Leone, a pilot loses GNSS signal completely while operating near a dense canopy. Which action must the pilot take to maintain aircraft stability?",
      options: [
        { text: "Initiate automated Return-To-Home (RTH) immediately.", isCorrect: false, rationale: "Automated RTH requires functional GNSS positioning to calculate a path back to the home point, making it unreliable without a signal." },
        { text: "Switch the flight mode to ATTI and manually stabilize the drone.", isCorrect: true, rationale: "When GNSS positioning is lost, switching to manual Attitude (ATTI) mode allows the pilot to maintain altitude via the barometer while controlling drift manually." },
        { text: "Perform a compass calibration while the aircraft is airborne.", isCorrect: false, rationale: "Compass calibration must always be performed statically on the ground away from magnetic interference, never while the aircraft is flying." },
        { text: "Allow the Vision Positioning System (VPS) to take over flight navigation automatically at high altitude.", isCorrect: false, rationale: "The VPS system is only effective for positioning stability when operating indoors or at very low altitudes." }
      ]
    },
    {
      id: 3,
      question: "An operator plans an automated mapping flight with a required Frontlap of 80% and Sidelap of 70%. What is the primary purpose of maintaining these specific overlap settings?",
      options: [
        { text: "To extend the overall operating lifecycle of the brushless motors.", isCorrect: false, rationale: "Overlap parameters govern camera interval timing and flight path spacing, having no direct correlation to motor physics or wear." },
        { text: "To ensure software can accurately match tie points for successful 3D model reconstruction.", isCorrect: true, rationale: "High overlap ensures features are visible from multiple vantage points, allowing photogrammetry software to identify common tie points for orthomosaics and DSMs." },
        { text: "To prevent electromagnetic interference from impacting the digital compass.", isCorrect: false, rationale: "Compass errors are caused by metallic or magnetic sources on the ground, not by camera capture configurations or track overlaps." },
        { text: "To artificially decrease the Ground Sampling Distance (GSD).", isCorrect: false, rationale: "GSD is exclusively controlled by sensor resolution and flight altitude above ground level, not by the amount of image overlap." }
      ]
    },
    {
      id: 4,
      question: "When configuring an automated mission, how does increasing the flight altitude affect the Ground Sampling Distance (GSD) and the total mapping area coverage?",
      options: [
        { text: "GSD value increases (lower spatial resolution), while total area coverage increases.", isCorrect: true, rationale: "Flying higher allows the camera sensor to capture a larger footprint per image (increasing coverage), but increases the physical ground size represented by each pixel (larger GSD, lower resolution)." },
        { text: "GSD value decreases (higher spatial resolution), while total area coverage decreases.", isCorrect: false, rationale: "A lower GSD value means higher resolution, which is achieved by flying lower, not higher." },
        { text: "GSD value remains identical, but total area coverage decreases.", isCorrect: false, rationale: "GSD is mathematically bound to altitude; it is physically impossible for GSD to remain identical if the distance to the target increases." },
        { text: "GSD value increases (lower spatial resolution), while total area coverage decreases.", isCorrect: false, rationale: "While GSD does increase at higher altitudes, the broader camera field of view increases total area coverage rather than reducing it." }
      ]
    },
    {
      id: 5,
      question: "Which internal sensor is primarily responsible for calculating the real-time altitude of a UAV based on changes in atmospheric environmental conditions?",
      options: [
        { text: "Magnetometer", isCorrect: false, rationale: "The magnetometer functions as a digital compass to map the heading of the aircraft relative to magnetic north." },
        { text: "Barometer", isCorrect: true, rationale: "A barometer reads changes in ambient air pressure to determine the relative altitude changes of the drone during operation." },
        { text: "Inertial Measurement Unit (IMU)", isCorrect: false, rationale: "The IMU measures structural acceleration and angular velocity forces along axes to stabilize flight orientation." },
        { text: "Global Navigation Satellite System (GNSS)", isCorrect: false, rationale: "GNSS tracks 3D coordinate positioning via satellite signals, but relies on internal pressure sensors like barometers for highly sensitive altitude tracking." }
      ]
    },
    {
      id: 6,
      question: "According to the weather operating standards of Agro Aerial Precision SL Ltd, which of the following environmental metrics represents an unsafe condition for flight deployment?",
      options: [
        { text: "A sustained ambient wind speed of 6 m/s.", isCorrect: false, rationale: "Wind speeds below 10 m/s are categorized within safe professional operational envelopes." },
        { text: "Horizontal flight visibility measured at 4 km.", isCorrect: false, rationale: "Minimum safe visibility standard requires visual ranges exceeding 3 km, making 4 km safe." },
        { text: "An environment exhibiting localized electromagnetic interference or heavy fog.", isCorrect: true, rationale: "Heavy fog restricts required VLOS compliance, and electromagnetic interference poses severe risks to compass and communication link integrity." },
        { text: "An explicit clear-sky morning window between 10 AM and 2 PM.", isCorrect: false, rationale: "The 10 AM to 2 PM window represents the ideal standard for consistent sunlight reflection during agricultural missions." }
      ]
    },
    {
      id: 7,
      question: "What is the primary mechanical function of an Electronic Speed Controller (ESC) within a multirotor propulsion system?",
      options: [
        { text: "To interpret incoming satellite signals from the GNSS array.", isCorrect: false, rationale: "Satellite signal processing is handled exclusively by the core central flight controller." },
        { text: "To convert direct current (DC) power from the battery into controlled output to regulate motor speed.", isCorrect: true, rationale: "ESCs serve as intermediate power controllers, modulating the direct current from the battery into dynamic motor speeds based on flight commands." },
        { text: "To alter the physical pitch angle of fixed-wing propeller blades dynamically.", isCorrect: false, rationale: "ESCs modify electrical rotational speed, not the structural shape or physical pitch angle of the propeller blades." },
        { text: "To store backup flight telemetry when data offloading links fail.", isCorrect: false, rationale: "Telemetry storage occurs on internal flight logs or micro-SD data storage components within the aircraft body." }
      ]
    },
    {
      id: 8,
      question: "When executing professional mapping workflows, what role do Ground Control Points (GCPs) perform during the office data processing stage?",
      options: [
        { text: "They calibrate the internal IMU to resolve airborne vibration anomalies.", isCorrect: false, rationale: "IMU calibrations are internal software routines completed statically on a level surface, unlinked to ground coordinates." },
        { text: "They verify and significantly improve the spatial absolute accuracy of mapping outputs.", isCorrect: true, rationale: "GCPs provide known, highly precise geographic reference locations on the earth's surface to anchor and validate the absolute accuracy of the photogrammetric model." },
        { text: "They increase the pixel density of the camera sensor during data acquisition.", isCorrect: false, rationale: "Camera sensor pixel dimensions are fixed hardware features that cannot be manipulated by placing objects on the ground." },
        { text: "They automate flight path generation to bypass localized no-fly zones.", isCorrect: false, rationale: "Airspace boundaries are handled during initial mission planning steps via airspace map overlays." }
      ]
    },
    {
      id: 9,
      question: "A pilot conducting precision agriculture tracking wants to compute a Normalized Difference Vegetation Index (NDVI) map. Which sensor payload configuration is required?",
      options: [
        { text: "A standard thermal sensor paired with structural LiDAR lasers.", isCorrect: false, rationale: "Thermal and LiDAR configurations track surface temperatures and precise physical elevations, not plant pigment reflectance curves." },
        { text: "A multispectral camera capturing near-infrared (NIR) and visible red light bands.", isCorrect: true, rationale: "NDVI calculations rely fundamentally on comparing the strong absorption of visible red light by chlorophyll and the high reflection of near-infrared light by healthy plant tissues." },
        { text: "A standard high-definition RGB camera configured exclusively for video footage.", isCorrect: false, rationale: "Standard RGB channels cannot capture near-infrared radiation bands, making accurate structural NDVI calculation impossible." },
        { text: "A single-beam echo sounder coupled with an ultra-wide vision lens.", isCorrect: false, rationale: "Echo sounders are acoustic sensors used to analyze underwater topography, unrelated to crop health metrics." }
      ]
    },
    {
      id: 10,
      question: "Which of the following describes an absolute restriction within the local regulatory framework for drone operations in Sierra Leone?",
      options: [
        { text: "Flying exclusively during the midday sunlight window of 10 AM to 2 PM.", isCorrect: false, rationale: "This window is an optimization preference for agriculture mapping, not a legal restriction enforced by aviation law." },
        { text: "Operating automated waypoint missions inside a localized airport or military no-fly zone without authorization.", isCorrect: true, rationale: "Aviation frameworks strictly prohibit operating any unmanned aircraft inside critical airspace zones like airports and military installations due to severe security and safety hazards." },
        { text: "Using carbon fiber materials for multirotor propeller construction.", isCorrect: false, rationale: "Propeller materials are determined by performance requirements and are not restricted by local aviation safety regulations." },
        { text: "Failing to offload flight data logs within 24 hours of landing.", isCorrect: false, rationale: "While logging is standard operational practice for records maintenance, data offload timing is a company SOP rather than an absolute statutory aviation law." }
      ]
    }
  ];

  const shuffleQuizData = (data: QuizItem[]) => data.map((item) => ({
    ...item,
    options: shuffleArray(item.options),
  }));

  // State management
  const navigate = useNavigate();
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutes in seconds
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [showRetakePopup, setShowRetakePopup] = useState(false);
  const [shuffledQuizData, setShuffledQuizData] = useState<QuizItem[]>(() => shuffleQuizData(quizData));
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const passingScorePercentage = 80;
  const retakePrice = '250 SLL';
  const adminPhone = '+23277840105';
  const adminEmail = 'admin@agroaerialprecision.com';

  // Check student session and setup timer
  useEffect(() => {
    const student = getStudentSession();
    if (!student) {
      navigate('/student-login');
      return;
    }
    setStudentName(student.name);
    setStudentEmail(student.email);
    setStudentId(student.id);

    // Timer countdown
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleAutoSubmit = () => {
    if (!isSubmitted) {
      let correctCount = 0;
      shuffledQuizData.forEach((q) => {
        const selectedIdx = selectedAnswers[q.id];
        if (selectedIdx !== undefined && q.options[selectedIdx].isCorrect) {
          correctCount++;
        }
      });
      const percentage = Math.round((correctCount / shuffledQuizData.length) * 100);
      setScore(correctCount);
      setIsSubmitted(true);
      setShowRetakePopup(percentage < passingScorePercentage);
      alert('Time is up! Your exam has been auto-submitted.');
    }
  };

  const openWhatsAppForRetake = () => {
    const message = `Hello Agro Aerial Precision admin, I failed the exam and would like to retake it. My name is ${studentName || 'Student'}, score: ${scorePercentage}%. Please share the retake details and payment instructions.`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${encodeURIComponent(adminPhone)}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const sendExamResultsEmail = async (correctCount: number, percentage: number) => {
    setIsSendingEmail(true);
    try {
      // Using FormSubmit.co to send emails
      const formData = new FormData();
      formData.append('email', adminEmail);
      formData.append('subject', `Drone Exam Results - ${studentName} (${studentId})`);
      
      const answersSummary = shuffledQuizData
        .map(q => {
          const selectedIdx = selectedAnswers[q.id];
          const selectedOption = selectedIdx !== undefined ? q.options[selectedIdx].text : 'Not answered';
          const isCorrect = selectedIdx !== undefined && q.options[selectedIdx].isCorrect;
          return `Q${q.id}: ${selectedOption} ${isCorrect ? '✓ CORRECT' : '✗ INCORRECT'}`;
        })
        .join('\n');

      const emailBody = `
DRONE OPERATIONS & MAPPING CERTIFICATION EXAM - RESULTS
========================================================

Student Information:
- Name: ${studentName}
- Student ID: ${studentId}
- Email: ${studentEmail}
- Date: ${new Date().toLocaleString()}

EXAM RESULTS:
- Score: ${correctCount} / ${shuffledQuizData.length}
- Percentage: ${percentage}%
- Status: ${percentage >= passingScorePercentage ? 'PASSED ✓' : 'NOT PASSED ✗'}
- Passing Threshold: ${passingScorePercentage}%

DETAILED ANSWERS:
${answersSummary}

========================================================
End of Report
`;

      formData.append('message', emailBody);

      // Send email via FormSubmit.co
      const response = await fetch('https://formsubmit.co/ajax/' + adminEmail, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        console.log('Exam results sent to admin email successfully');
      } else {
        console.error('Failed to send email, but exam submission recorded');
      }
    } catch (error) {
      console.error('Error sending exam results email:', error);
      // Continue even if email fails - the exam is still submitted
    } finally {
      setIsSendingEmail(false);
    }
  };

  const isTimeRunningLow = timeLeft < 300; // 5 minutes warning

  const handleOptionChange = (questionId: number, optionIndex: number) => {
    if (isSubmitted) return; // Lock inputs if submitted
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionIndex
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that all questions are answered
    if (Object.keys(selectedAnswers).length < shuffledQuizData.length) {
      alert("Please answer all questions before submitting the assessment.");
      return;
    }

    let correctCount = 0;
    shuffledQuizData.forEach((q) => {
      const selectedIdx = selectedAnswers[q.id];
      if (selectedIdx !== undefined && q.options[selectedIdx].isCorrect) {
        correctCount++;
      }
    });

    const percentage = Math.round((correctCount / shuffledQuizData.length) * 100);
    setScore(correctCount);
    setIsSubmitted(true);
    setShowRetakePopup(percentage < passingScorePercentage);
    
    // Send exam results to admin email
    sendExamResultsEmail(correctCount, percentage);
  };

  const scorePercentage = Math.round((score / shuffledQuizData.length) * 100);
  const isPassed = scorePercentage >= passingScorePercentage;

  // Inline Style Themes
  const styles = {
    container: { maxWidth: '800px', margin: '40px auto', marginTop:'60px', background: '#fff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#212529', lineHeight: '1.6' },
    header: { textAlign: 'center' as const, borderBottom: '3px solid #2e7d32', paddingBottom: '20px', marginBottom: '30px' },
    title: { color: '#2e7d32', margin: '0 0 10px 0', fontSize: '28px' },
    subtitle: { color: '#37474f', margin: '0', fontSize: '18px', fontWeight: '400' },
    branding: { fontSize: '14px', fontWeight: 'bold', color: '#37474f', marginTop: '5px' },
    card: { marginBottom: '30px', padding: '25px', border: '1px solid #dee2e6', borderRadius: '6px', backgroundColor: '#fff' },
    questionText: { fontSize: '17px', fontWeight: '600', marginBottom: '15px', color: '#111' },
    list: { listStyle: 'none' as const, padding: '0', margin: '0' },
    item: (qId: number, oIdx: number, isCorrect: boolean) => {
      let bg = '#fff';
      let border = '#dee2e6';
      let text = '#212529';
      
      if (isSubmitted) {
        if (isCorrect) {
          bg = '#e8f5e9';
          border = '#2e7d32';
          text = '#2e7d32';
        } else if (selectedAnswers[qId] === oIdx) {
          bg = '#ffebee';
          border = '#c62828';
          text = '#c62828';
        }
      }
      return { display: 'flex' as const, alignItems: 'flex-start' as const, marginBottom: '12px', padding: '12px 15px', border: `1px solid ${border}`, borderRadius: '4px', backgroundColor: bg, color: text, cursor: isSubmitted ? 'default' : 'pointer' as const };
    },
    radio: { marginTop: '5px', marginRight: '12px', cursor: 'pointer' },
    label: { cursor: 'pointer', flex: 1 },
    submitBtn: { display: 'block' as const, width: '100%', backgroundColor: '#2e7d32', color: 'white', border: 'none', padding: '15px', fontSize: '18px', fontWeight: 'bold', borderRadius: '6px', cursor: isSendingEmail ? 'not-allowed' : 'pointer', transition: 'background 0.2s', marginTop: '20px', opacity: isSendingEmail ? 0.7 : 1 },
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
    modalOverlay: {
      position: 'fixed' as const,
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.55)',
      display: 'flex' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      padding: '20px',
      zIndex: 100
    },
    modalContent: {
      width: '100%',
      maxWidth: '520px',
      backgroundColor: '#fff',
      borderRadius: '16px',
      padding: '30px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      textAlign: 'center' as const,
      position: 'relative' as const
    },
    modalTitle: { fontSize: '22px', fontWeight: '700', marginBottom: '18px', color: '#2e7d32' },
    modalText: { color: '#394047', fontSize: '16px', lineHeight: '1.7', marginBottom: '18px' },
    modalButton: { width: '100%', backgroundColor: '#25d366', color: '#fff', border: 'none', borderRadius: '8px', padding: '14px 18px', cursor: 'pointer', fontSize: '16px', fontWeight: '700', marginBottom: '10px' },
    modalCloseBtn: { position: 'absolute' as const, top: '18px', right: '18px', background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#4b5563' },

    timerText: { 
      fontSize: '18px', 
      fontWeight: 'bold', 
      color: isTimeRunningLow ? '#c62828' : '#2e7d32',
      fontFamily: 'monospace'
    },
    studentInfo: { fontSize: '14px', color: '#666' },
    logoutBtn: { padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }
  };

  const handleLogout = () => {
    clearStudentSession();
    navigate('/student-login');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Drone Operations & Mapping Certification Exam</h1>
        <h2 style={styles.subtitle}>Written Assessment Module</h2>
        <div style={styles.branding}>Agro Aerial Precision SL Ltd</div>
      </div>

      {!isSubmitted && (
        <div style={styles.timerContainer}>
          <div>
            <div style={styles.studentInfo}>Student: <strong>{studentName}</strong></div>
          </div>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={styles.timerText}>⏱ Time Left: {formatTime(timeLeft)}</div>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {shuffledQuizData.map((q, qIdx) => (
          <div key={q.id} style={styles.card}>
            <div style={styles.questionText}>{qIdx + 1}. {q.question}</div>
            <ul style={styles.list}>
              {q.options.map((opt, oIdx) => (
                <li key={oIdx} style={styles.item(q.id, oIdx, opt.isCorrect)}>
                  <input
                    type="radio"
                    name={`question-${q.id}`}
                    id={`q-${q.id}-o-${oIdx}`}
                    checked={selectedAnswers[q.id] === oIdx}
                    onChange={() => handleOptionChange(q.id, oIdx)}
                    disabled={isSubmitted}
                    style={styles.radio}
                    required
                  />
                  <label htmlFor={`q-${q.id}-o-${oIdx}`} style={styles.label}>
                    {opt.text}
                  </label>
                </li>
              ))}
            </ul>

            {/* Show accurate corrective analysis after submission triggers */}
            {isSubmitted && (
              <div style={styles.rationale}>
                <strong>Rationale:</strong> {q.options.find(o => o.isCorrect)?.rationale}
              </div>
            )}
          </div>
        ))}

        {!isSubmitted && (
          <button type="submit" style={styles.submitBtn} disabled={isSendingEmail}>
            {isSendingEmail ? 'Submitting & Sending Results...' : 'Submit Assessment'}
          </button>
        )}
      </form>

      {isSubmitted && (
        <div style={styles.resultsPanel}>
          <div style={styles.scoreText}>
            Final Score: {score} / {shuffledQuizData.length} ({scorePercentage}%)
          </div>
          <div>
            {isPassed ? (
              <span>
                <strong>Result: PASSED</strong><br />
                Congratulations! You have satisfied the technical knowledge framework parameters required for the Agro Aerial Precision SL Ltd Drone Operations & Mapping Certification.
              </span>
            ) : (
              <span>
                <strong>Result: NOT PASSED</strong><br />
                Minimum passing validation tier is 80%. Please review the operational documentation checklists and attempt this validation block module layout once again.
              </span>
            )}
          </div>
        </div>
      )}

      {showRetakePopup && !isPassed && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <button
              onClick={() => setShowRetakePopup(false)}
              style={styles.modalCloseBtn}
              aria-label="Close retake popup"
            >
              ×
            </button>
            <h3 style={styles.modalTitle}>Exam Retake Required</h3>
            <p style={styles.modalText}>
              You scored {score} out of {shuffledQuizData.length} ({scorePercentage}%).
              <br />
              The minimum pass mark is {passingScorePercentage}%. To retake the exam, please contact the admin.
            </p>
            <p style={styles.modalText}>
              Retake fee: <strong>{retakePrice}</strong>
            </p>
            <button style={styles.modalButton} onClick={openWhatsAppForRetake}>
              Chat with Admin on WhatsApp
            </button>
            <button
              type="button"
              onClick={() => setShowRetakePopup(false)}
              style={{
                ...styles.modalButton,
                backgroundColor: '#374151',
                marginTop: '0',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DroneExam;
