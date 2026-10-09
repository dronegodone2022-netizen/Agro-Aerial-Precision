import React from 'react';
import { Link, useParams } from 'react-router-dom';
import AnimatedSection from '../components/AnimatedSection';
import { TEAM } from '../constants';

const SOCIAL_LABELS: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  twitter: 'X (Twitter)',
  tiktok: 'TikTok',
};

const TeamMember: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const member = TEAM.find((m) => m.slug === slug);

  if (!member) {
    return (
      <div className="min-h-[70vh] px-4 pt-32 text-center">
        <h1 className="text-3xl font-bold text-green-900">Team member not found</h1>
        <Link to="/about" className="mt-6 inline-block rounded-full bg-green-800 px-6 py-3 font-bold text-white hover:bg-lime-700">
          Meet our team
        </Link>
      </div>
    );
  }

  const otherMembers = TEAM.filter((m) => m.slug !== member.slug);

  return (
    <div className="bg-slate-50 pb-16">
      {/* Header */}
      <section className="bg-green-950 pt-28 pb-12 text-white">
        <AnimatedSection className="container mx-auto px-4" animationType="unveil" delay={0.05}>
          <Link to="/about" className="text-sm font-semibold text-lime-300 hover:underline">← Our team</Link>
          <div className="mt-6 flex flex-col items-center gap-8 md:flex-row md:items-end">
            <img
              src={member.image}
              alt={member.name}
              className="h-48 w-48 shrink-0 rounded-3xl object-cover shadow-2xl ring-4 ring-lime-500/40 sm:h-56 sm:w-56"
            />
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl">{member.name}</h1>
              <p className="mt-2 text-lg font-semibold text-lime-400">{member.role}, Agro Aerial Precision</p>
              {member.currentPosition && <p className="mt-1 text-slate-300">{member.currentPosition}</p>}
              {Object.keys(member.socials).length > 0 && (
                <div className="mt-5 flex justify-center gap-3 md:justify-start">
                  {Object.entries(member.socials).map(([platform, link]) => (
                    <a
                      key={platform}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name} on ${SOCIAL_LABELS[platform] || platform}`}
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-lg hover:bg-lime-500 hover:text-green-950 transition-colors"
                    >
                      <i className={`ri-${platform}-fill`} aria-hidden="true"></i>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </AnimatedSection>
      </section>

      <div className="container mx-auto max-w-5xl space-y-8 px-4 pt-10">
        <section className="rounded-2xl bg-white p-6 shadow-md sm:p-8">
          <h2 className="mb-4 text-2xl font-bold text-green-900">Professional background</h2>
          <div className="space-y-4 text-lg leading-relaxed text-slate-700">
            {member.bio.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </section>

        {member.specializations && member.specializations.length > 0 && (
          <section className="rounded-2xl bg-white p-6 shadow-md sm:p-8">
            <h2 className="mb-6 text-2xl font-bold text-green-900">Areas of specialisation</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {member.specializations.map((item) => (
                <div key={item.title} className="rounded-xl border border-lime-200 bg-lime-50/60 p-5">
                  <h3 className="flex items-start gap-2 font-bold text-green-900">
                    <i className="ri-checkbox-circle-fill mt-0.5 text-lime-600" aria-hidden="true"></i>
                    {item.title}
                  </h3>
                  <p className="mt-2 text-slate-600">{item.detail}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {member.qualifications && member.qualifications.length > 0 && (
          <section className="rounded-2xl bg-white p-6 shadow-md sm:p-8">
            <h2 className="mb-4 text-2xl font-bold text-green-900">Qualifications</h2>
            <ul className="space-y-3">
              {member.qualifications.map((item) => (
                <li key={item} className="flex items-start gap-3 text-lg text-slate-700">
                  <i className="ri-award-fill mt-0.5 text-lime-600" aria-hidden="true"></i>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {member.expertise && member.expertise.length > 0 && (
          <section className="rounded-2xl bg-white p-6 shadow-md sm:p-8">
            <h2 className="mb-4 text-2xl font-bold text-green-900">Expertise</h2>
            <div className="flex flex-wrap gap-2">
              {member.expertise.map((item) => (
                <span key={item} className="rounded-full bg-lime-100 px-4 py-2 text-sm font-semibold text-green-900">{item}</span>
              ))}
            </div>
          </section>
        )}

        {otherMembers.length > 0 && (
          <section>
            <h2 className="mb-4 text-2xl font-bold text-green-900">Meet the rest of the team</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {otherMembers.map((other) => (
                <Link
                  key={other.slug}
                  to={`/team/${other.slug}`}
                  className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-md transition-shadow hover:shadow-xl"
                >
                  <img loading="lazy" src={other.image} alt="" className="h-16 w-16 rounded-xl object-cover" />
                  <div>
                    <p className="font-bold text-slate-900">{other.name}</p>
                    <p className="text-sm font-semibold text-green-800">{other.role}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default TeamMember;
