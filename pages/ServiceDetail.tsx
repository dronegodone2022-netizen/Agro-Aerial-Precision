
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SERVICES } from '../constants';
import AnimatedSection from '../components/AnimatedSection';

const serviceDetailVideo = new URL('../src/assets/home-videoBG1.mp4', import.meta.url).href;

const ServiceDetail: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const FAQData: Record<string, Array<{ question: string; answer: string }>> = {
    Agriculture: [
      {
        question: 'How accurate is your precision spraying technology?',
        answer: 'Our drone spraying system achieves up to 95% accuracy in application rates, ensuring uniform coverage while reducing chemical usage by up to 30% compared to traditional methods.'
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
    Inspection: [
      {
        question: 'How do you ensure safety during inspections?',
        answer: 'All our operations follow strict safety protocols including pre-flight checks, certified pilots, and real-time monitoring. We maintain safe distances from structures and power sources.'
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
    Health: [
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

  const displayCategory = category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Our Services';

  const categoryFAQs = FAQData[displayCategory] || [];
  
  const filteredServices = SERVICES.filter(
    s => s.category.toLowerCase() === category?.toLowerCase()
  );

  return (
    <div className="pt-16 sm:pt-20  min-h-screen bg-slate-50 pb-16 sm:pb-20"> 
      <div className="absolute inset-0  bg-slate-900 h-[50dvh] sm:h-[50dvh] md:h-[80dvh] lg:h-[70dvh] overflow-hidden">
        <video
          src={serviceDetailVideo}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-[50dvh] sm:h-[50dvh] md:h-[80dvh] lg:h-[70dvh] object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-linear-to-b from-green-900 via-slate-900/60 to-transparent opacity-50"></div>
      </div>
      
      <div className="relative z-10 h-full text-white mt-4 py-12 pb-2  text-center">
        <AnimatedSection className="container mx-auto mt-10 sm:mt-5 lg:mt-20 px-3 sm:px-4" animationType="unveil-scale" delay={0.05}>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">{displayCategory} Solutions</h1>
          <p className="text-slate-300 sm:text-slate-400 text-sm  lg:text-2xl sm:text-base max-w-xl mx-auto">
            Explore our professional aerial solutions tailored for {displayCategory.toLowerCase()} operations.
          </p>
        </AnimatedSection>
      </div>

      <AnimatedSection className="container mx-auto px-3 lg:mb-12 xl:mb-12 sm:px-4 mt-12 sm:mt-40 sm:pt lg:pt-0 xl:pt-24" animationType="unveil" delay={0.1}>
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:gap-10 lg:gap-15 max-w-5xl lg:mt-12 mx-auto">
            {filteredServices.map((service, idx) => (
              <div key={service.id} className={`flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-12 items-center ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
                <div className="w-full lg:w-1/2">
                  <img src={service.image} alt={service.title} className="rounded-2xl sm:rounded-3xl shadow-md sm:shadow-lg lg:shadow-xl w-full h-60 sm:h-72 lg:h-96 object-cover" />
                </div>
                <div className="w-full lg:w-1/2 space-y-4 sm:space-y-6">
                  <span className="text-green-800 font-bold uppercase tracking-widest text-xs sm:text-sm">{service.category}</span>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">{service.title}</h2>
                 <div className="text-slate-600 text-base sm:text-lg leading-relaxed space-y-3">
              {(service.longDescription || service.description).split('\n\n').map((section, idx) => (
                <div key={idx}>
                  {section.includes('•') ? (
                    <ul className="space-y-2 pl-5">
                      {section.split('\n').map((line, lineIdx) => (
                        line.trim() && (
                          <li key={lineIdx} className="flex items-start gap-3">
                            <i className="ri-checkbox-circle-fill text-lime-500 font-bold text-2xl shrink-0 mt-0.5"></i>
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
                  <Link
                    to="/contact"
                    className="bg-green-800 text-white px-6 sm:px-8 py-4 sm:py-4 rounded-full font-bold hover:bg-lime-600 transition-colors text-sm sm:text-base text-center"
                  >
                    Book Service
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      const message = `Hi, I'm inquiring about the ${service.title} service for ${displayCategory}. Please provide me with more details and pricing information.`;
                      const whatsappUrl = `https://api.whatsapp.com/send?phone=+23277840105&text=${encodeURIComponent(message)}`;
                      window.open(whatsappUrl, '_blank');
                    }}
                    className="bg-white border border-lime-200 text-slate-700 px-6 sm:px-8 py-4 sm:py-4 rounded-full font-bold hover:bg-lime-200 transition-colors text-sm sm:text-base"
                  >
                    Inquire Now
                  </button>
                  </div>
                </div>
              
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16 lg:py-20 bg-white rounded-2xl sm:rounded-3xl shadow-sm max-w-2xl mx-auto px-4">
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
            <p className="text-slate-400">Transforming data into actionable results for your operations.</p>
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
                 <p className="text-slate-400 leading-relaxed">{benefit.text}</p>
               </div>
             ))}
          </div>
        </AnimatedSection>
      </section>

      {categoryFAQs.length > 0 && (
        <AnimatedSection className="container mx-auto px-3 pt-3 sm:px-4 mt-12 sm:mt-16 lg:mt-20 bg-slate-100" animationType="unveil" delay={0.05}>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10 mt-10 sm:mb-12 lg:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold  mb-3 sm:mb-4 text-slate-900">Frequently Asked Questions</h2>
              <p className="text-slate-600 text-sm sm:text-base lg:text-lg">Find answers to common questions about our {displayCategory.toLowerCase()} solutions.</p>
            </div>

            <div className=" space-y-3 sm:space-y-4 bg-green-50">
              {categoryFAQs.map((faq, idx) => (
                <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-all">
                  <button
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
    </div>
  );
};

export default ServiceDetail;
