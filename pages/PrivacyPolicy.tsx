import React from "react";
import AnimatedSection from "../components/AnimatedSection";

export default function PrivacyPolicy() {
  return (
    <AnimatedSection className="px-12 py-28 max-w-4xl mx-auto text-gray-800 bg-gray-200" animationType="unveil" delay={0.05}>
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4">Last Updated: 04/01/2024</p>

      <p className="mb-6">
        This Privacy Policy describes how Agro Aerial Precision SL Ltd (“we”, “our”, or “us”) collects,
        uses, protects, and shares your information when you interact with our website, products, and
        drone-based services.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>

      <h3 className="text-xl font-semibold mt-4 mb-2">1.1 Personal Information</h3>
      <ul className="list-disc ml-6 mb-4">
        <li>Full name</li>
        <li>Contact information (email, phone number)</li>
        <li>Business or organization details</li>
        <li>Service inquiry details</li>
        <li>Project request information</li>
      </ul>

      <h3 className="text-xl font-semibold mt-4 mb-2">1.2 Drone & Survey Data</h3>
      <ul className="list-disc ml-6 mb-4">
        <li>Aerial photographs and videos</li>
        <li>LiDAR point cloud data</li>
        <li>GIS coordinates</li>
        <li>Crop health data and vegetation indices</li>
        <li>Terrain models and measurement data</li>
      </ul>

      <h3 className="text-xl font-semibold mt-4 mb-2">1.3 Automatically Collected Data</h3>
      <ul className="list-disc ml-6 mb-4">
        <li>IP address</li>
        <li>Browser type</li>
        <li>Device information</li>
        <li>Pages visited</li>
        <li>Time and duration of visits</li>
        <li>Referral sources</li>
      </ul>

      <h3 className="text-xl font-semibold mt-4 mb-2">1.4 Cookies & Tracking Technologies</h3>
      <p className="mb-6">Cookies may be used to improve functionality, store preferences, and analyze website analytics.</p>

      <h3 className="text-xl font-semibold mt-4 mb-2">1.5 Training Program Information</h3>
      <p className="mb-6">When you request or participate in our training programs, we collect related data for registration, scheduling, certification, and communication, including course preferences, attendance records, and feedback.</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
      <ul className="list-disc ml-6 mb-6">
        <li>Provide mapping, surveying, LiDAR, and analytics services</li>
        <li>Deliver precision agriculture reports and insights</li>
        <li>Conduct training programs, certifications, and skills development in drone surveying and precision agriculture</li>
        <li>Improve website functionality and service delivery</li>
        <li>Respond to inquiries and provide customer support</li>
        <li>Process service agreements and contracts</li>
        <li>Enhance security and prevent misuse</li>
        <li>Send updates or service-related notifications</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">3. Legal Basis for Processing</h2>
      <p className="mb-6">We process data based on consent, contractual obligations, legitimate interests, and legal compliance.</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">4. Sharing Your Information</h2>
      <p className="mb-6">
        We may share your information with trusted service providers, government authorities when required,
        project partners, or to protect our legal rights. All third parties must follow confidentiality
        and data protection standards.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">5. Drone Data Confidentiality</h2>
      <p className="mb-6">
        Drone-collected data is owned by the client unless stated otherwise. It is stored securely, never
        shared publicly without consent, and deleted or archived after the project as per agreement.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">6. Data Security</h2>
      <p className="mb-6">
        We use encrypted storage, secured servers, firewalls, and restricted access measures to protect
        information.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">7. Data Retention</h2>
      <p className="mb-6">
        We retain data only as long as necessary for service delivery, compliance, support, and auditing.
        Afterward, it is securely deleted or anonymized.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">8. Your Rights</h2>
      <ul className="list-disc ml-6 mb-6">
        <li>Access your data</li>
        <li>Request corrections</li>
        <li>Request deletion</li>
        <li>Withdraw consent</li>
        <li>Object to processing</li>
        <li>Request copies of project-related data</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">9. Third-Party Links</h2>
      <p className="mb-6">We are not responsible for the privacy policies of third‑party websites.</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">10. Children’s Privacy</h2>
      <p className="mb-6">Our services are not intended for individuals under 18, and we do not knowingly collect their data.</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">11. International Data Transfers</h2>
      <p className="mb-6">
        If you access our website from outside Sierra Leone, you acknowledge your data may be processed in
        countries with different data protection laws.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">12. Updates to This Policy</h2>
      <p className="mb-6">We may update this Privacy Policy periodically. Continued use of the site signifies acceptance.</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">13. Contact Us</h2>
      <p className="mb-6">
        Agro Aerial Precision SL Ltd<br />
        Email: info@aaprecision.llc<br />
        Phone: +232 77 840 105<br />
        Address: Koidu City, Kono District, Sierra Leone
      </p>
    </AnimatedSection>
  );
}
