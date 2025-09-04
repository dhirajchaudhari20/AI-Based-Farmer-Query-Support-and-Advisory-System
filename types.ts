export type Role = 'user' | 'model';

export type LanguageCode = 'en' | 'ml' | 'mr' | 'hi';

export type Theme = 'light' | 'dark';

export interface Language {
  code: LanguageCode;
  name: string;
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  image?: string; // URL for displaying the image
  timestamp: Date;
}