import { useState } from "react";
import QRCode from "qrcode";

export default function QRGenerator() {
  const [id, setId] = useState("");
  const [qr, setQR] = useState("");

  const generate = async () => {
    if (!id.trim()) return;
    const verificationUrl = `${window.location.origin}/#/verify/${encodeURIComponent(
      id.trim().toUpperCase()
    )}`;
    const qrCode = await QRCode.toDataURL(verificationUrl);
    setQR(qrCode);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Generate Certificate QR</h1>

      <label htmlFor="cert-id" className="block text-sm font-medium mt-4">
        Certificate ID
      </label>
      <input
        id="cert-id"
        className="border p-2 rounded mt-2 w-full"
        placeholder="Enter certificate ID"
        onChange={(e) => setId(e.target.value)}
        title="Enter the certificate ID to generate QR code"
      />

      <button
        type="button"
        onClick={generate}
        className="block mt-3 bg-lime-600 text-white p-2 rounded hover:bg-lime-700"
        title="Generate QR code for the certificate ID"
      >
        Generate QR
      </button>

      {qr && (
        <div className="mt-4">
          <img 
            src={qr} 
            alt={`QR code for certificate ${id}`}
            className="w-40 h-40" 
            title={`QR code for certificate ${id}`}
          />

          <label htmlFor="json-output" className="block text-sm font-medium mt-4">
            Copy this into Google Sheets:
          </label>

          <textarea
            id="json-output"
            className="w-full border p-2 rounded mt-2"
            rows={6}
            value={`{"id":"${id}","qr":"${qr}"}`}
            readOnly
            title="JSON data for Google Sheets import"
          />
        </div>
      )}
    </div>
  );
}