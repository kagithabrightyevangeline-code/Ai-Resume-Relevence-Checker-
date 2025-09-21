
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { DocumentDisplay } from './components/DocumentDisplay';
import { Loader } from './components/Loader';
import { analyzeResume } from './services/geminiService';
import type { AnalysisResult } from './types';

export interface AnalysisInput {
  jobDescriptionText?: string;
  jobDescriptionFile?: File;
  resumes: File[];
  pastedResumes: string[];
}

const App: React.FC = () => {
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>('');

  const getHiringProbability = (score: number): 'High' | 'Medium' | 'Low' => {
    if (score > 60) return 'High';
    if (score > 40) return 'Medium';
    return 'Low';
  };

  const handleAnalyze = useCallback(async ({ jobDescriptionText, jobDescriptionFile, resumes, pastedResumes }: AnalysisInput) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResults([]);
    
    const jobDescriptionInput = jobDescriptionFile || jobDescriptionText;
    
    if (!jobDescriptionInput) {
        setError("Job description is missing. Please provide one to begin analysis.");
        setIsLoading(false);
        return;
    }

    const results: AnalysisResult[] = [];
    
    const resumeQueue = [
        ...resumes.map(file => ({ type: 'file' as const, data: file, name: file.name })),
        ...pastedResumes.map((text, index) => ({ type: 'text' as const, data: text, name: `Pasted Resume #${index + 1}` })),
    ];
    
    const totalResumes = resumeQueue.length;

    for (let i = 0; i < totalResumes; i++) {
      const item = resumeQueue[i];
      try {
        setProgressMessage(`Analyzing ${i + 1} of ${totalResumes}: ${item.name}...`);
        
        if (item.type === 'text' && !item.data.trim()) {
            throw new Error("Pasted resume content is empty.");
        }

        const analysis = await analyzeResume(jobDescriptionInput, item.data);
        const hiringProbability = getHiringProbability(analysis.score);
        
        results.push({
          fileName: item.name,
          ...analysis,
          hiringProbability: hiringProbability,
        });
        
        setAnalysisResults([...results]);

      } catch (err) {
        console.error(`Failed to process ${item.name}:`, err);
        results.push({
           fileName: item.name,
           score: 0,
           summary: `Error: ${err instanceof Error ? err.message : 'An unknown error occurred.'}`,
           missingSkills: [],
           missingCertifications: [],
           feedback: 'Could not analyze this resume. Please check the file format or content and try again.',
           hiringProbability: 'Low'
        });
        setAnalysisResults([...results]);
      }
    }

    setProgressMessage('');
    setIsLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <InputForm onAnalyze={handleAnalyze} isLoading={isLoading} />
          
          <div className="mt-12">
            {isLoading && (
              <div className="p-8 flex flex-col items-center justify-center">
                <Loader />
                <p className="mt-4 text-lg text-gray-400">{progressMessage || 'Preparing analysis...'}</p>
              </div>
            )}
            {error && (
              <div className="p-8 text-center text-red-400 bg-red-900/20 rounded-lg">
                <h3 className="font-bold text-xl mb-2">Analysis Failed</h3>
                <p>{error}</p>
              </div>
            )}
            {analysisResults.length > 0 && !isLoading && (
              <DocumentDisplay results={analysisResults} />
            )}
            {!isLoading && analysisResults.length === 0 && !error && (
                 <div className="p-8 mt-8 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-700 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h2 className="text-2xl font-bold text-gray-400">Analysis Results Will Appear Here</h2>
                    <p className="mt-2 text-gray-500">Provide a job description and resumes to start the analysis.</p>
                </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
