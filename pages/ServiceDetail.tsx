
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SERVICES, findIndustry } from '../constants';
import AnimatedSection from '../components/AnimatedSection';
import CloseButton from '../components/CloseButton';
import { companyWhatsAppUrl, getErrorMessage, submitContactMessage } from '../src/examApi';

const serviceDetailVideo = new URL('../src/assets/home-videoBG1.mp4', import.meta.url).href;

const ServiceDetail: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inquiryService, setInquiryService] = useState<string | null>(null);
  const [inquiryError, setInquiryError] = useState('');
  const [sentWhatsAppText, setSentWhatsAppText] = useState('');
  const [website, setWebsite] = useState(''); // hidden spam trap

  const openInquiry = (serviceTitle: string | null = null) => {
    setInquiryService(serviceTitle);
    setInquiryError('');
    setIsSubmitted(false);
    setIsPopupOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInquiryError('');

    const about = inquiryService || pageTitle;
    const whatsappText = `Hello Agro Aerial Precision team,\n\nName: ${formData.name}\nEmail: ${formData.email}${formData.phone ? `\nPhone: ${formData.phone}` : ''}\nService: ${about}\nMessage: ${formData.message}`;

    // Bots fill every field; pretend it worked and send nothing
    if (website) {
      setSentWhatsAppText(whatsappText);
      setIsSubmitted(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await submitContactMessage({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: `${about} inquiry`,
        message: formData.message,
        source: `service:${displayCategory}`,
      });
      setSentWhatsAppText(whatsappText);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setInquiryError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const FAQData: Record<string, Array<{ question: string; answer: string }>> = {
    Mining: [
      {
        question: 'How accurate are your mine surveys and stockpile volumes?',
        answer: 'With ground control points and RTK positioning, our surveys typically reach a few centimetres of accuracy. Stockpile volumes are measured from millions of data points, which is usually more reliable than a handful of ground survey shots. We confirm the accuracy target with you before each project.'
      },
      {
        question: 'Will a survey interrupt our mining operations?',
        answer: 'No. The drone flies above the operation, so haul trucks and loaders keep working. We agree flight times and safety zones with your site team before we fly.'
      },
      {
        question: 'Can you deliver data for our mine planning software?',
        answer: 'Yes. We deliver orthomosaics, surfaces, contours and point clouds in standard formats that load into Surpac, Datamine, Micromine, CAD and GIS software.'
      },
      {
        question: 'How often should we survey?',
        answer: 'Most operations survey monthly for production reporting and stockpile reconciliation. Some sites also survey after major blasts or before end-of-quarter reporting.'
      }
    ],
    Construction: [
      {
        question: 'What do you deliver from a topographic survey?',
        answer: 'Typically a high-resolution orthomosaic, a digital surface model, a bare-earth terrain model, contour lines and a point cloud - in formats your engineers can open in CAD and GIS software.'
      },
      {
        question: 'How often should we fly progress monitoring?',
        answer: 'Weekly or monthly, depending on how fast the project moves. We fly the same routes and viewpoints each time so every flight can be compared with the last one and with the design.'
      },
      {
        question: 'When do we need LiDAR instead of normal photo mapping?',
        answer: 'When the ground is covered by trees or bush. Photo mapping only sees the top of the vegetation; LiDAR reaches the ground through gaps in the canopy and gives you the true terrain.'
      },
      {
        question: 'Can drones map a large or hard-to-reach site?',
        answer: 'Yes - that is where drones save the most time. A site that takes a ground team several weeks can often be flown in one or two days.'
      }
    ],
    Agriculture: [
      {
        question: 'How accurate is your precision spraying technology?',
        answer: 'Our drone spraying system applies products at precise, calibrated rates, ensuring uniform coverage while reducing chemical usage by up to 30% compared to traditional methods.'
      },
      {
        question: 'What is the recommended frequency for crop health monitoring?',
        answer: 'We recommend monitoring every 7-10 days during critical growth stages. This frequency allows us to detect early signs of disease or stress and provide timely interventions.'
      },
      {
        question: 'Can your drones operate in all weather conditions?',
        answer: 'Our drones operate optimally in light to moderate wind conditions (up to 40 km/h). We do not operate during heavy rain, storms, or extreme weather for safety and accuracy reasons.'
      },
      {
        question: 'How much farm area can be covered in a day?',
        answer: 'Depending on the task and field conditions, our drones can cover 100-300 hectares per day for spraying and 500+ hectares for mapping and surveys.'
      },
      {
        question: 'What data do you provide from mapping surveys?',
        answer: 'We provide detailed orthomosaic maps, elevation models, vegetation index maps (NDVI), and comprehensive reports with actionable insights for farm management.'
      }
    ],
    'Drone Repairing': [
      {
        question: 'What types of drone repairs do you handle?',
        answer: 'We repair motors, propellers, flight controllers, cameras, gimbals, batteries, and airframes for commercial and industrial drones, as well as software and firmware issues.'
      },
      {
        question: 'Do you offer on-site repair services?',
        answer: 'Yes, we provide on-site inspections and repairs for fleet operations, along with workshop service for more complex maintenance and rebuilds.'
      },
      {
        question: 'How quickly can you restore a grounded drone?',
        answer: 'Our technicians aim to diagnose most issues within 24 hours and complete repairs quickly with genuine replacement parts and full test flights.'
      },
      {
        question: 'Can you help prevent future drone failures?',
        answer: 'Absolutely — our preventive maintenance programs include inspections, firmware updates, calibration, and training recommendations to extend drone life and reliability.'
      }
    ],
    Inspection: [
      {
        question: 'How do you ensure safety during inspections?',
        answer: 'All our operations follow strict safety protocols including pre-flight checks, trained and experienced pilots, and real-time monitoring. We maintain safe distances from structures and power sources.'
      },
      {
        question: 'Can your drones inspect structures at night?',
        answer: 'Yes, we have thermal and night-vision equipped drones that can conduct inspections in low-light conditions, making 24/7 monitoring possible for critical infrastructure.'
      },
      {
        question: 'What types of assets can be inspected?',
        answer: 'We inspect power lines, solar farms, construction sites, bridges, mining pits, towers, and other industrial infrastructure with high-resolution imagery and thermal analysis.'
      },
      {
        question: 'How quickly can you provide inspection reports?',
        answer: 'Initial visual reports are provided within 24 hours. Comprehensive analysis with detailed findings and recommendations typically takes 2-3 business days.'
      }
    ],
    Environment: [
      {
        question: 'What can environmental drone monitoring show?',
        answer: 'Land reclamation and rehabilitation progress, erosion and drainage problems, vegetation health, and land-use change over time - all as dated, measurable maps you can share with regulators and communities.'
      },
      {
        question: 'Can you help with environmental compliance reporting?',
        answer: 'Yes. Regular surveys give you consistent before-and-after evidence for environmental management plans, rehabilitation commitments and stakeholder reports.'
      },
      {
        question: 'How effective is drone-based mosquito control?',
        answer: 'Drone-based mosquito control reaches 85-90% effectiveness in coverage areas, with results visible within 2-3 days. It covers hard-to-reach areas that traditional methods cannot access.'
      },
      {
        question: 'Is the mosquito control solution environmentally safe?',
        answer: 'Yes, we use eco-friendly, biodegradable solutions approved for human and environmental safety. Our approach minimizes impact on non-target species and water sources.'
      },
      {
        question: 'How often should mosquito control operations be conducted?',
        answer: 'During high-risk seasons, we recommend operations every 7-14 days. During low season, monthly operations provide adequate preventive coverage.'
      },
      {
        question: 'What diseases can be prevented through regular mosquito control?',
        answer: 'Regular mosquito control helps prevent malaria, dengue fever, Zika virus, yellow fever, and other mosquito-borne diseases in affected communities.'
      }
    ]
  };

  const industry = findIndustry(category);
  const displayCategory = industry ? industry.category : 'Our Services';
  const pageTitle = industry ? industry.name : 'Our Services';

  const categoryFAQs = FAQData[displayCategory] || [];

  const filteredServices = SERVICES.filter(s => s.category === displayCategory);

  return (
    <div className="pt-16 sm:pt-20 min-h-screen bg-slate-50 pb-16 sm:pb-20">
      <div className="absolute inset-0 bg-slate-900 h-[45dvh] sm:max-h-[40dvh] md:max-h-[35dvh] lg:max-h-[40dvh] lg:min-h-[70dvh] overflow-hidden">
        {displayCategory === 'Agriculture' || !industry ? (
        <video
          src={serviceDetailVideo}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full  lg:min-h-[40dvh] object-cover opacity-30"
        />
        ) : (
          <img src={industry.image} alt="" className="w-full h-full lg:min-h-[40dvh] object-cover opacity-30" />
        )}
        <div className="absolute inset-0 bg-linear-to-b from-green-900 via-slate-900/60 to-transparent opacity-50"></div>
      </div>
      
      <div className="relative z-10 h-full text-white mt-6 py-4 lg:mt-35 pb-6 text-center">
        <AnimatedSection className="container mx-auto mt-4 xs:mt-6 tablet:mt-8 px-3 xs:px-4" animationType="unveil-scale" delay={0.05}>
          <h1 className="text-3xl xs:text-3xl tablet:text-5xl laptop:text-5xl font-bold mb-3 xs:mb-4">{pageTitle}</h1>
          <p className="text-slate-300 xs:text-slate-400 text-lg xs:text-base tablet:text-lg laptop:text-xl mb-8 max-w-xl mx-auto">
            {industry ? industry.description : 'Explore our professional aerial solutions.'}
          </p>
          <div className="flex justify-center mt-8">
            <button
              onClick={() => openInquiry()}
              className="bg-lime-500 hover:bg-lime-200 text-white font-bold px-6 xs:px-8 tablet:px-10 py-3 rounded-full transition-colors text-sm xs:text-base tablet:text-lg"
            >
              Inquire for Free
            </button>
          </div>
        </AnimatedSection>
      </div>

      <AnimatedSection className="container  mx-auto px-4 lg:mb-12 xl:mb-12 sm:px-4 sm:mt-30 mt-16 xs:mt-20 tablet:mt-28 laptop:mt-28" animationType="unveil" delay={0.1}>
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:gap-10 lg:gap-12 max-w-7xl mb-8 lg:mt-60 mx-auto px-2 sm:px-0">
            {filteredServices.map((service, idx) => (
              <div key={service.id} className={`flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-12 items-start ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
                <div className="w-full lg:w-1/2">
                  <img loading="lazy" src={service.image} alt={service.title} className="rounded-2xl sm:rounded-3xl shadow-md sm:shadow-lg lg:shadow-xl w-full h-64 sm:h-72 md:h-80 lg:h-96 object-cover" />
                </div>
                <div className="w-full lg:w-1/2 space-y-4 sm:space-y-6">
                  <span className="text-green-800 font-bold uppercase tracking-widest text-xs sm:text-sm">{service.category}</span>
                  <h2 className="text-2xl sm:text-4xl lg:text-3xl font-bold text-slate-900">{service.title}</h2>
                  <div className="text-slate-600 text-base sm:text-lg leading-relaxed space-y-3">
                    {(service.longDescription || service.description).split('\n\n').map((section, idx) => (
                      <div key={idx}>
                        {section.includes('•') ? (
                          <ul className="space-y-2 pl-5">
                            {section.split('\n').map((line, lineIdx) => (
                              line.trim() && (
                                <li key={lineIdx} className="flex items-start gap-3">
                                  <i className="ri-checkbox-circle-fill text-lime-500 font-bold text-xl shrink-0 mt-0.5"></i>
                                  <span>{line.replace('•', '').trim()}</span>
                                </li>
                              )
                            ))}
                          </ul>
                        ) : (
                          <p>{section}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6">
                    <button
                      type="button"
                      onClick={() => openInquiry(service.title)}
                      className="bg-green-800 text-white px-4 sm:px-12 py-3 rounded-full font-bold hover:bg-lime-600 transition-colors text-sm sm:text-lg text-center flex-1 sm:flex-initial"
                    >
                      Request a Quote
                    </button>
                    <a
                      href={companyWhatsAppUrl(`Hi, I'm interested in your ${service.title} service. Please send me more details and pricing.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-white border border-lime-200 text-slate-700 px-4 sm:px-12 py-3 rounded-full font-bold hover:bg-lime-200 transition-colors text-sm sm:text-lg flex-1 sm:flex-initial"
                    >
                      <i className="ri-whatsapp-line" aria-hidden="true"></i> WhatsApp
                    </a>
                  </div>
                </div>
              </div>
              
            ))}
          </div>
        ) : (
          <div className="text-center  py-12 sm:py-16 lg:py-20 rounded-2xl mt-55 sm:rounded-3xl shadow-sm max-w-2xl mx-auto px-4">
            <i className="ri-service-line text-5xl sm:text-6xl text-slate-200 mb-4 sm:mb-6 block"></i>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">No specific services listed for {displayCategory} yet.</h2>
            <p className="text-slate-500 mb-6 sm:mb-8 text-sm sm:text-base">We offer custom drone solutions for all industrial needs. Please contact us for a personalized consultation.</p>
            <Link to="/contact" className="inline-block bg-green-800 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full font-bold text-sm sm:text-base">Contact Our Experts</Link>
          </div>
        )}
      </AnimatedSection>

      {/* Benefits Section */}
      <section className="py-24 bg-green-950 text-white">
        <AnimatedSection className="container mx-auto px-4" animationType="unveil-left" delay={0.05}>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Precision Aerial Services?</h2>
            <p className="text-lg text-slate-400">Transforming data into actionable results for your operations.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {[
               { title: 'Cost Savings', text: 'Reduce project overheads with faster surveys and high-accuracy inspections.', icon: 'ri-money-dollar-circle-line' },
               { title: 'Enhanced Safety', text: 'Mitigate human risk by deploying drones into hazardous or hard-to-reach areas.', icon: 'ri-shield-check-line' },
               { title: 'Data Accuracy', text: 'Make decisions based on sub-centimeter accuracy data and high-res imaging.', icon: 'ri-radar-line' },
             ].map(benefit => (
               <div key={benefit.title} className="bg-lime-800/30 p-10 rounded-3xl border border-white/10 hover:border-lime-500/50 transition-all">
                 <i className={`${benefit.icon} text-5xl text-lime-500 mb-6 block`}></i>
                 <h4 className="text-2xl font-bold mb-4">{benefit.title}</h4>
                 <p className="text-lg text-slate-400 leading-relaxed">{benefit.text}</p>
               </div>
             ))}
          </div>
        </AnimatedSection>
      </section>

      {categoryFAQs.length > 0 && (
        <AnimatedSection className="container mx-auto px-4 pt-3 sm:px-6 mt-12 sm:mt-16 lg:mt-20 bg-slate-100" animationType="unveil" delay={0.05}>
          <div className="max-w-4xl mx-auto px-2 sm:px-0">
            <div className="text-center mb-10 mt-10 sm:mb-12 lg:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold  mb-3 sm:mb-4 text-slate-900">Frequently Asked Questions</h2>
              <p className="text-slate-600 text-lg sm:text-base lg:text-lg">Find answers to common questions about our {displayCategory.toLowerCase()} solutions.</p>
            </div>

            <div className=" space-y-3 sm:space-y-4 bg-green-50">
              {categoryFAQs.map((faq, idx) => (
                <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-all">
                  <button
                    type="button"
                    aria-label={faq.question}
                    onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-4 sm:p-6 text-left hover:bg-lime-200 transition-colors"
                  >
                    <span className="text-base sm:text-lg font-bold text-green-900">{faq.question}</span>
                    <span className={`shrink-0 ml-3 sm:ml-4 text-green-800 text-xl sm:text-2xl transition-transform duration-300 ${openFAQ === idx ? 'rotate-180' : ''}`}>
                      <i className="ri-arrow-down-s-line"></i>
                    </span>
                  </button>
                  
                  {openFAQ === idx && (
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0 border-t border-slate-100">
                      <p className="text-slate-600 text-sm sm:text-base leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-10 sm:mt-12 lg:mt-16 p-6 sm:p-8 bg-linear-to-b from-green-100 to-lime-50 rounded-lg border border-lime-200">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Still have questions?</h3>
              <p className="text-slate-600 text-sm sm:text-base mb-4">Don't find the answer you're looking for? Please contact our team.</p>
              <Link to="/contact" className="inline-block bg-green-800 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full font-bold hover:bg-lime-600 transition-colors text-sm sm:text-base">
                Get in Touch
              </Link>
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* Inquiry Popup Form */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-lime-500/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {!isSubmitted ? (
              <>
                <div className="bg-lime-600 p-6 text-white rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">Free Inquiry</h3>
                    <CloseButton onClose={() => setIsPopupOpen(false)} label="Close inquiry form" tone="light" />
                  </div>
                  <p className="text-lime-100 mt-2">Get a free consultation for {inquiryService || pageTitle}</p>
                </div>

                <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                  <div>
                    <label htmlFor="inquiry-name" className="block text-sm border-lime-600 font-medium text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      id="inquiry-name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-lime-600 rounded-lg focus:outline-none focus:border-lime-500"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="inquiry-email" className="block text-sm border-lime-600 font-medium text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      id="inquiry-email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-lime-600 rounded-lg focus:outline-none focus:border-lime-500"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="inquiry-phone" className="block text-sm border-lime-600 font-medium text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      id="inquiry-phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-lime-600 rounded-lg focus:outline-none focus:border-lime-500"
                      placeholder="+232 XX XXX XXX"
                    />
                  </div>

                  <div>
                    <label htmlFor="inquiry-message" className="block text-sm border-lime-600 font-medium text-slate-700 mb-1">Message *</label>
                    <textarea
                      id="inquiry-message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="w-full px-3 py-2 border border-lime-600 rounded-lg focus:outline-none focus:border-lime-500 resize-none"
                      placeholder={`Tell us about your ${displayCategory.toLowerCase()} needs...`}
                    />
                  </div>

                  {/* Spam trap: hidden from people, filled in by bots */}
                  <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: '1px', height: '1px', overflow: 'hidden' }}>
                    <label htmlFor="inquiry-website">Website</label>
                    <input id="inquiry-website" type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
                  </div>

                  {inquiryError && (
                    <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">{inquiryError}</div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-lime-600 text-white font-bold py-3 rounded-lg hover:bg-lime-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Inquiry'}
                  </button>
                </form>
              </>
            ) : (
              <div className="relative p-8 text-center">
                <CloseButton
                  onClose={() => {
                    setIsPopupOpen(false);
                    setIsSubmitted(false);
                  }}
                  label="Close"
                  className="absolute right-3 top-3"
                />
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-check-line text-3xl text-green-600"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Inquiry Sent Successfully!</h3>
                <p className="text-slate-600 mb-6">
                  Thank you for your interest. Our team has received your inquiry and will reply by email, usually within one working day.
                </p>
                <a
                  href={companyWhatsAppUrl(sentWhatsAppText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-3 flex items-center justify-center gap-2 rounded-lg border-2 border-lime-600 px-6 py-2 font-semibold text-green-800 hover:bg-lime-50"
                >
                  <i className="ri-whatsapp-line" aria-hidden="true"></i> Also chat with us on WhatsApp
                </a>
                <button
                  onClick={() => {
                    setIsPopupOpen(false);
                    setIsSubmitted(false);
                  }}
                  className="bg-lime-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-lime-700 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default ServiceDetail;
