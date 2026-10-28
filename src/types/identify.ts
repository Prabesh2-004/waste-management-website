export interface Identification {
  /** null for live-video frames, which are not saved. */
  id: number | null;
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
