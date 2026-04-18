// ===== PROVINCE ENERGY DATA =====
export interface ProvinceInfo {
  nameEN: string;
  capital: string;
  color: string;
}

export const PROVINCE_DATA: Record<string, ProvinceInfo> = {
  "śląskie":              { nameEN: "Silesia",            capital: "Katowice",                    color: "#6366f1" },
  "opolskie":             { nameEN: "Opole",              capital: "Opole",                       color: "#8b5cf6" },
  "wielkopolskie":        { nameEN: "Greater Poland",     capital: "Poznań",                      color: "#22d3ee" },
  "zachodniopomorskie":   { nameEN: "West Pomerania",     capital: "Szczecin",                    color: "#10b981" },
  "świętokrzyskie":      { nameEN: "Holy Cross",         capital: "Kielce",                      color: "#f59e0b" },
  "kujawsko-pomorskie":  { nameEN: "Kuyavia-Pomerania",  capital: "Bydgoszcz / Toruń",          color: "#f43f5e" },
  "podlaskie":            { nameEN: "Podlasie",           capital: "Białystok",                   color: "#14b8a6" },
  "dolnośląskie":        { nameEN: "Lower Silesia",      capital: "Wrocław",                     color: "#a855f7" },
  "podkarpackie":         { nameEN: "Subcarpathia",       capital: "Rzeszów",                     color: "#ec4899" },
  "małopolskie":         { nameEN: "Lesser Poland",      capital: "Kraków",                      color: "#e11d48" },
  "pomorskie":            { nameEN: "Pomerania",          capital: "Gdańsk",                      color: "#0ea5e9" },
  "warmińsko-mazurskie": { nameEN: "Warmia-Masuria",     capital: "Olsztyn",                     color: "#06b6d4" },
  "łódzkie":             { nameEN: "Łódź",              capital: "Łódź",                       color: "#d946ef" },
  "mazowieckie":          { nameEN: "Masovia",            capital: "Warszawa",                    color: "#fbbf24" },
  "lubelskie":            { nameEN: "Lublin",             capital: "Lublin",                      color: "#34d399" },
  "lubuskie":             { nameEN: "Lubusz",             capital: "Gorzów Wlkp. / Zielona Góra", color: "#4ade80" }
};
