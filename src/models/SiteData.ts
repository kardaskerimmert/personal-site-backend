import mongoose, { Schema, Document } from "mongoose";
import { SiteDataInferred } from "../validation/schemas"; 

export type ISiteData = SiteDataInferred; 

const SiteDataSchema = new Schema<ISiteData>({
  title: { type: String, default: "Benim Kişisel Web Sitem" },
  subtitle: { type: String, default: "Code, Games, Music" },
  email: { type: String, default: "benim@kisisel.sitem" },
  profileImage: { type: String, default: "https://avatar.iran.liara.run/public" },
  topLinks: [new Schema({ label: String, url: String }, { _id: false })],
  socialLinks: [new Schema({ platform: String, url: String, icon: String }, { _id: false })],
  technologies: [new Schema({ name: String, icon: String, primary: { type: Boolean, default: false } }, { _id: false })],
  games: [new Schema({ name: String, url: String, icon: String }, { _id: false })],
  projects: [new Schema({ title: String, description: String, url: String }, { _id: false })],
  copyright: { type: String, default: "© 2025 Tüm hakları saklıdır." },
  themeSettings: new Schema({
    primary: { type: String, default: '#3DDC84' },
    accent: { type: String, default: '#7129ee' }
  }, { _id: false }),
}, { _id: false });

export interface ISiteConfig extends Document {
    siteData: ISiteData;
}

const SiteConfigSchema = new Schema<ISiteConfig>({
  siteData: { type: SiteDataSchema, required: true, default: {} }, 
}, { timestamps: true });

export const SiteConfig = mongoose.model<ISiteConfig>('SiteConfig', SiteConfigSchema);