export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: Date;
  isError?: boolean;
  groundingSources?: GroundingSource[];
}

export interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  inquiry: string;
}
