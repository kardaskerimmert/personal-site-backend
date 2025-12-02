import { z } from 'zod';

export const AuthSchema = z.object({
  username: z.string().min(3, 'Kullanıcı adı en az 3 karakter olmalıdır.'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır.'),
});

const LinkSchema = z.object({
  label: z.string().max(50),
  url: z.string().url().max(255),
});

const IconSchema = z.object({
  platform: z.string().max(50).optional(),
  url: z.string().url().max(255),
  icon: z.string().max(100),
  name: z.string().max(50).optional(),
});

const TechSchema = z.object({
  name: z.string().max(50),
  icon: z.string().max(100),
  primary: z.boolean().optional(),
});

const ProjectSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().max(500),
  url: z.string().url().max(255),
});

const ThemeSettingsSchema = z.object({
    primary: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, 'Geçersiz hex kodu.'),
    accent: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, 'Geçersiz hex kodu.'),
});

export const SiteDataSchema = z.object({
  title: z.string().max(100),
  subtitle: z.string().max(150),
  email: z.string().email(),
  profileImage: z.string().url(),
  topLinks: z.array(LinkSchema).max(5),
  socialLinks: z.array(IconSchema).max(10),
  technologies: z.array(TechSchema).max(20),
  games: z.array(IconSchema).max(10),
  projects: z.array(ProjectSchema).max(10),
  copyright: z.string().max(100),
  themeSettings: ThemeSettingsSchema,
});

export type SiteDataInferred = z.infer<typeof SiteDataSchema>;