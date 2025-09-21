export interface AnalysisResult {
  fileName: string; // The name of the resume file or identifier for pasted text
  score: number; // A score from 0 to 100
  summary: string; // A brief summary of the candidate's fit
  missingSkills: string[]; // An array of skills missing from the resume
  missingCertifications: string[]; // An array of certifications missing
  feedback: string; // Actionable feedback for improvement
  hiringProbability: 'High' | 'Medium' | 'Low'; // Qualitative hiring assessment
}