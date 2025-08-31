export type Finding = {
  title: string;
  why_it_matters: string;
  evidence?: string;
  recommendation: string;
  impact: 1|2|3|4|5;
  effort: 1|2|3|4|5;
  area: "GA4"|"GTM"|"Consent"|"Data"|"CRO/UX"|"SEO"|"GEO";
};

export type AnalysisResult = {
  findings: Finding[];
  gaps?: string[];
  summary?: string; // <= 120 words per section
};

export type AggregatedResult = {
  company: string;
  executiveSummary: string; // <= 200 words total
  findings: Finding[];      // merged + sorted
};

export type CompanyInfo = {
  name: string;
  domain: string;
  sections: ("Measurement" | "Data" | "CRO/UX" | "SEO" | "GEO")[];
};

export type UploadedFiles = {
  screamingFrog?: string;
  ahrefs?: string;
  ga4?: string;
  gtm?: string;
  screenshots?: string[];
  pageSpeed?: any;
};

export type ContextAnswers = {
  businessGoal?: string;
  conversions?: string[];
  competitors?: string[];
  markets?: string[];
};

export type AnalysisRequest = {
  company: string;
  promptOverrides?: {
    measurement?: string;
    data?: string;
    seo?: string;
    geo?: string;
    ux?: string;
  };
  files?: UploadedFiles;
  context?: ContextAnswers & {
    url?: string;
    pageSpeed?: any;
  };
};

export type WizardState = {
  currentStep: number;
  companyInfo: CompanyInfo | null;
  uploadedFiles: UploadedFiles;
  contextAnswers: ContextAnswers;
  analysisResults: Record<string, AnalysisResult>;
  aggregatedResult: AggregatedResult | null;
  promptOverrides: AnalysisRequest['promptOverrides'];
};

// Parsed data types
export type ScreamingFrogRow = {
  url: string;
  title?: string;
  meta?: string;
  h1?: string;
  canonical?: string;
  schema?: string;
  code?: number;
  imgAltCount?: number;
};

export type AhrefsRow = {
  topKeywords: Array<{
    keyword: string;
    volume: number;
    rank: number;
    url: string;
  }>;
};

export type GA4Row = {
  // Will be defined based on actual GA4 export structure
  [key: string]: any;
};

export type GTMRow = {
  // Will be defined based on actual GTM export structure
  [key: string]: any;
};


