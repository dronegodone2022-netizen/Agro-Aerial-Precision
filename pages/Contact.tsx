
import React, { useState } from 'react';
import AnimatedSection from '../components/AnimatedSection';

const contactBg = new URL('../src/assets/service bg.jpg', import.meta.url).href;

const Contact: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      // MailerLite API configuration
      const API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI0IiwianRpIjoiNWUwMjhjMDVlODhlZjBlZjhjYzRhNWZiNWU3ZTRhNjE5ZjM4NjE4YzZhNTZjYjEzZmI2N2EwNTEzMDMwOGVkZjVmZDliNDE0OTcwZTVhYjUiLCJpYXQiOjE3NzU5MjExMjguMjk3MTQ3LCJuYmYiOjE3NzU5MjExMjguMjk3MTUsImV4cCI6NDkzMTU5NDcyOC4yODk1MDEsInN1YiI6IjIyNTk3NzAiLCJzY29wZXMiOltdfQ.m_Uofcvm2HPxpO9iB3c_JscROpYBsvXTxgOdnPhJGh34gfrBQj92OG1CUdDDlAulEjbV6kjke6LkD-S7v8Ya-EeoYLk2wPzfPg4QGWcE0AY8Oy6ijuFFeczLO15mtjd2jUpp6ZZLuSoN-k_jvOKyJF6peZ2czoV6RPG0Kqkw8lEBIaGpSiMe7uys9hfoafZDay0uvqIZWjE-c43syG7fO-EhcRxu6S6lGe0L69Zt2-uwTWvZHKPHXi77f3eepiKzw2Xq_NWqVjS--C4MbBmHru4uEZVOrEFzRGZGTl9pJc4TIpA5CTnknsCZIBT7iW3BuVuh1uZVe-sol9q92vh-88YZrWEy2gN3BhKyM9g6z6NecOdk7a5naJXbW4g-5V2GMlSvZpDPf-lYzLLVZ0ihAs1Cisl6nVM80NObHLWvHdJKtYTDaXJeBkui5RP6k_U7fpUGiIlhw9ccX0gY30UeGLVedX0nbmOtblv527SHZHoUGCXHKLxRLQqUwE0IFue0DbAEZEpaDTv6EanrxuZc6zGa899HRmAKRwyiGyvm3LlffiyE5_fhvdWkRMkGqLX35fhjUe6MlsTrQ7gwlXvcmGOoMZQQNdZo5WP_yWjGa1h7crDxYffbIL8Pm2JZ89yCa4l6V9KoW2JaHDcCZfM--dPRficnpyQLNtmtWBoZQzI'; // Replace with your MailerLite API key
      const GROUP_ID = '184458818206303987'; // Replace with your MailerLite group ID

      // First, subscribe to newsletter
      const subscribeResponse = await fetch('https://connect.mailerlite.com/api/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          email: email,
          fields: {
            name: `${firstName} ${lastName}`,
            company: '', // You can add more fields as needed
            phone: '' // Add phone field if you want
          },
          groups: [GROUP_ID]
        })
      });

      if (subscribeResponse.ok) {
        // Send contact message via WhatsApp (keeping this functionality)
        const whatsappText = `Hello Agro Aerial Precision team,\n\nName: ${firstName} ${lastName}\nEmail: ${email}\nSubject: ${subject}\nMessage: ${message}\n\nPlease contact me with details.`;
        const whatsappUrl = `https://api.whatsapp.com/send?phone=+23277840105&text=${encodeURIComponent(whatsappText)}`;
        window.open(whatsappUrl, '_blank');

        setShowSuccess(true);
        setFirstName('');
        setLastName('');
        setEmail('');
        setSubject('General Inquiry');
        setMessage('');

        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
      } else {
        const errorData = await subscribeResponse.json();
        alert(`Failed to send message: ${errorData.message || 'Please try again.'}`);
      }
    } catch (error) {
      alert('Network error. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="bg-green-800 text-white h-[50dvh]  py-20 text-center">
           <div className="absolute inset-0 bg-slate-900 h-[70dvh]">
          <img 
            src={contactBg} 
            alt="Hero Background" 
            className="w-full h-[70dvh]  object-cover opacity-40 sm:opacity-50" 
          />
          <div className="h-[70dvh] absolute inset-0 bg-linear-to-r from-slate-900 via-lime-900/70 to-slate-900/40"></div>
        </div>


        <AnimatedSection className="container lg:mt-20 mx-auto px-4" animationType="unveil-scale" delay={0.1}>
          <h1 className="relative text-5xl font-bold mb-4">Get In Touch</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Have questions about our drone services? Reach out today and our experts will help you find the right solution.
          </p>
        </AnimatedSection>
      </section>

      {/* Contact Content */}
      <section className="py-12">
        <AnimatedSection className="container mx-auto px-4" animationType="unveil" delay={0.05}>
          <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl lg:mt-20 overflow-hidden grid grid-cols-1 lg:grid-cols-5">
            
            {/* Contact Info Side */}
            <div className="lg:col-span-2  bg-green-950 p-12 text-white">
              <h3 className="text-3xl font-bold mb-8">Contact Information</h3>
              <p className="text-slate-400 mb-12">Feel free to contact us via email, phone, or visit our office.</p>
              
              <div className="space-y-8">
                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 bg-green-600/20 text-lime-500 rounded-xl flex items-center justify-center text-xl">
                    <i className="ri-map-pin-line"></i>
                  </div>
                  <div>
                    <h5 className="font-bold mb-1">Location</h5>
                    <p className="text-slate-400">Koidu City, Sierra Leone</p>
                  </div>
                </div>
                
                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 bg-green-600/20 text-lime-500 rounded-xl flex items-center justify-center text-xl">
                    <i className="ri-phone-line"></i>
                  </div>
                  <div>
                    <h5 className="font-bold mb-1">Phone</h5>
                    <p className="text-slate-400">+232 75 510 770</p>
                  </div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 bg-green-600/20 text-lime-500 rounded-xl flex items-center justify-center text-xl">
                    <i className="ri-mail-line"></i>
                  </div>
                  <div>
                    <h5 className="font-bold mb-1">Email</h5>
                    <p className="text-slate-400">info@agroaerialprecision.com</p>
                  </div>
                </div>
              </div>

              <div className="mt-20 flex gap-4">
                <a href="https://www.facebook.com/AgroAerialPrecision/" className="w-10 h-10 rounded-lg bg-lime-500 flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <i className="ri-facebook-fill"></i>
                </a>
                <a href="https://www.linkedin.com/company/agro-aerial-precision/" className="w-10 h-10 rounded-lg bg-lime-500 flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <i className="ri-linkedin-fill"></i>
                </a>
                <a href="https://www.youtube.com/@agroaerialprecision232" className="w-10 h-10 rounded-lg bg-lime-500 flex items-center justify-center hover:bg-red-700 transition-colors">
                  <i className="ri-youtube-fill"></i>
                </a>
              </div>
            </div>

            {/* Form Side */}
            <div className="lg:col-span-3 p-12">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-green-700">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      required
                      className="w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:border-green-600"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-green-700">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      required
                      className="w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:border-green-600"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-green-700">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:border-green-600"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-green-700">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:border-green-600"
                  >
                    <option>General Inquiry</option>
                    <option>Agriculture Services</option>
                    <option>Industrial Inspection</option>
                    <option>Partnership</option>
                    <option>Training Programs</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-green-700">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    placeholder="Tell us about your project..."
                    required
                    className="w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:border-green-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-green-800 text-white font-bold py-4 rounded-xl hover:bg-lime-700 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-60"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* Map Placeholder */}
      <section className="h-96 bg-lime-200 border-t-4 border-lime-500">
        <AnimatedSection className="h-full" animationType="unveil-right" delay={0.1}>
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15758.852720275817!2d-10.983!3d8.64!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xf09f09f09f09f09%3A0xf09f09f09f09f09!2sKoidu%2C%20Sierra%20Leone!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen 
            loading="lazy"
          ></iframe>
        </AnimatedSection>
      </section>
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="rounded-xl bg-white p-6 text-center shadow-2xl max-w-sm w-full">
            <h3 className="text-xl font-bold mb-2">Application Sent</h3>
            <p className="text-slate-600 mb-4">Your message was sent via WhatsApp and email. The page will refresh shortly.</p>
            <button
              onClick={() => setShowSuccess(false)}
              className="px-6 py-2 rounded-lg bg-green-800 text-white hover:bg-lime-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contact;
