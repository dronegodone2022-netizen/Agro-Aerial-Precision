import React, { useEffect, useState } from 'react';
import type { Certificate } from '../src/data/certificates';
import { certificateQrDataUrl, certificateVerifyUrl } from '../src/certificateQr';

const isImage = (url: string) => /\.(jpe?g|png)(\?|$)/i.test(url);

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};

/** Verified-certificate card shown on the Academy page and the /verify page. */
const CertificateResult: React.FC<{ certificate: Certificate }> = ({ certificate }) => {
  const [qr, setQr] = useState('');

  useEffect(() => {
    let cancelled = false;
    certificateQrDataUrl(certificate.id)
      .then((url) => !cancelled && setQr(url))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [certificate.id]);

  const link = certificate.drive_link?.trim();

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-green-600 bg-white text-left text-slate-800 shadow-lg">
      <div className="flex items-center gap-3 bg-green-700 px-5 py-3 text-white">
        <i className="ri-shield-check-fill text-2xl" aria-hidden="true"></i>
        <div>
          <p className="font-bold leading-tight">Certificate verified</p>
          <p className="text-xs text-green-100">Issued by Agro Aerial Precision Academy</p>
        </div>
      </div>

      <div className="flex flex-col gap-5 p-5 sm:flex-row">
        <dl className="flex-1 space-y-3 text-sm">
          <div>
            <dt className="text-slate-500">Awarded to</dt>
            <dd className="text-lg font-bold text-slate-900">{certificate.name}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Course</dt>
            <dd className="font-semibold">{certificate.course}</dd>
          </div>
          {certificate.issued_on && (
            <div>
              <dt className="text-slate-500">Date issued</dt>
              <dd className="font-semibold">{formatDate(certificate.issued_on)}</dd>
            </div>
          )}
          <div>
            <dt className="text-slate-500">Certificate ID</dt>
            <dd className="font-mono font-semibold break-all">{certificate.id}</dd>
          </div>
        </dl>

        <div className="flex flex-col items-center gap-2 sm:w-40">
          {qr ? (
            <img src={qr} alt={`QR code for certificate ${certificate.id}`} className="h-36 w-36 rounded-lg border border-slate-200" />
          ) : (
            <div className="h-36 w-36 animate-pulse rounded-lg bg-slate-100" aria-hidden="true" />
          )}
          <p className="text-center text-xs text-slate-500">Scan to verify</p>
          {qr && (
            <a href={qr} download={`certificate-qr-${certificate.id}.png`} className="text-xs font-semibold text-green-700 hover:underline">
              Download QR code
            </a>
          )}
        </div>
      </div>

      {link && isImage(link) && (
        <a href={link} target="_blank" rel="noopener noreferrer" className="block border-t border-slate-100 bg-slate-50 p-4">
          <img src={link} alt={`Certificate of ${certificate.name}`} loading="lazy" className="mx-auto max-h-80 rounded-lg shadow" />
        </a>
      )}

      <div className="flex flex-wrap gap-3 border-t border-slate-100 px-5 py-4">
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 font-semibold text-white hover:bg-green-800"
          >
            <i className="ri-file-text-line" aria-hidden="true"></i> View certificate
          </a>
        ) : (
          <p className="text-sm text-slate-500">The certificate file is not available online. The details above are confirmed by our records.</p>
        )}
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(certificateVerifyUrl(certificate.id))}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
        >
          <i className="ri-link" aria-hidden="true"></i> Copy verification link
        </button>
      </div>
    </div>
  );
};

export default CertificateResult;
