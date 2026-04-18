// ===== PROVINCE ENERGY DATA =====
export interface ProvinceInfo {
  nameEN: string;
  capital: string;
  color: string;
}

export const PROVINCE_DATA: Record<string, ProvinceInfo> = {
  "śląskie":              { nameEN: "Śląskie",              capital: "Katowice",                    color: "#6366f1" },
  "opolskie":             { nameEN: "Opolskie",             capital: "Opole",                       color: "#8b5cf6" },
  "wielkopolskie":        { nameEN: "Wielkopolskie",        capital: "Poznań",                      color: "#22d3ee" },
  "zachodniopomorskie":   { nameEN: "Zachodniopomorskie",   capital: "Szczecin",                    color: "#10b981" },
  "świętokrzyskie":      { nameEN: "Świętokrzyskie",      capital: "Kielce",                      color: "#f59e0b" },
  "kujawsko-pomorskie":  { nameEN: "Kujawsko-pomorskie",  capital: "Bydgoszcz / Toruń",          color: "#f43f5e" },
  "podlaskie":            { nameEN: "Podlaskie",            capital: "Białystok",                   color: "#14b8a6" },
  "dolnośląskie":        { nameEN: "Dolnośląskie",        capital: "Wrocław",                     color: "#a855f7" },
  "podkarpackie":         { nameEN: "Podkarpackie",         capital: "Rzeszów",                     color: "#ec4899" },
  "małopolskie":         { nameEN: "Małopolskie",         capital: "Kraków",                      color: "#e11d48" },
  "pomorskie":            { nameEN: "Pomorskie",            capital: "Gdańsk",                      color: "#0ea5e9" },
  "warmińsko-mazurskie": { nameEN: "Warmińsko-mazurskie", capital: "Olsztyn",                     color: "#06b6d4" },
  "łódzkie":             { nameEN: "Łódzkie",             capital: "Łódź",                       color: "#d946ef" },
  "mazowieckie":          { nameEN: "Mazowieckie",          capital: "Warszawa",                    color: "#fbbf24" },
  "lubelskie":            { nameEN: "Lubelskie",            capital: "Lublin",                      color: "#34d399" },
  "lubuskie":             { nameEN: "Lubuskie",             capital: "Gorzów Wlkp. / Zielona Góra", color: "#4ade80" }
};
