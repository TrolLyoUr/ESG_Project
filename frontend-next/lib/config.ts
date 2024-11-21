export const SERVER_URL = "";

export const frameworkMapping: Record<number, string> = {
  1: "GRI",
  2: "SASB",
  3: "TCFD",
  4: "Default",
};

export type Framework = keyof typeof frameworkMapping;
