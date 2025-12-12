import { data as dataEN } from "./about.en";
import { data as dataJA } from "./about.ja";
import type { Data } from "./about.ja";

export { Data };

export const getData = (locale: string | undefined): Data => {
  if (locale === "ja") {
    return dataJA;
  }
  return dataEN;
};
