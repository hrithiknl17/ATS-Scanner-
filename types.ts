
export interface RecommendedChange {
  section: string;
  original: string;
  suggested: string;
  reason: string;
}

export interface ATSResult {
  match_percentage: number;
  missing_keywords: string[];
  strengths: string[];
  summary_critique: string;
  recommended_changes: RecommendedChange[];
  optimized_full_text: string;
}

export interface EvaluationHistory {
  id: string;
  timestamp: number;
  jobTitle: string;
  result: ATSResult;
}
