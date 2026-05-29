import type { Iplik } from "./types";

export function yeniIplik(defaults: Partial<Iplik> = {}): Iplik {
  return {
    id: Date.now() + Math.random(),
    tip: "DENYE",
    raw: "",
    sik: "",
    fiyat: "",
    olcum: { uzunluk: "", adet: "1", agirlik: "", acik: false },
    ...defaults,
  };
}
