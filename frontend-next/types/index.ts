export interface Profile {
  company: string;
  year: string;
  framework: string;
  companyName: string;
  selectedMetrics: string[];
  weight: number;
}

export interface Metric {
  id: number;
  title: string;
  isSelected: boolean;
  isOpen: boolean;
  pillar: "E" | "S" | "G";
  subMetrics: SubMetric[];
  weight: number;
}

export interface SubMetric {
  id: number;
  title: string;
  weight: number;
  value?: string;
  unit?: string;
  source?: string;
  isSelected?: boolean;
}

export interface CategoryState {
  open: boolean;
  metrics: Metric[];
}

export interface Categories {
  E: CategoryState;
  S: CategoryState;
  G: CategoryState;
}

export interface MetricComparison {
  name: string;
  score1: number;
  score2: number;
  difference: number;
}

export interface ChartDataset {
  label: string;
  data: number[];
  borderColor: string;
  tension: number;
}
