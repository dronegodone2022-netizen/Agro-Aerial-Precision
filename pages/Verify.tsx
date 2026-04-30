import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchCertificates } from "../src/data/useCertificates";

export default function Verify() {
  const { id: routeId } = useParams();
  const [id, setId] = useState(routeId || "");
  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState<any>(null);

  const searchCertificate = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    const normalized = query.toUpperCase();
    try {
      const data: any = await fetchCertificates();
      const match = (data || []).find(
        (c: any) => c.id?.toUpperCase() === normalized
      );
      setCertificate(match || null);
    } catch (error) {
      console.error("Certificate verification failed", error);
      setCertificate(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (routeId) {
      setId(routeId);
      searchCertificate(routeId);
    }
  }, [routeId]);

  const handleSearch = () => {
    if (!id.trim()) return;
    searchCertificate(id);
  };

  return (
    <div className="min-h-screen bg-lime-800 p-4 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">AAP Academy Certificate Verification</h1>
      <p className="text-slate-600">Enter your certificate ID to verify its authenticity.</p>

      <input
        className="border p-2 rounded w-80"
        placeholder="Enter Certificate ID (e.g. AAP-001)"
        value={id}
        onChange={(e) => setId(e.target.value)}
      />

      <button
        className="mt-3 bg-lime-600 text-white py-2 px-4 rounded"
        onClick={handleSearch}
      >
        Verify
      </button>

      {loading && <p className="mt-4">Checking…</p>}

      {certificate && (
        <div className="mt-6 border p-4 rounded w-96 bg-green-50">
          <h2 className="text-xl font-semibold">Certificate Verified ✔</h2>
          <p><b>ID:</b> {certificate.id}</p>
          <p><b>Name:</b> {certificate.name}</p>
          <p><b>Course:</b> {certificate.course}</p>
          <p><b>Issued:</b> {certificate.issued_on}</p>

          <a
            href={certificate.drive_link}
            target="_blank"
            className="block mt-3 text-green-700 underline"
          >
            View Certificate
          </a>

          {certificate.qr && (
            <img src={certificate.qr} alt="QR" className="mt-4 w-40 h-40" />
          )}
        </div>
      )}

      {certificate === null && !loading && id && (
        <p className="mt-6 text-red-600">Certificate Not Found ❌ </p>
      )}
    </div>
  );
}