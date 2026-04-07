import React from "react";
import { TEAM } from "../constants";
import AnimatedSection from "../components/AnimatedSection";

const About: React.FC = () => {
  return (
    <div className="pt-24">
      {/* Header Section */}
      <section className="bg-slate-900 text-white h-[60dvh] py-24 h-full  -mt-24 -mb-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 h-full">
          <img
            src="public/about2.jpeg"
            alt="About"
            className="w-full h-full object-cover"
          />
        </div>
        <AnimatedSection className="container lg:mt-20 mx-auto mt-8 px-4 relative z-10" animationType="unveil-scale" delay={0.1}>
          <h1 className="text-5xl font-bold mb-4">About Us</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Revolutionizing agriculture through precision aerial technology and
            sustainable innovation.
          </p>
        </AnimatedSection>
      </section>

      {/* Story */}
      <section className="py-24">
        <AnimatedSection className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center" animationType="unveil" delay={0.05}>
          <div>
            {(() => {
              const [isExpanded, setIsExpanded] = React.useState(false);
              const fullContent = (
                <div>
                  <span className="text-green-600 font-bold tracking-widest uppercase text-sm mb-4 block">
                    Our Story
                  </span>
                  <h2 className="text-4xl font-bold mb-6">
                    Pioneering Aerial Intelligence in Sierra Leone
                  </h2>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    Agro Aerial Precision was founded by Sylvester Abu Gbamoi in
                    2023 to bridge the gap between traditional farming practices
                    and the rapidly evolving digital age. We saw a future where
                    farmers could make faster, smarter, and more informed
                    decisions powered by technology rather than burdened by
                    guesswork.
                  </p>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    Our journey began with a simple but powerful realization:
                    drone technology has the potential to solve some of the most
                    pressing challenges in modern agriculture. From pest
                    outbreaks to inefficient resource use, we recognized that
                    many of these issues could be minimized or even prevented
                    through precise, data-driven insights.
                  </p>
                  {isExpanded && (
                    <>
                      <p className="text-slate-600 mb-6 leading-relaxed">
                        The inspiration to start Agro Aerial Precision came from
                        witnessing firsthand the struggles farmers face every
                        day:
                      </p>
                      <ul className="text-slate-600 mb-4 leading-relaxed space-y-2 ml-4">
                        <li className="flex items-start">
                          <i className="ri-checkbox-circle-fill text-green-500 mr-3"></i>
                          <span>
                            Inefficient and time-consuming crop monitoring
                          </span>
                        </li>
                        <li className="flex items-start">
                          <i className="ri-checkbox-circle-fill text-green-500 mr-3"></i>
                          <span>Rising labor costs</span>
                        </li>
                        <li className="flex items-start">
                          <i className="ri-checkbox-circle-fill text-green-500 mr-3"></i>
                          <span>
                            Excessive and often harmful chemical application
                          </span>
                        </li>
                        <li className="flex items-start">
                          <i className="ri-checkbox-circle-fill text-green-500 mr-3"></i>
                          <span>
                            Lack of reliable data for timely decision-making
                          </span>
                        </li>
                      </ul>
                      <p className="text-slate-600 mb-4 leading-relaxed">
                        Through my work with drone technology at SKT Live and
                        Charis UAS, I saw how powerful these tools could be in
                        transforming agriculture and rural development. I
                        realized there was an opportunity to introduce smarter,
                        safer, and more sustainable farming and data collection
                        solutions in Sierra Leone, solutions that could improve
                        yields, reduce waste, save costs, and support the
                        long-term health of farming communities. This vision led
                        to the creation of Agro Aerial Precision, a company
                        dedicated to using drones, artificial intelligence, and
                        advanced data analytics to empower farmers across our
                        region and beyond. We believe technology should uplift
                        communities, enhance food production, and make farming
                        more efficient and environmentally friendly.
                      </p>
                      <h2 className="text-2xl font-bold mb-2">
                        Our mission is simple:{" "}
                      </h2>
                      <p className="text-slate-600 mb-8 leading-relaxed">
                        To drive modern agricultural development by delivering
                        precision-driven, cost-effective, and sustainable
                        solutions that support farmers and strengthen local food
                        systems. At Agro Aerial Precision, we are committed to
                        shaping the future of agriculture one field, one flight,
                        and one dataset at a time. Let's grow smarter, together.
                      </p>
                    </>
                  )}
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-green-600 font-semibold hover:text-green-700 transition-colors"
                  >
                    {isExpanded ? "Read Less" : "Read More"}
                  </button>
                </div>
              );
              return fullContent;
            })()}

            <div className="mt-12 grid grid-cols-3 gap-8">
              <div className="p-6 bg-lime-200 rounded-2xl">
                <h3 className="text-3xl font-bold text-green-600 mb-1">500+</h3>
                <p className="text-sm font-semibold text-slate-500">
                  Farmers Helped
                </p>
              </div>
              <div className="p-6 bg-lime-200 rounded-2xl">
                <h3 className="text-3xl font-bold text-green-600 mb-1">10k+</h3>
                <p className="text-sm font-semibold text-slate-500">
                  Hectares Mapped
                </p>
              </div>
              <div className="p-6 bg-lime-200 rounded-2xl">
                <h3 className="text-3xl font-bold text-green-600 mb-1">100+</h3>
                <p className="text-sm font-semibold text-slate-500">
                  Student Trained
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <img
              src="public/about (1).jpg"
              alt="Field Work"
              className="rounded-3xl h-full object-cover"
            />
            <div className="flex flex-col gap-4">
              <img
                src="public/mmap.jpeg"
                alt="Drone Prep"
                className="rounded-3xl aspect-square object-cover"
              />
              <img
                src="public/about (3).jpg"
                alt="Data Analysis"
                className="rounded-3xl aspect-square object-cover"
              />
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* Vision & Mission */}
      <section className="py-24 bg-lime-200">
        <AnimatedSection className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12" animationType="unveil-left" delay={0.05}>
          <div className="bg-white p-12 rounded-3xl shadow-sm">
            <div className="w-16  h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-3xl mb-8">
              <i className="ri-eye-line"></i>
            </div>
            <h3 className="text-3xl font-bold mb-6">Our Vision</h3>
            <p className="text-slate-600 leading-relaxed text-lg">
              To be the leading provider of precision aerial intelligence in
              Africa, empowering communities through technology that promotes
              economic growth and environmental sustainability.
            </p>
          </div>
          <div className="bg-white p-12 rounded-3xl shadow-sm">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-3xl mb-8">
              <i className="ri-flashlight-line"></i>
            </div>
            <h3 className="text-3xl font-bold mb-6">Our Mission</h3>
            <p className="text-slate-600 leading-relaxed text-lg">
              To deliver actionable insights and precise aerial solutions that
              optimize resources, increase productivity, and solve complex
              operational challenges across industries.
            </p>
          </div>
        </AnimatedSection>
      </section>

      {/* Management Team */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Meet Our Management</h2>
          <p className="text-slate-500 mb-16 max-w-2xl mx-auto">
            Dedicated professionals who bring a wealth of experience and
            expertise to drive our mission forward.
          </p>
          <AnimatedSection className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8" animationType="unveil" delay={0.1}>
            {TEAM.map((member) => (
              <div
                key={member.name}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-green-200 hover:-translate-y-2 group"
              >
                {/* Image Container */}
                <div className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-green-50 to-lime-50">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                {/* Content Container */}
                <div className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-green-600 font-semibold text-xs sm:text-sm mb-4">
                    {member.role}
                  </p>

                  {/* Social Links */}
                  <div className="flex gap-2 sm:gap-3">
                    {Object.entries(member.socials).map(([platform, link]) => (
                      <a
                        key={platform}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 sm:w-9 h-8 sm:h-9 rounded-lg bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-colors duration-300"
                      >
                        <i
                          className={`ri-${platform}-fill text-sm sm:text-base`}
                        ></i>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default About;
