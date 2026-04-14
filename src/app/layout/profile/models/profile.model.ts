export interface Profile {
  id?: number;
  resumoProfissional?: string;
  cargoDesejado?: string;
  cidade?: string;
  estado?: string;
  linkedinUrl?: string;
  githubUrl?: string;
}

export interface SkillResponse {
  id?: number;
  nomeSkill: string;
  nivel?: string | null;
}

export interface Experience {
  id?: number;
  cargo?: string;
  empresa?: string;
  descricao?: string;
  dataInicio?: string;
  dataFim?: string;
}

export interface Certification {
  id?: number;
  nomeCertificacao?: string;
  instituicao?: string;
  dataObtencao?: string;
}

export interface Project {
  id?: number;
  nome?: string;
  descricao?: string;
  stack?: string;
  link?: string;
}

export interface UpdateSkillsPayload {
  skills: string[];
}

export interface UpdateExperiencesPayload {
  experiencias: Experience[];
}

export interface UpdateCertificationsPayload {
  certificacoes: Certification[];
}

export interface UpdateProjectsPayload {
  projetos: Project[];
}
