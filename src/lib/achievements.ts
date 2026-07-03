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
};
