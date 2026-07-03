"use client";

import Landing from "./Landing";
import Hud from "./Hud";
import About from "./sections/About";
import Skills from "./sections/Skills";
import Projects from "./sections/Projects";
import Timeline from "./sections/Timeline";
import Resume from "./sections/Resume";
import Contact from "./sections/Contact";
import ProjectDossier from "./ProjectDossier";
import Achievements from "./Achievements";
import MusicController from "./MusicController";

export default function Overlay() {
  return (
    <>
      <Landing />
      <Hud />
      <About />
      <Skills />
      <Projects />
      <Timeline />
      <Resume />
      <Contact />
      <ProjectDossier />
      <Achievements />
      <MusicController />
    </>
  );
}
