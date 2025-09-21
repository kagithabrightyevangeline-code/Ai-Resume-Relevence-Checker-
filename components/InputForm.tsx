import React, { useState, useCallback } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import type { AnalysisInput } from '../App';

interface AnalysisFormProps {
  onAnalyze: (data: AnalysisInput) => void;
  isLoading: boolean;
}

type InputMethod = 'text' | 'file';

export const InputForm: React.FC<AnalysisFormProps> = ({ onAnalyze, isLoading }) => {
  const [jobDescription, setJobDescription] = useState<string>('Seeking a Senior Frontend Engineer with 5+ years of experience in React, TypeScript, and Node.js. Must have a strong understanding of UI/UX principles, state management with Redux or MobX, and experience with CI/CD pipelines. A passion for building accessible and performant web applications is crucial. Experience with GraphQL and cloud platforms (AWS/GCP) is a plus. PMP or Agile certification is desirable.');
  const [jobDescriptionFile, setJobDescriptionFile] = useState<File | null>(null);
  const [jdInputMethod, setJdInputMethod] = useState<InputMethod>('text');
  
  const [pastedResume, setPastedResume] = useState('');
  const [pastedResumes, setPastedResumes] = useState<string[]>([]);
  const [resumeFiles, setResumeFiles] = useState<File[]>([]);
  const [resumeInputMethod, setResumeInputMethod] = useState<InputMethod>('file');

  const [dragOver, setDragOver] = useState(false);

  const addResumeFiles = useCallback((files: FileList | null) => {
      if (!files) return;
      const newFiles = Array.from(files);
      setResumeFiles(prevResumes => {
        const existingFileNames = new Set(prevResumes.map(f => f.name));
        const uniqueNewFiles = newFiles.filter(f => !existingFileNames.has(f.name));
        return [...prevResumes, ...uniqueNewFiles];
    });
  }, []);

  const removeResumeFile = (fileName: string) => {
    setResumeFiles(prev => prev.filter(file => file.name !== fileName));
  };
  
  const handleAddPastedResume = () => {
    if (pastedResume.trim()) {
        setPastedResumes(prev => [...prev, pastedResume.trim()]);
        setPastedResume('');
    }
  };

  const removePastedResume = (index: number) => {
    setPastedResumes(prev => prev.filter((_, i) => i !== index));
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addResumeFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  }, [addResumeFiles]);

  const handleDragEvents = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
        setDragOver(true);
    } else if (e.type === "dragleave") {
        setDragOver(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze({
      jobDescriptionText: jdInputMethod === 'text' ? jobDescription : undefined,
      jobDescriptionFile: jdInputMethod === 'file' ? jobDescriptionFile! : undefined,
      resumes: resumeFiles,
      pastedResumes: pastedResumes,
    });
  };
  
  const isJdEmpty = (jdInputMethod === 'text' && !jobDescription.trim()) || (jdInputMethod === 'file' && !jobDescriptionFile);
  const areResumesEmpty = resumeFiles.length === 0 && pastedResumes.length === 0;
  const isSubmitDisabled = isLoading || areResumesEmpty || isJdEmpty;

  const renderActiveTab = (method: InputMethod, setMethod: (m: InputMethod) => void) => (
      <div className="flex border-b border-gray-600 mb-2">
            <button type="button" onClick={() => setMethod('text')} className={`px-4 py-2 text-sm font-medium ${method === 'text' ? 'bg-gray-700/50 text-white' : 'text-gray-400 hover:bg-gray-700/30'}`}>Paste Text</button>
            <button type="button" onClick={() => setMethod('file')} className={`px-4 py-2 text-sm font-medium ${method === 'file' ? 'bg-gray-700/50 text-white' : 'text-gray-400 hover:bg-gray-700/30'}`}>Upload File(s)</button>
      </div>
  );

  return (
    <div className="bg-gray-800/50 p-6 rounded-lg shadow-2xl backdrop-blur-sm border border-gray-700">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Job Description Section */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            1. Provide Job Description
          </label>
          {renderActiveTab(jdInputMethod, setJdInputMethod)}
          {jdInputMethod === 'text' ? (
            <textarea
              id="job-description"
              rows={8}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder="Paste the full job description here..."
            />
          ) : (
             <label htmlFor="jd-upload" className="mt-2 flex justify-center items-center w-full h-32 px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md cursor-pointer transition-colors hover:border-indigo-500">
                <input id="jd-upload" type="file" className="sr-only" onChange={(e) => setJobDescriptionFile(e.target.files ? e.target.files[0] : null)} accept=".txt,.pdf" />
                <div className="text-center">
                    {jobDescriptionFile ? (
                        <p className="text-indigo-400">{jobDescriptionFile.name}</p>
                    ) : (
                        <><svg className="mx-auto h-8 w-8 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg><p className="mt-1 text-sm text-gray-400">Click to upload (.txt, .pdf)</p></>
                    )}
                </div>
            </label>
          )}
        </div>

        {/* Resumes Section */}
        <div>
           <label className="block text-sm font-medium text-gray-300 mb-2">
            2. Add Resumes
          </label>
          {renderActiveTab(resumeInputMethod, setResumeInputMethod)}
          {resumeInputMethod === 'text' ? (
              <div>
                  <textarea
                    rows={8}
                    value={pastedResume}
                    onChange={e => setPastedResume(e.target.value)}
                    className="w-full bg-gray-900/50 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="Paste a single resume here and click 'Add Resume' below."
                  />
                  <button type="button" onClick={handleAddPastedResume} disabled={!pastedResume.trim()} className="mt-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900/50 disabled:cursor-not-allowed">Add Resume from Text</button>
              </div>
          ) : (
              <label 
                htmlFor="resume-upload"
                className={`mt-2 flex justify-center items-center w-full h-32 px-6 pt-5 pb-6 border-2 ${dragOver ? 'border-indigo-500' : 'border-gray-600'} border-dashed rounded-md cursor-pointer transition-colors`}
                onDrop={handleDrop} onDragEnter={handleDragEvents} onDragLeave={handleDragEvents} onDragOver={handleDragEvents}
              >
                 <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                  <div className="flex text-sm text-gray-400">
                    <span className="relative rounded-md font-medium text-indigo-400 hover:text-indigo-300">Upload files (.txt, .pdf)</span>
                    <input id="resume-upload" type="file" multiple className="sr-only" onChange={(e) => addResumeFiles(e.target.files)} accept=".txt,.pdf" />
                    <p className="pl-1">or drag and drop</p>
                  </div>
                </div>
              </label>
          )}

           {(resumeFiles.length > 0 || pastedResumes.length > 0) && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Resume Queue ({resumeFiles.length + pastedResumes.length} total)</h3>
              <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {resumeFiles.map(file => (
                  <li key={file.name} className="flex justify-between items-center bg-gray-900/50 p-2 rounded-md text-sm">
                    <span className="text-gray-300 truncate pr-2">{file.name}</span>
                    <button type="button" onClick={() => removeResumeFile(file.name)} className="text-gray-500 hover:text-red-400 focus:outline-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </li>
                ))}
                 {pastedResumes.map((_, index) => (
                  <li key={`pasted-${index}`} className="flex justify-between items-center bg-gray-900/50 p-2 rounded-md text-sm">
                    <span className="text-gray-300 truncate pr-2">Pasted Resume #{index+1}</span>
                    <button type="button" onClick={() => removePastedResume(index)} className="text-gray-500 hover:text-red-400 focus:outline-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900 disabled:bg-indigo-900/50 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-300"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Analyzing...
              </>
            ) : (
              <>
                <SparklesIcon className="h-5 w-5 mr-2" />
                Analyze Resumes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};