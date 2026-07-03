import type { Metadata } from "next";
import profile from "../../data/profile.json";
import resumeData from "../../data/resume.json";
import timelineData from "../../data/timeline.json";
import skillsData from "../../data/skills.json";
import PrintButton from "./PrintButton";
import WarpEntry from "./WarpEntry";

export const metadata: Metadata = {
  title: "Resume — Vishnu Priyaan Chellappa",
  description:
    "Resume of Vishnu Priyaan Chellappa, Infrastructure & ITSM Solutions Architect.",
  robots: { index: false },
};

/**
 * Print-optimised resume. "Download" on the main experience opens this
 * route; the browser's print dialog produces the PDF — always current,
 * no binary asset to keep in sync.
 */
export default function ResumePage() {
  return (
    <>
      <WarpEntry />
      <main className="min-h-screen bg-white px-8 py-12 text-[#0b1226] md:px-16">
      <div className="mx-auto max-w-3xl">
        <div className="no-print mb-8 flex justify-end">
          <PrintButton />
        </div>

        <header className="border-b-2 border-[#0b1226] pb-6">
          <h1 className="font-display text-4xl font-bold tracking-tight">
            {profile.fullName}
          </h1>
          <p className="mt-2 text-lg text-[#3d4668]">{profile.role}</p>
          <p className="mt-3 font-mono text-xs text-[#3d4668]">
            {profile.location} · {profile.email} · {profile.linkedin} · {profile.github}
          </p>
        </header>

        <section className="mt-8">
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-[#5b3bbd]">
            Summary
          </h2>
          <p className="mt-3 text-sm leading-relaxed">{resumeData.summary}</p>
        </section>

        <section className="mt-8">
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-[#5b3bbd]">
            Selected achievements
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
            {resumeData.highlights.map((h) => (
              <li key={h.slice(0, 24)}>{h}</li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-[#5b3bbd]">
            Experience
          </h2>
          {[...timelineData.entries].reverse().map((entry) => (
            <div key={entry.id} className="mt-5">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-base font-semibold">{entry.role}</h3>
                <span className="shrink-0 font-mono text-xs text-[#3d4668]">
                  {entry.period}
                </span>
              </div>
              <p className="text-sm text-[#3d4668]">{entry.company}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed">
                {entry.achievements.map((a) => (
                  <li key={a.slice(0, 24)}>{a}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="mt-8">
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-[#5b3bbd]">
            Skills
          </h2>
          <p className="mt-3 text-sm leading-relaxed">
            {skillsData.skills.map((s) => s.name).join(" · ")}
          </p>
        </section>

        <section className="mt-8">
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-[#5b3bbd]">
            Certifications
          </h2>
          <ul className="mt-3 grid gap-x-8 gap-y-1.5 text-sm sm:grid-cols-2">
            {resumeData.certifications.map((cert) => (
              <li key={cert.id}>
                {cert.name}{" "}
                <span className="text-[#3d4668]">
                  — {cert.issuer} ({cert.status})
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-[#5b3bbd]">
            Education & industry exposure
          </h2>
          <p className="mt-3 text-sm">
            {resumeData.education.degree} —{" "}
            <span className="text-[#3d4668]">{resumeData.education.school}</span>
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[#3d4668]">
            {resumeData.industries}
          </p>
        </section>
      </div>
    </main>
    </>
  );
}
