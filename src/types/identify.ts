export interface Identification {
  id: number;
  ward: number | null;
  label: "Bio" | "Non_Bio";
  category: "degradable" | "non_degradable";
  confidence: number;
  probabilities: Record<string, number>;
  filename: string | null;
  created_at: string;
  inference_ms?: number;
}

export interface IdentificationList {
  items: Identification[];
  summary: { total: number; degradable: number; non_degradable: number };
}
