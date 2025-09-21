import React from 'react';
import type { AnalysisResult } from '../types';

interface ResultsDisplayProps {
  results: AnalysisResult[];
}

const ResultCard: React.FC<{ result: AnalysisResult }> = ({ result }) => {
    const getScoreColor = (score: number) => {
        if (score >= 85) return 'text-green-400';
        if (score >= 60) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getProbabilityBadge = (probability: 'High' | 'Medium' | 'Low') => {
        switch(probability) {
            case 'High':
                return 'bg-green-500/20 text-green-300';
            case 'Medium':
                return 'bg-yellow-500/20 text-yellow-300';
            case 'Low':
                return 'bg-red-500/20 text-red-300';
            default:
                return 'bg-gray-500/20 text-gray-300';
        }
    };

    return (
        <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
            <div className="p-4 sm:p-5 flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-white">{result.fileName}</h3>
                        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${getProbabilityBadge(result.hiringProbability)}`}>
                           {result.hiringProbability} Probability
                        </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{result.summary}</p>
                </div>
                <div className={`text-3xl font-bold ml-4 flex-shrink-0 ${getScoreColor(result.score)}`}>
                    {result.score}
                </div>
            </div>
            <div className="border-t border-gray-700 px-4 py-3 sm:px-5">
                <details className="group">
                    <summary className="cursor-pointer list-none flex justify-between items-center">
                        <span className="font-medium text-indigo-300">View Full Analysis</span>
                        <svg className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </summary>
                    <div className="mt-4 space-y-4 text-sm">
                        <div>
                            <h4 className="font-semibold text-gray-300">Missing Skills</h4>
                            {result.missingSkills.length > 0 ? (
                                <ul className="list-disc list-inside mt-1 text-gray-400">
                                    {result.missingSkills.map(skill => <li key={skill}>{skill}</li>)}
                                </ul>
                            ) : <p className="text-gray-500 italic mt-1">No missing skills identified.</p>}
                        </div>
                         <div>
                            <h4 className="font-semibold text-gray-300">Missing Certifications</h4>
                            {result.missingCertifications.length > 0 ? (
                                <ul className="list-disc list-inside mt-1 text-gray-400">
                                    {result.missingCertifications.map(cert => <li key={cert}>{cert}</li>)}
                                </ul>
                            ) : <p className="text-gray-500 italic mt-1">No missing certifications identified.</p>}
                        </div>
                         <div>
                            <h4 className="font-semibold text-gray-300">Improvement Feedback</h4>
                            <p className="mt-1 text-gray-400 whitespace-pre-wrap font-mono">{result.feedback}</p>
                        </div>
                    </div>
                </details>
            </div>
        </div>
    )
}


export const DocumentDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  // Sort results by score in descending order
  const sortedResults = [...results].sort((a, b) => b.score - a.score);

  return (
    <div className="p-6 sm:p-8">
      <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Analysis Results</h2>
      <p className="text-gray-400 mb-8 border-b border-gray-700 pb-4">
        Showing {results.length} resume(s) shortlisted and ranked by relevance score.
      </p>
      
      <div className="space-y-4">
        {sortedResults.map((result) => (
          <ResultCard key={result.fileName} result={result} />
        ))}
      </div>
    </div>
  );
};