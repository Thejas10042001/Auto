
import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
import { AnalysisResult, MeetingContext, ThinkingLevel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const THINKING_LEVEL_MAP: Record<ThinkingLevel, number> = {
  'Minimal': 0,
  'Low': 4000,
  'Medium': 16000,
  'High': 32768
};

/**
 * Enhanced High-Precision Cognitive OCR.
 * Instructs Gemini to reconstruct tables as Markdown and describe charts/graphs.
 */
export async function performVisionOcr(base64Data: string, mimeType: string): Promise<string> {
  const modelName = 'gemini-3-pro-preview'; 
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: mimeType } },
          { 
            text: `Act as a high-precision Document Intelligence & Structural Extraction Engine.
            
            TRANSCRIPTION PROTOCOL:
            1. TABLES: Detect all tables. Transcribe them exactly into GitHub-flavored Markdown. Ensure column alignment.
            2. CHARTS/GRAPHS: Identify any visual data representations. Provide a concise, data-driven summary of the trends, values, and labels shown.
            3. LAYOUT: Maintain logical reading order. Handle multi-column layouts by following the intended flow.
            4. TEXT: Extract all other text with 100% character accuracy.
            
            Output ONLY the reconstructed content. Do not include introductory or concluding remarks.` 
          },
        ],
      },
      config: {
        // Use thinking budget to help the model reason about complex overlapping layouts
        thinkingConfig: { thinkingBudget: 1024 }
      }
    });
    return response.text || "";
  } catch (error) {
    console.error("Vision OCR failed:", error);
    return "";
  }
}

export interface CognitiveSearchResult {
  answer: string;
  briefExplanation: string;
  articularSoundbite: string; 
  psychologicalProjection: {
    buyerFear: string;
    buyerIncentive: string;
    strategicLever: string;
  };
  citations: { snippet: string; source: string }[];
  reasoningChain: {
    painPoint: string;
    capability: string;
    strategicValue: string;
  };
}

export async function* performCognitiveSearchStream(
  question: string, 
  filesContent: string, 
  context: MeetingContext
): AsyncGenerator<string> {
  const modelName = 'gemini-3-flash-preview';
  const styleDirectives = context.answerStyles.map(style => `- Create a section exactly titled "### ${style}"`).join('\n');

  const prompt = `MEETING INTELLIGENCE CONTEXT:
  - Seller: ${context.sellerNames} from ${context.sellerCompany}
  - Prospect: ${context.clientNames} from ${context.clientCompany} (Persona: ${context.persona})
  - Focus: ${context.meetingFocus}
  - Strategy: ${context.executiveSnapshot}
  
  TASK: Synthesize a response to: "${question}". 
  Note: Source data may contain Markdown tables and descriptive chart summaries. Use this structured data for quantitative proof.
  
  REQUIRED STRUCTURE:
  ${styleDirectives}

  SOURCE DOCUMENTS:
  ${filesContent}

  JSON OUTPUT SCHEMA (MUST BE VALID):
  {
    "articularSoundbite": "Powerful 1-sentence verbatim hook.",
    "briefExplanation": "2-3 sentence strategic summary.",
    "answer": "The full detailed analysis.",
    "psychologicalProjection": { "buyerFear": "...", "buyerIncentive": "...", "strategicLever": "..." },
    "citations": [ { "snippet": "...", "source": "..." } ],
    "reasoningChain": { "painPoint": "...", "capability": "...", "strategicValue": "..." }
  }`;

  try {
    const result = await ai.models.generateContentStream({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: `You are a Senior Cognitive Sales Strategist. Provide grounded intelligence using the provided source documents. 
        Analyze quantitative data found in Markdown tables for precise ROI calculations.`,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 2048 } 
      }
    });

    for await (const chunk of result) {
      yield chunk.text || "";
    }
  } catch (error) {
    console.error("Streaming search failed:", error);
    throw new Error("Cognitive Engine failed to synthesize. Check source integrity.");
  }
}

export async function performCognitiveSearch(
  question: string, 
  filesContent: string, 
  context: MeetingContext
): Promise<CognitiveSearchResult> {
  const stream = performCognitiveSearchStream(question, filesContent, context);
  let fullText = "";
  for await (const chunk of stream) {
    fullText += chunk;
  }
  return JSON.parse(fullText || "{}");
}

export async function generateDynamicSuggestions(filesContent: string, context: MeetingContext): Promise<string[]> {
  const modelName = 'gemini-3-flash-preview';
  const prompt = `Suggest 3 highly strategic sales questions for ${context.clientCompany || 'the prospect'}. Return as JSON array of strings.`;
  const response = await ai.models.generateContent({ 
    model: modelName, 
    contents: prompt, 
    config: { 
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 0 }
    } 
  });
  return JSON.parse(response.text || "[]");
}

export function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

export async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}

export async function generateExplanation(question: string, context: AnalysisResult): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Explain the strategy behind: "${question}" based on: ${JSON.stringify(context.snapshot)}.`,
    config: { thinkingConfig: { thinkingBudget: 0 } }
  });
  return response.text || "";
}

export async function generatePitchAudio(text: string, voiceName: string = 'Kore'): Promise<Uint8Array | null> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } } },
    },
  });
  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  return base64Audio ? decode(base64Audio) : null;
}

export async function analyzeSalesContext(filesContent: string, context: MeetingContext): Promise<AnalysisResult> {
  const modelName = 'gemini-3-pro-preview';
  const citationSchema = {
    type: Type.OBJECT,
    properties: { snippet: { type: Type.STRING }, sourceFile: { type: Type.STRING } },
    required: ["snippet", "sourceFile"],
  };

  const competitorSchema = {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING },
      overview: { type: Type.STRING },
      threatProfile: { type: Type.STRING },
      strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
      weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
      ourWedge: { type: Type.STRING },
      citation: citationSchema
    },
    required: ["name", "overview", "threatProfile", "strengths", "weaknesses", "ourWedge", "citation"]
  };

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      snapshot: {
        type: Type.OBJECT,
        properties: {
          role: { type: Type.STRING },
          roleCitation: citationSchema,
          priorities: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, citation: citationSchema }, required: ["text", "citation"] } },
          likelyObjections: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, citation: citationSchema }, required: ["text", "citation"] } },
          decisionStyle: { type: Type.STRING },
          decisionStyleCitation: citationSchema,
          riskTolerance: { type: Type.STRING },
          riskToleranceCitation: citationSchema,
          tone: { type: Type.STRING },
          metrics: {
            type: Type.OBJECT,
            properties: {
              riskToleranceValue: { type: Type.NUMBER },
              strategicPriorityFocus: { type: Type.NUMBER },
              analyticalDepth: { type: Type.NUMBER },
              directness: { type: Type.NUMBER },
              innovationAppetite: { type: Type.NUMBER }
            },
            required: ["riskToleranceValue", "strategicPriorityFocus", "analyticalDepth", "directness", "innovationAppetite"]
          },
          personaIdentity: { type: Type.STRING },
          decisionLogic: { type: Type.STRING }
        },
        required: ["role", "roleCitation", "priorities", "likelyObjections", "decisionStyle", "decisionStyleCitation", "riskTolerance", "riskToleranceCitation", "tone", "metrics", "personaIdentity", "decisionLogic"],
      },
      documentInsights: {
        type: Type.OBJECT,
        properties: {
          entities: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, type: { type: Type.STRING }, context: { type: Type.STRING }, citation: citationSchema }, required: ["name", "type", "context", "citation"] } },
          structure: { type: Type.OBJECT, properties: { sections: { type: Type.ARRAY, items: { type: Type.STRING } }, keyHeadings: { type: Type.ARRAY, items: { type: Type.STRING } }, detectedTablesSummary: { type: Type.STRING } }, required: ["sections", "keyHeadings", "detectedTablesSummary"] },
          summaries: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { fileName: { type: Type.STRING }, summary: { type: Type.STRING }, strategicImpact: { type: Type.STRING }, criticalInsights: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["fileName", "summary", "strategicImpact", "criticalInsights"] } },
          materialSynthesis: { type: Type.STRING }
        },
        required: ["entities", "structure", "summaries", "materialSynthesis"]
      },
      groundMatrix: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            observation: { type: Type.STRING },
            significance: { type: Type.STRING },
            evidence: citationSchema
          },
          required: ["category", "observation", "significance", "evidence"]
        }
      },
      competitiveHub: {
        type: Type.OBJECT,
        properties: {
          cognigy: competitorSchema,
          amelia: competitorSchema,
          others: { type: Type.ARRAY, items: competitorSchema }
        },
        required: ["cognigy", "amelia", "others"]
      },
      openingLines: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, label: { type: Type.STRING }, citation: citationSchema }, required: ["text", "label", "citation"] } },
      predictedQuestions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { customerAsks: { type: Type.STRING }, salespersonShouldRespond: { type: Type.STRING }, reasoning: { type: Type.STRING }, category: { type: Type.STRING }, citation: citationSchema }, required: ["customerAsks", "salespersonShouldRespond", "reasoning", "category", "citation"] } },
      strategicQuestionsToAsk: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, whyItMatters: { type: Type.STRING }, citation: citationSchema }, required: ["question", "whyItMatters", "citation"] } },
      objectionHandling: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { objection: { type: Type.STRING }, realMeaning: { type: Type.STRING }, strategy: { type: Type.STRING }, exactWording: { type: Type.STRING }, citation: citationSchema }, required: ["objection", "realMeaning", "strategy", "exactWording", "citation"] } },
      toneGuidance: { type: Type.OBJECT, properties: { wordsToUse: { type: Type.ARRAY, items: { type: Type.STRING } }, wordsToAvoid: { type: Type.ARRAY, items: { type: Type.STRING } }, sentenceLength: { type: Type.STRING }, technicalDepth: { type: Type.STRING } }, required: ["wordsToUse", "wordsToAvoid", "sentenceLength", "technicalDepth"] },
      finalCoaching: { type: Type.OBJECT, properties: { dos: { type: Type.ARRAY, items: { type: Type.STRING } }, donts: { type: Type.ARRAY, items: { type: Type.STRING } }, finalAdvice: { type: Type.STRING } }, required: ["dos", "donts", "finalAdvice"] },
      reportSections: {
        type: Type.OBJECT,
        properties: {
          introBackground: { type: Type.STRING },
          technicalDiscussion: { type: Type.STRING },
          productIntegration: { type: Type.STRING }
        },
        required: ["introBackground", "technicalDiscussion", "productIntegration"]
      }
    },
    required: ["snapshot", "documentInsights", "groundMatrix", "competitiveHub", "openingLines", "predictedQuestions", "strategicQuestionsToAsk", "objectionHandling", "toneGuidance", "finalCoaching", "reportSections"]
  };

  const prompt = `Synthesize high-fidelity cognitive sales intelligence. 
  
  Note: The source materials include structural transcriptions of tables and summaries of charts. Use these quantitative data points for your analysis of threat profiles and financial significance.
  
  --- SOURCE --- 
  ${filesContent}`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: `You are a Cognitive Sales Strategist. Provide grounded intelligence in JSON. Use Markdown tables within text fields when appropriate for clarity.`,
        responseMimeType: "application/json",
        responseSchema,
        temperature: context.temperature,
        thinkingConfig: { thinkingBudget: THINKING_LEVEL_MAP[context.thinkingLevel] }
      },
    });
    return JSON.parse(response.text || "{}") as AnalysisResult;
  } catch (error: any) { throw new Error(`Analysis Failed: ${error.message}`); }
}
