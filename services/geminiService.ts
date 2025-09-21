
import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// The schema for the structured JSON response from the AI model.
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    score: {
      type: Type.INTEGER,
      description: "A relevance score from 0 to 100, where 100 is a perfect match.",
    },
    summary: {
      type: Type.STRING,
      description: "A concise summary of the candidate's strengths and weaknesses in relation to the job description.",
    },
    missingSkills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of key skills mentioned in the job description that are missing from the resume.",
    },
    missingCertifications: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of key certifications mentioned in the job description that are missing from the resume.",
    },
    feedback: {
      type: Type.STRING,
      description: "Constructive, actionable feedback on how the candidate could improve their resume to better match this specific job description.",
    },
  },
  required: ['score', 'summary', 'missingSkills', 'missingCertifications', 'feedback']
};

// Helper function to convert a File to a base64-encoded GenerativePart.
const fileToGenerativePart = async (file: File) => {
  const base64EncodedData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
};

export const analyzeResume = async (
  jobDescription: string | File,
  resume: string | File
): Promise<Omit<AnalysisResult, 'fileName' | 'hiringProbability'>> => {
  const model = "gemini-2.5-flash";

  const promptText = `
    As an expert technical recruiter and career coach, your task is to analyze the provided candidate's resume against the specific job description.
    The job description and resume are provided as files or text. Please extract their content and perform the analysis.
    
    Your analysis must be based *only* on the information given.
    Evaluate the resume for skills, experience, qualifications, and certifications against the job description.
    Generate a relevance score, identify missing skills and certifications, and provide constructive feedback.

    Return the analysis in a structured JSON format.
  `;

  const parts: any[] = [{ text: promptText }];

  // Add Job Description part
  if (typeof jobDescription === 'string') {
    parts.push({ text: `Job Description:\n---\n${jobDescription}\n---` });
  } else {
    parts.push({ text: "The Job Description is in the attached file:" });
    parts.push(await fileToGenerativePart(jobDescription));
  }

  // Add Resume part
  if (typeof resume === 'string') {
    parts.push({ text: `Candidate's Resume:\n---\n${resume}\n---` });
  } else {
    parts.push({ text: "The Candidate's Resume is in the attached file:" });
    parts.push(await fileToGenerativePart(resume));
  }

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts }, // Always use multipart content structure
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2,
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
        throw new Error("The AI model returned an empty response. This may be due to content safety filters or an issue with the input files.");
    }
    const parsedResult = JSON.parse(jsonText);
    return parsedResult as Omit<AnalysisResult, 'fileName' | 'hiringProbability'>;

  } catch (error) {
    console.error("Error analyzing resume:", error);
    let errorMessage = "Failed to analyze resume. The AI model returned an unexpected response.";
     if (error instanceof Error) {
        if (error.message.includes("400")) { // Bad Request from API
            errorMessage = "Failed to analyze resume. One of the file formats may be unsupported or corrupted. Please try with standard PDF or TXT files.";
        } else if (error.message.toLowerCase().includes("json")) {
            errorMessage = "Failed to parse the AI model's response. The format was invalid.";
        } else {
            errorMessage = error.message;
        }
    }
    throw new Error(errorMessage);
  }
};
