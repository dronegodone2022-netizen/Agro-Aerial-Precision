import React from "react";
import AnimatedSection from "../components/AnimatedSection";

export default function TermsOfService() {
  return (
    <AnimatedSection className="px-6 pt-28 bg-gray-100 max-w-4xl mx-auto text-gray-800" animationType="unveil" delay={0.05}>
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="mb-4">Last Updated: 04/01/2024</p>

      <p className="mb-6">
        Welcome to the Agro Aerial Precision SL Ltd website. By accessing or using our website, products,
        and drone-based services, you agree to be bound by these Terms of Service. If you do not agree with
        any part of these terms, please discontinue use of our website and services.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
      <p className="mb-6">
        By using our website or contracting our services, you confirm that you have read and understood
        these Terms, are legally able to enter into binding agreements, and agree to comply with all
        applicable laws and regulations.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">2. Our Services</h2>
      <p className="mb-6">
        Agro Aerial Precision SL Ltd provides drone mapping, surveying, LiDAR data collection, precision
        agriculture solutions, GIS analysis, and urban planning services. All services are subject to
        availability, client agreements, and regulatory compliance.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">3. Client Responsibilities</h2>
      <p className="mb-6">
        Clients must provide accurate project details, ensure legal authorization for aerial data
        collection, avoid requesting unlawful services, and use delivered data responsibly. Failure to
        comply may result in service refusal or termination.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">4. Intellectual Property</h2>
      <p className="mb-6">
        Website content is owned by Agro Aerial Precision SL Ltd. Drone-generated data is owned by the
        client once full payment is received. Materials may not be copied or distributed without permission.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">5. Drone Flight Authorization & Compliance</h2>
      <p className="mb-6">
        Flights may be delayed or canceled due to weather, airspace restrictions, technical issues, or
        regulatory needs. We do not guarantee drone flight availability unless contractually agreed.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">6. Payments & Billing</h2>
      <p className="mb-6">
        Deposits may be required. Full payment is due upon data delivery. Late payments may lead to delays
        or withholding of deliverables. Fees will be clearly stated in invoices or agreements.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">7. Data Delivery & Turnaround Time</h2>
      <p className="mb-6">
        Delivery timelines depend on project size, processing complexity, and field conditions. Estimates
        will be communicated in advance.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">8. Limitation of Liability</h2>
      <p className="mb-6">
        We are not liable for losses due to client misuse, delays from external factors, or any indirect or
        consequential damages. Our total liability is limited to the amount paid for the service.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">9. Service Modifications</h2>
      <p className="mb-6">We may modify or discontinue any part of our website or services without prior notice.</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">10. Prohibited Uses</h2>
      <ul className="list-disc ml-6 mb-6">
        <li>Hacking, disrupting, or overloading our website</li>
        <li>Misusing aerial data for unlawful purposes</li>
        <li>Violating aviation or environmental laws</li>
        <li>Interfering with drone operations or personnel</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">11. Third-Party Links</h2>
      <p className="mb-6">We are not responsible for the content or security of third-party websites.</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">12. Termination</h2>
      <p className="mb-6">
        We may terminate access if you violate these terms, misuse provided data, or engage in unlawful
        activities. Termination does not remove outstanding payment obligations.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">13. Warranty Disclaimer</h2>
      <p className="mb-6">
        Our services and website are provided "as is" without warranties of accuracy, completeness, or
        uninterrupted availability. Drone data is subject to environmental and technical variability.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">14. Governing Law</h2>
      <p className="mb-6">These Terms are governed by the laws of Sierra Leone.</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">15. Changes to These Terms</h2>
      <p className="mb-6">We may update these Terms at any time. Continued use means acceptance of the updated version.</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">16. Contact Us</h2>
      <p className="mb-6">
        Agro Aerial Precision SL Ltd<br />
        Email: info@aaprecision.llc<br />
        Phone: +232 77 840 105<br />
        Address: Koidu City, Kono District, Sierra Leone
      </p>
    </AnimatedSection>
  );
}
