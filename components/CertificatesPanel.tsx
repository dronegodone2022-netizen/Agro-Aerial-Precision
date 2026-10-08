import React, { useEffect, useMemo, useState } from 'react';
import {
  adminDeleteCertificate,
  adminListCertificates,
  adminListStudents,
  adminSaveCertificate,
  deleteCertificateFile,
  getErrorMessage,
  uploadCertificateFile,
  type AdminCertificate,
  type AdminStudent,
} from '../src/examApi';
import { certificateQrDataUrl, certificateVerifyUrl } from '../src/certificateQr';

// Course titles offered on the Academy page (suggestions only - any course name is allowed)
const ACADEMY_COURSES = [
  'Basic Drone Training for Multimedia Production Certification',
  'Drone For Precision Aerial Spraying Certification',
  'Drone For Aerial Mapping & Survey Certification',
  'Drone Data Processing & Analysis Certification',
];

const STOP_WORDS = new Set(['for', 'and', 'of', 'the', 'in', 'to', 'with', 'certification', 'certificate', 'course', 'training']);

/** "Drone For Aerial Mapping & Survey Certification" -> "DAMS" */
const courseCode = (course: string) =>
  course
    .split(/[^A-Za-z]+/)
    .filter((word) => word && !STOP_WORDS.has(word.toLowerCase()))
    .map((word) => word[0].toUpperCase())
    .join('')
    .slice(0, 4) || 'GEN';

/** "Kallie Balla Koroma" -> "KABA" */
const nameInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.replace(/[^A-Za-z]/g, '').slice(0, 2))
    .join('')
    .toUpperCase() || 'XX';

const nextCertificateNumber = (certificates: AdminCertificate[]) => {
  const highest = certificates.reduce((max, c) => {
    const match = c.id.match(/-(\d+)$/);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return String(highest + 1).padStart(4, '0');
};

const today = () => new Date().toISOString().slice(0, 10);

interface FormState {
  id: string;
  name: string;
  course: string;
  issuedOn: string;
  link: string;
  studentId: string;
}

const emptyForm = (): FormState => ({ id: '', name: '', course: '', issuedOn: today(), link: '', studentId: '' });

const inputClass = 'mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:border-green-700 focus:outline-none';
const labelClass = 'block text-sm font-semibold text-slate-700';
const buttonClass = 'rounded-lg px-4 py-2 font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60';

const CertificatesPanel: React.FC = () => {
  const [certificates, setCertificates] = useState<AdminCertificate[]>([]);
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'closed' | 'new' | 'edit'>('closed');
  const [form, setForm] = useState<FormState>(emptyForm);
  const [originalLink, setOriginalLink] = useState('');
  const [idEdited, setIdEdited] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [search, setSearch] = useState('');
  const [qr, setQr] = useState<{ certificate: AdminCertificate; dataUrl: string; justSaved: boolean } | null>(null);

  const load = async () => {
    try {
      const [certificateList, studentList] = await Promise.all([adminListCertificates(), adminListStudents()]);
      setCertificates(certificateList);
      setStudents(studentList);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const courseSuggestions = useMemo(
    () => Array.from(new Set([...ACADEMY_COURSES, ...certificates.map((c) => c.course)])).sort(),
    [certificates]
  );

  const suggestedId = (state: FormState) =>
    `AAPA-${courseCode(state.course)}_${nameInitials(state.name)}${(state.issuedOn || today()).slice(2, 4)}-${nextCertificateNumber(certificates)}`;

  // Keep the suggested ID in sync with name/course/date until the admin types their own
  const updateForm = (changes: Partial<FormState>) => {
    setForm((current) => {
      const next = { ...current, ...changes };
      if (mode === 'new' && !idEdited && !('id' in changes)) {
        next.id = next.name && next.course ? suggestedId(next) : '';
      }
      return next;
    });
  };

  const openNew = () => {
    setForm(emptyForm());
    setOriginalLink('');
    setIdEdited(false);
    setFile(null);
    setError('');
    setQr(null);
    setMode('new');
  };

  const openEdit = (certificate: AdminCertificate) => {
    setForm({
      id: certificate.id,
      name: certificate.name,
      course: certificate.course,
      issuedOn: certificate.issuedOn,
      link: certificate.link,
      studentId: certificate.studentId || '',
    });
    setOriginalLink(certificate.link);
    setFile(null);
    setError('');
    setQr(null);
    setMode('edit');
  };

  const handleStudentChange = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    updateForm(student ? { studentId, name: student.name } : { studentId });
  };

  const showQr = async (certificate: AdminCertificate, justSaved = false) => {
    setQr({ certificate, dataUrl: await certificateQrDataUrl(certificate.id), justSaved });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.id.trim() || !form.name.trim() || !form.course.trim()) {
      setError('Certificate ID, name and course are required.');
      return;
    }
    if (mode === 'new' && !file && !form.link.trim()) {
      setError('Upload the certificate file, or paste a link to it.');
      return;
    }

    setBusy(true);
    let uploadedLink = '';
    try {
      if (file) {
        uploadedLink = await uploadCertificateFile(file, form.id);
      }

      const saved = await adminSaveCertificate({ ...form, link: uploadedLink || form.link }, mode === 'new');

      // A replaced upload is no longer needed
      if (uploadedLink && originalLink && originalLink !== uploadedLink) {
        await deleteCertificateFile(originalLink).catch(() => undefined);
      }

      setMode('closed');
      await load();
      await showQr(saved, true);
    } catch (err) {
      // Don't leave an orphaned file behind if saving the record failed
      if (uploadedLink) await deleteCertificateFile(uploadedLink).catch(() => undefined);
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (certificate: AdminCertificate) => {
    if (!window.confirm(`Delete certificate ${certificate.id} for ${certificate.name}? Its QR code will stop verifying.`)) return;

    setBusy(true);
    setError('');
    try {
      await adminDeleteCertificate(certificate.id);
      await deleteCertificateFile(certificate.link).catch(() => undefined);
      if (qr?.certificate.id === certificate.id) setQr(null);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const visibleCertificates = certificates.filter((c) =>
    `${c.id} ${c.name} ${c.course}`.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-green-900">Certificates ({certificates.length})</h2>
        {mode === 'closed' && (
          <button type="button" onClick={openNew} className={`${buttonClass} bg-green-700 text-white hover:bg-green-800`}>
            + Add certificate
          </button>
        )}
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {qr && (
        <div className="flex flex-col gap-4 rounded-xl border border-green-300 bg-green-50 p-4 sm:flex-row sm:items-center">
          <img src={qr.dataUrl} alt={`QR code for certificate ${qr.certificate.id}`} className="h-40 w-40 self-center rounded bg-white" />
          <div className="min-w-0 flex-1 space-y-2 text-sm">
            {qr.justSaved && <p className="font-bold text-green-800">Certificate saved.</p>}
            <p><strong>{qr.certificate.name}</strong> - {qr.certificate.course}</p>
            <p className="font-mono">{qr.certificate.id}</p>
            <p className="break-all">
              Verifies at:{' '}
              <a href={certificateVerifyUrl(qr.certificate.id)} target="_blank" rel="noopener noreferrer" className="text-green-700 underline">
                {certificateVerifyUrl(qr.certificate.id)}
              </a>
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <a href={qr.dataUrl} download={`certificate-qr-${qr.certificate.id}.png`} className={`${buttonClass} bg-green-700 text-white hover:bg-green-800`}>
                Download QR code
              </a>
              <button type="button" onClick={() => setQr(null)} className={`${buttonClass} border border-slate-300 text-slate-700`}>Close</button>
            </div>
          </div>
        </div>
      )}

      {mode !== 'closed' && (
        <form onSubmit={handleSave} className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-lg font-bold text-slate-800">{mode === 'new' ? 'New certificate' : `Edit ${form.id}`}</h3>

          <label className={labelClass}>
            Student account (optional)
            <select value={form.studentId} onChange={(e) => handleStudentChange(e.target.value)} className={inputClass}>
              <option value="">- Not linked to a student account -</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.id}){student.passedExam ? ' - passed exam' : ''}{student.hasCertificate ? ' - has certificate' : ''}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              Name on certificate
              <input value={form.name} onChange={(e) => updateForm({ name: e.target.value })} required maxLength={200} className={inputClass} />
            </label>
            <label className={labelClass}>
              Issue date
              <input type="date" value={form.issuedOn} onChange={(e) => updateForm({ issuedOn: e.target.value })} className={inputClass} />
            </label>
          </div>

          <label className={labelClass}>
            Course
            <input value={form.course} onChange={(e) => updateForm({ course: e.target.value })} list="certificate-courses" required maxLength={200} className={inputClass} />
            <datalist id="certificate-courses">
              {courseSuggestions.map((course) => <option key={course} value={course} />)}
            </datalist>
          </label>

          <label className={labelClass}>
            Certificate ID
            <input
              value={form.id}
              onChange={(e) => {
                setIdEdited(true);
                setForm((current) => ({ ...current, id: e.target.value.toUpperCase() }));
              }}
              disabled={mode === 'edit'}
              required
              maxLength={64}
              placeholder="Filled in automatically from the name and course"
              className={`${inputClass} font-mono disabled:bg-slate-100`}
            />
            {mode === 'new' && (
              <span className="mt-1 block text-xs font-normal text-slate-500">
                Suggested automatically - you can change it. Letters, numbers, "-", "_" and "." only.
              </span>
            )}
          </label>

          <label className={labelClass}>
            {mode === 'edit' ? 'Replace certificate file (optional)' : 'Certificate file (PDF, JPG or PNG, max 10 MB)'}
            <input
              type="file"
              accept="application/pdf,image/jpeg,image/png"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mt-1 block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-green-700 file:px-4 file:py-2 file:font-semibold file:text-white"
            />
          </label>

          {!file && (
            <label className={labelClass}>
              {mode === 'edit' ? 'Certificate link' : '...or paste a link instead (e.g. Google Drive)'}
              <input type="url" value={form.link} onChange={(e) => updateForm({ link: e.target.value })} placeholder="https://" className={inputClass} />
            </label>
          )}

          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={busy} className={`${buttonClass} bg-green-700 text-white hover:bg-green-800`}>
              {busy ? (file ? 'Uploading...' : 'Saving...') : mode === 'new' ? 'Save certificate' : 'Save changes'}
            </button>
            <button type="button" onClick={() => setMode('closed')} disabled={busy} className={`${buttonClass} border border-slate-300 text-slate-700`}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-slate-500">Loading certificates...</p>
      ) : certificates.length === 0 ? (
        <p className="text-slate-500">No certificates yet.</p>
      ) : (
        <>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by ID, name or course" className={inputClass} />
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-slate-700">
                  <th className="border-b p-2">Certificate</th>
                  <th className="border-b p-2">Course</th>
                  <th className="border-b p-2">Issued</th>
                  <th className="border-b p-2"></th>
                </tr>
              </thead>
              <tbody>
                {visibleCertificates.map((certificate) => (
                  <tr key={certificate.id} className="align-top">
                    <td className="border-b p-2">
                      <strong>{certificate.name}</strong>
                      <br />
                      <span className="font-mono text-xs text-slate-500">{certificate.id}</span>
                    </td>
                    <td className="border-b p-2">{certificate.course}</td>
                    <td className="border-b p-2 whitespace-nowrap">{certificate.issuedOn || '-'}</td>
                    <td className="border-b p-2 text-right whitespace-nowrap">
                      {certificate.link && (
                        <a href={certificate.link} target="_blank" rel="noopener noreferrer" className="mr-3 font-semibold text-green-700 hover:underline">File</a>
                      )}
                      <button type="button" onClick={() => showQr(certificate)} className="mr-3 font-semibold text-green-700 hover:underline">QR</button>
                      <button type="button" onClick={() => openEdit(certificate)} disabled={busy} className="mr-3 font-semibold text-slate-700 hover:underline">Edit</button>
                      <button type="button" onClick={() => handleDelete(certificate)} disabled={busy} className="font-semibold text-red-700 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default CertificatesPanel;
