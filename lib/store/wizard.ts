import { create } from 'zustand';
import { WizardState, CompanyInfo, UploadedFiles, ContextAnswers, AnalysisResult, AggregatedResult } from '@/lib/types';

interface WizardStore extends WizardState {
  setCurrentStep: (step: number) => void;
  setCompanyInfo: (info: CompanyInfo) => void;
  setUploadedFiles: (files: UploadedFiles) => void;
  updateUploadedFiles: (files: Partial<UploadedFiles>) => void;
  setContextAnswers: (answers: ContextAnswers) => void;
  setAnalysisResult: (section: string, result: AnalysisResult) => void;
  setAggregatedResult: (result: AggregatedResult) => void;
  setPromptOverrides: (overrides: AnalysisRequest['promptOverrides']) => void;
  reset: () => void;
}

const initialState: WizardState = {
  currentStep: 0,
  companyInfo: null,
  uploadedFiles: {},
  contextAnswers: {},
  analysisResults: {},
  aggregatedResult: null,
  promptOverrides: {},
};

export const useWizardStore = create<WizardStore>((set) => ({
  ...initialState,
  
  setCurrentStep: (step) => set({ currentStep: step }),
  
  setCompanyInfo: (info) => set({ companyInfo: info }),
  
  setUploadedFiles: (files) => set({ uploadedFiles: files }),
  
  updateUploadedFiles: (files) => set((state) => ({
    uploadedFiles: { ...state.uploadedFiles, ...files }
  })),
  
  setContextAnswers: (answers) => set({ contextAnswers: answers }),
  
  setAnalysisResult: (section, result) => {
    console.log(`Setting analysis result for ${section}:`, result);
    set((state) => ({
      analysisResults: { ...state.analysisResults, [section]: result }
    }));
  },
  
  setAggregatedResult: (result) => set({ aggregatedResult: result }),
  
  setPromptOverrides: (overrides) => set({ promptOverrides: overrides }),
  
  reset: () => set(initialState),
}));
