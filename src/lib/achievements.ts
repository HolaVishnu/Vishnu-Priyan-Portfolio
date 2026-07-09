export interface AchievementDef {
  id: string;
  name: string;
  detail: string;
}

export const ACHIEVEMENTS: Record<string, AchievementDef> = {
  ignition: {
    id: "ignition",
    name: "Ignition",
    detail: "Journey initiated",
  },
  voyager: {
    id: "voyager",
    name: "Voyager",
    detail: "Reached the edge of the map",
  },
  codebreaker: {
    id: "codebreaker",
    name: "Codebreaker",
    detail: "Konami sequence accepted — warp drive engaged",
  },
  signal: {
    id: "signal",
    name: "Signal Sent",
    detail: "Transmission received at the Last Moon",
  },
  explorer: {
    id: "explorer",
    name: "Explorer",
    detail: "All six mission worlds visited",
  },
  docked_first: {
    id: "docked_first",
    name: "First Contact",
    detail: "Docked with a mission station for the first time",
  },
  cartographer: {
    id: "cartographer",
    name: "Cartographer",
    detail: "Every star in the skill constellation uncovered",
  },
};
