import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { verifyCertificate, type Certificate } from "../src/data/certificates";
import CertificateResult from "../components/CertificateResult";

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
    <div className="min-h-screen bg-slate-50 pb-16">
      <section className="bg-green-950 px-4 pt-32 pb-12 text-center text-white">
        <h1 className="text-3xl font-bold sm:text-4xl">Certificate Verification</h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-300">
          Check that an Agro Aerial Precision Academy certificate is genuine. Scan the QR code on the certificate, or enter its ID below.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="mx-auto mt-6 flex max-w-xl flex-col gap-3 sm:flex-row"
        >
          <label htmlFor="verify-id" className="sr-only">Certificate ID</label>
          <input
            id="verify-id"
            className="flex-1 rounded-xl border-0 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-lime-500/50"
            placeholder="Certificate ID, e.g. AAPA-DAMS_KABA26-0001"
            value={id}
            onChange={(e) => {
              setId(e.target.value);
              setHasSearched(false);
            }}
          />
          <button type="submit" disabled={loading} className="rounded-xl bg-lime-500 px-6 py-3 font-bold text-slate-900 hover:bg-lime-400 disabled:opacity-60">
            {loading ? 'Checking...' : 'Verify'}
          </button>
        </form>
      </section>

      <div className="mx-auto mt-8 max-w-2xl px-4">
        {certificate && <CertificateResult certificate={certificate} />}

        {lookupError && !loading && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-800">
            We couldn't check this certificate right now. Please check your connection and try again.
          </div>
        )}

        {certificate === null && !loading && hasSearched && !lookupError && (
          <div className="rounded-xl border-2 border-red-300 bg-red-50 p-5 text-red-800">
            <p className="flex items-center gap-2 text-lg font-bold">
              <i className="ri-close-circle-fill" aria-hidden="true"></i> No certificate found
            </p>
            <p className="mt-1 text-sm">
              No Agro Aerial Precision certificate matches this ID. Check the ID and try again, or contact us on WhatsApp at +232 77 840 105.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}