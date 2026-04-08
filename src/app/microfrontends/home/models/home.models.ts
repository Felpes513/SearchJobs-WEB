export interface ResumeItem {
  id: number;
  fileName: string;
  filePath: string;
  createdAt: string;
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
