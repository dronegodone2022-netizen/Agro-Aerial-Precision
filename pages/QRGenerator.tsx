import { useState } from "react";
import QRCode from "qrcode";

export default function QRGenerator() {
  const [id, setId] = useState("");
  const [qr, setQR] = useState("");
  const [verificationUrl, setVerificationUrl] = useState("");

  const generate = async () => {
    const certificateId = id.trim().toUpperCase();
    if (!certificateId) return;
    // origin + pathname keeps the GitHub Pages base path (/Agro-Aerial-Precision/)
    const url = `${window.location.origin}${window.location.pathname}#/verify/${encodeURIComponent(certificateId)}`;
    setVerificationUrl(url);
    setQR(await QRCode.toDataURL(url, { width: 512, margin: 2 }));
  };

  return (
    <div className="p-6 pt-28 max-w-xl mx-auto">
      <h1 className="text-xl font-bold">Generate Certificate QR</h1>
      <p className="text-sm text-slate-600 mt-2">
        Add the certificate to the Supabase <code>certificates</code> table first, then print this QR code on it.
      </p>

      <label htmlFor="cert-id" className="block text-sm font-medium mt-4">
        Certificate ID
      </label>
      <input
        id="cert-id"
        className="border p-2 rounded mt-2 w-full"
        placeholder="Enter certificate ID"
        value={id}
        onChange={(e) => setId(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && generate()}
      />

      <button
        type="button"
        onClick={generate}
        className="block mt-3 bg-lime-600 text-white p-2 rounded hover:bg-lime-700"
      >
        Generate QR
      </button>

      {qr && (
        <div className="mt-4">
          <img src={qr} alt={`QR code for certificate ${id.trim().toUpperCase()}`} className="w-48 h-48" />

          <p className="text-sm mt-3 break-all">
            Links to:{" "}
            <a href={verificationUrl} target="_blank" rel="noopener noreferrer" className="text-green-700 underline">
              {verificationUrl}
            </a>
          </p>

          <a
            href={qr}
            download={`certificate-qr-${id.trim().toUpperCase()}.png`}
            className="inline-block mt-3 bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
          >
            Download PNG
          </a>
        </div>
      )}
    </div>
  );
}
