export interface Motd {
  id: string;
  name: string;
  description: string;
  date: string;
  severity: "High" | "Medium" | "Low";
}
