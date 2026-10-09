import { siteBaseUrl } from './supabase';

/** Public verification page for a certificate, e.g. https://www.agroaerialprecision.com/verify/AAPA-0001 */
export const certificateVerifyUrl = (certificateId: string) =>
  `${siteBaseUrl()}verify/${encodeURIComponent(certificateId.trim().toUpperCase())}`;

/** PNG data URL of a QR code pointing at the certificate's verification page. */
export const certificateQrDataUrl = async (certificateId: string) => {
  const { default: QRCode } = await import('qrcode');
  return QRCode.toDataURL(certificateVerifyUrl(certificateId), { width: 512, margin: 2 });
};
