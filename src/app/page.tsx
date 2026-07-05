import Universe from "../components/Universe";
import profile from "../data/profile.json";
import skills from "../data/skills.json";
import projects from "../data/projects.json";

const siteUrl = "https://vishnu-priyan-portfolio.vercel.app";

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${siteUrl}/#person`,
  name: profile.fullName,
  alternateName: profile.name,
  url: siteUrl,
  image: `${siteUrl}/opengraph-image`,
  jobTitle: profile.role,
  description: profile.bio[0],
  email: `mailto:${profile.email}`,
  sameAs: [profile.linkedin, profile.github],
  knowsAbout: skills.skills.map((skill) => skill.name),
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bangalore / Mumbai",
    addressCountry: "IN",
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  url: siteUrl,
  name: "Vishnu Priyaan — The Architect's Universe",
  description:
    "An immersive portfolio experience for Vishnu Priyaan, Infrastructure and Enterprise Solution Architect.",
  inLanguage: "en",
  about: {
    "@id": `${siteUrl}/#person`,
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([personSchema, websiteSchema]),
        }}
      />
      <Universe />
      <section className="sr-only" aria-label="Website overview">
        <h1>{profile.headline}</h1>
        <p>
          {profile.fullName} is an {profile.role} specializing in ServiceNow,
          Flexera, IT asset management, cloud architecture, observability, and
          enterprise automation.
        </p>

        <section>
          <h2>About Vishnu Priyaan</h2>
          {profile.bio.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>

        <section>
          <h2>Core Specializations</h2>
          <ul>
            {profile.expertise.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2>Platform Skills</h2>
          <ul>
            {skills.skills.map((skill) => (
              <li key={skill.id}>
                {skill.name}: {skill.note}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2>Selected Enterprise Projects</h2>
          <ul>
            {projects.projects.map((project) => (
              <li key={project.id}>
                <strong>{project.title}</strong>: {project.tagline}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2>Outcomes</h2>
          <ul>
            {profile.outcomes.map((outcome) => (
              <li key={outcome}>{outcome}</li>
            ))}
          </ul>
        </section>
      </section>
    </>
  );
}
