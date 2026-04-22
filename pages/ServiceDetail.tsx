
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SERVICES } from '../constants';
import AnimatedSection from '../components/AnimatedSection';

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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // MailerLite API configuration
      const API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI0IiwianRpIjoiNWUwMjhjMDVlODhlZjBlZjhjYzRhNWZiNWU3ZTRhNjE5ZjM4NjE4YzZhNTZjYjEzZmI2N2EwNTEzMDMwOGVkZjVmZDliNDE0OTcwZTVhYjUiLCJpYXQiOjE3NzU5MjExMjguMjk3MTQ3LCJuYmYiOjE3NzU5MjExMjguMjk3MTUsImV4cCI6NDkzMTU5NDcyOC4yODk1MDEsInN1YiI6IjIyNTk3NzAiLCJzY29wZXMiOltdfQ.m_Uofcvm2HPxpO9iB3c_JscROpYBsvXTxgOdnPhJGh34gfrBQj92OG1CUdDDlAulEjbV6kjke6LkD-S7v8Ya-EeoYLk2wPzfPg4QGWcE0AY8Oy6ijuFFeczLO15mtjd2jUpp6ZZLuSoN-k_jvOKyJF6peZ2czoV6RPG0Kqkw8lEBIaGpSiMe7uys9hfoafZDay0uvqIZWjE-c43syG7fO-EhcRxu6S6lGe0L69Zt2-uwTWvZHKPHXi77f3eepiKzw2Xq_NWqVjS--C4MbBmHru4uEZVOrEFzRGZGTl9pJc4TIpA5CTnknsCZIBT7iW3BuVuh1uZVe-sol9q92vh-88YZrWEy2gN3BhKyM9g6z6NecOdk7a5naJXbW4g-5V2GMlSvZpDPf-lYzLLVZ0ihAs1Cisl6nVM80NObHLWvHdJKtYTDaXJeBkui5RP6k_U7fpUGiIlhw9ccX0gY30UeGLVedX0nbmOtblv527SHZHoUGCXHKLxRLQqUwE0IFue0DbAEZEpaDTv6EanrxuZc6zGa899HRmAKRwyiGyvm3LlffiyE5_fhvdWkRMkGqLX35fhjUe6MlsTrQ7gwlXvcmGOoMZQQNdZo5WP_yWjGa1h7crDxYffbIL8Pm2JZ89yCa4l6V9KoW2JaHDcCZfM--dPRficnpyQLNtmtWBoZQzI'; // Replace with your MailerLite API key
      const GROUP_ID = '184458818206303987'; // Replace with your MailerLite group ID

      // Subscribe to newsletter and send inquiry
      const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          email: formData.email,
          fields: {
            name: formData.name,
            phone: formData.phone,
            message: formData.message,
            service_category: displayCategory,
            inquiry_type: 'service_inquiry'
          },
          groups: [GROUP_ID]
        })
      });

      if (response.ok) {
        setIsSubmitted(true);
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        const errorData = await response.json();
        alert(`Failed to send inquiry: ${errorData.message || 'Please try again.'}`);
      }
    } catch (error) {
      alert('Network error. Please try again later.');
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
    <div className="pt-16 sm:pt-20 min-h-screen bg-slate-50 pb-16 sm:pb-20">
      <div className="absolute inset-0 bg-slate-900 h-[45dvh] sm:max-h-[40dvh] md:max-h-[35dvh] lg:max-h-[40dvh] lg:min-h-[70dvh] overflow-hidden">
        <video
          src={serviceDetailVideo}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full  lg:min-h-[40dvh] object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-linear-to-b from-green-900 via-slate-900/60 to-transparent opacity-50"></div>
      </div>
      
      <div className="relative z-10 h-full text-white mt-6 py-4 lg:mt-35 pb-2 text-center">
        <AnimatedSection className="container mx-auto mt-4 xs:mt-6 tablet:mt-8 px-3 xs:px-4" animationType="unveil-scale" delay={0.05}>
          <h1 className="text-3xl xs:text-3xl tablet:text-5xl laptop:text-5xl font-bold mb-3 xs:mb-4">{displayCategory} Solutions</h1>
          <p className="text-slate-300 xs:text-slate-400 text-lg xs:text-base tablet:text-lg laptop:text-xl mb-8 max-w-xl mx-auto">
            Explore our professional aerial solutions tailored for {displayCategory.toLowerCase()} operations.
          </p>
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setIsPopupOpen(true)}
              className="bg-lime-500 hover:bg-lime-200 text-green-800 font-bold px-6 xs:px-8 tablet:px-10 py-3 rounded-full transition-colors text-sm xs:text-base tablet:text-lg"
            >
              Inquire for Free
            </button>
          </div>
        </AnimatedSection>
      </div>

      <AnimatedSection className="container  mx-auto px-4 lg:mb-12 xl:mb-12 sm:px-4 sm:mt-30 mt-16 xs:mt-20 tablet:mt-28 laptop:mt-28" animationType="unveil" delay={0.1}>
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:gap-10 lg:gap-12 max-w-7xl mb-8 lg:mt-12 mx-auto px-2 sm:px-0">
            {filteredServices.map((service, idx) => (
              <div key={service.id} className={`flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-12 items-start ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
                <div className="w-full lg:w-1/2">
                  <img src={service.image} alt={service.title} className="rounded-2xl sm:rounded-3xl shadow-md sm:shadow-lg lg:shadow-xl w-full h-64 sm:h-72 md:h-80 lg:h-96 object-cover" />
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
                    <Link
                      to="/contact"
                      className="bg-green-800 text-white px-4 sm:px-12 py-3 rounded-full font-bold hover:bg-lime-600 transition-colors text-sm sm:text-lg text-center flex-1 sm:flex-initial"
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
                      className="bg-white border border-lime-200 text-slate-700 px-4 sm:px-12 py-3 rounded-full font-bold hover:bg-lime-200 transition-colors text-sm sm:text-lg flex-1 sm:flex-initial"
                    >
                      Inquire Now
                    </button>
                  </div>
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
                    <button
                      onClick={() => setIsPopupOpen(false)}
                      className="text-white hover:text-lime-200 transition-colors"
                      aria-label="Close inquiry popup"
                    >
                      <i className="ri-close-line text-2xl"></i>
                    </button>
                  </div>
                  <p className="text-lime-100 mt-2">Get a free consultation for {displayCategory} services</p>
                </div>

                <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm border-lime-600 font-medium text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-lime-600 rounded-lg focus:outline-none focus:border-lime-500"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm border-lime-600 font-medium text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-lime-600 rounded-lg focus:outline-none focus:border-lime-500"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm border-lime-600 font-medium text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-lime-600 rounded-lg focus:outline-none focus:border-lime-500"
                      placeholder="+232 XX XXX XXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm border-lime-600 font-medium text-slate-700 mb-1">Message *</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="w-full px-3 py-2 border border-lime-600 rounded-lg focus:outline-none focus:border-lime-500 resize-none"
                      placeholder={`Tell us about your ${displayCategory.toLowerCase()} needs...`}
                    />
                  </div>

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
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-check-line text-3xl text-green-600"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Inquiry Sent Successfully!</h3>
                <p className="text-slate-600 mb-6">
                  Thank you for your interest. Our team will contact you within 24 hours with more details about our {displayCategory} services.
                </p>
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
