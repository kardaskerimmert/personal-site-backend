import bcrypt from "bcryptjs";
import { SiteConfig, ISiteData } from "../models/SiteData";
import { User, IUser } from "../models/User";
import logger from '../utils/logger';

async function getConfigDocument() {
  try {
    const configDoc = await SiteConfig.findOneAndUpdate(
      {},
      { $setOnInsert: { siteData: {} } }, 
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    return configDoc;
  } catch (error) {
    logger.error(`Config document getirme hatası: ${error}`);
    throw error;
  }
}

// --- PUBLIC API SERVICES ---
export async function getSiteData(): Promise<ISiteData> {
  try {
    const configDoc = await getConfigDocument();
    return configDoc.siteData as ISiteData;
  } catch (error) {
    logger.error(`Site data getirme hatası: ${error}`);
    throw error;
  }
}

export async function updateSiteData(siteData: ISiteData): Promise<void> {
  try {
    const configDoc = await getConfigDocument();
    
    await SiteConfig.updateOne(
      { _id: configDoc._id },
      { $set: { siteData: siteData } }
    );
    
    logger.info('Site data başarıyla güncellendi');
  } catch (error) {
    logger.error(`Site data güncelleme hatası: ${error}`);
    throw error;
  }
}

// --- ADMIN / AUTH SERVICES ---

export async function checkAdminExists(): Promise<{ exists: boolean }> {
  try {
    const count = await User.countDocuments();
    return { exists: count > 0 };
  } catch (error) {
    logger.error(`Admin kontrolü hatası: ${error}`);
    throw error;
  }
}

export async function setupAdmin(username: string, password: string): Promise<IUser> {
  try {
    const count = await User.countDocuments();
    if (count > 0) {
      throw new Error("ADMIN_EXISTS"); 
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username,
      passwordHash
    });
    
    logger.info(`Yeni admin oluşturuldu: ${username}`);
    return newUser;
  } catch (error) {
    logger.error(`Admin setup hatası: ${error}`);
    throw error;
  }
}

export async function authenticateAdmin(username: string, password: string): Promise<IUser | null> {
  try {
    const user = await User.findOne({ username }).select('+passwordHash');

    if (!user) {
      logger.warn(`Kullanıcı bulunamadı: ${username}`);
      return null; 
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    
    if (!isMatch) {
      logger.warn(`Yanlış şifre: ${username}`);
      return null;
    }

    return user;
  } catch (error) {
    logger.error(`Authenticasyon hatası: ${error}`);
    throw error;
  }
}