import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { verifyCertificate, type Certificate } from "../src/data/certificates";

export default function Verify() {
  const { id: routeId } = useParams();
  const [id, setId] = useState(routeId || "");
  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [lookupError, setLookupError] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const searchCertificate = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setLookupError(false);
    try {
      setCertificate(await verifyCertificate(query));
    } catch (error) {
      console.error("Certificate verification failed", error);
      setCertificate(null);
      setLookupError(true);
    } finally {
      setLoading(false);
      setHasSearched(true);
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
        onChange={(e) => {
          setId(e.target.value);
          setHasSearched(false);
        }}
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
            rel="noopener noreferrer"
            className="block mt-3 text-green-700 underline"
          >
            View Certificate
          </a>

        </div>
      )}

      {lookupError && !loading && (
        <p className="mt-6 text-amber-200">We couldn't check this certificate right now. Please check your connection and try again.</p>
      )}

      {certificate === null && !loading && hasSearched && !lookupError && (
        <p className="mt-6 text-red-600">Certificate Not Found ❌ </p>
      )}
    </div>
  );
}