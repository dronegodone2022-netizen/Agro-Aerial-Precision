import { useState } from "react";
import { Link } from "react-router-dom";
import { certificateQrDataUrl, certificateVerifyUrl } from "../src/certificateQr";

export default function QRGenerator() {
  const [id, setId] = useState("");
  const [qr, setQR] = useState("");
  const [verificationUrl, setVerificationUrl] = useState("");

  const generate = async () => {
    const certificateId = id.trim().toUpperCase();
    if (!certificateId) return;
    setVerificationUrl(certificateVerifyUrl(certificateId));
    setQR(await certificateQrDataUrl(certificateId));
  };

  return (
    <div className="p-6 pt-28 max-w-xl mx-auto">
      <h1 className="text-xl font-bold">Generate Certificate QR</h1>
      <p className="text-sm text-slate-600 mt-2">
        Admins: the easiest way to add a certificate is the <Link to="/admin" className="text-green-700 underline">Exam Admin</Link> page
        (Certificates tab), which uploads the file and creates the QR code for you. Use this page to re-make a QR code for an existing certificate ID.
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
