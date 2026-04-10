export interface ResumeItem {
  id?: number;
  fileName: string;
  createdAt: string;
  extraido: boolean;
  nome: string | null;
  email: string | null;
  telefone: string | null;
  cidade: string | null;
  estado: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  resumoProfissional: string | null;
  skills: string[] | null;
  experiencias: ResumeExperience[] | null;
  certificacoes: ResumeCertification[] | null;
  projetos: ResumeProject[] | null;
}

export interface ResumeExperience {
  cargo: string | null;
  empresa: string | null;
  descricao: string | null;
  dataInicio: string | null;
  dataFim: string | null;
}

export interface ResumeCertification {
  nome: string | null;
  instituicao: string | null;
  dataObtencao: string | null;
}

export interface ResumeProject {
  nome: string | null;
  descricao: string | null;
  stack: string | null;
  link: string | null;
}

export interface ResumeListResponse {
  content: ResumeItem[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface UploadResumeResponse {
  id: number;
  fileName: string;
  filePath: string;
  createdAt: string;
}

export interface ResumeExtractResponse {
  resumeId: number;
  parsedJson: string;
  mensagem: string;
}

export interface JobItem {
  id: number;
  externalId: string;
  titulo: string;
  empresa: string;
  localizacao: string;
  modeloTrabalho: string;
  senioridade: string;
  descricao: string;
  salario: string | null;
  jobUrl: string;
  dataPublicacao: string;
}

export interface JobApplicationHistoryItem {
  jobId: number;
  externalId: string;
  titulo: string;
  empresa: string;
  localizacao: string;
  modeloTrabalho: string;
  senioridade: string;
  salario: string | null;
  jobUrl: string;
  dataPublicacao: string;
  appliedAt: string;
}

export interface JobSearchCacheEntry {
  vagas: JobItem[];
  cachedAt: string;
}

export interface JobSearchResult {
  vagas: JobItem[];
  fromCache: boolean;
  cachedAt: string | null;
}

export interface ParsedResumeData {
  nome?: string;
  email?: string;
  telefone?: string;
  skills?: string[];
  experiencias?: {
    cargo?: string;
    empresa?: string;
    periodo?: string;
  }[];
  certificacoes?: string[];
  projetos?: {
    nome?: string;
    descricao?: string;
  }[];
}
