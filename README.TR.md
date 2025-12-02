[🇹🇷 Türkçe](https://github.com/kardaskerimmert/personal-site-backend/blob/main/README.TR.md) | [🇬🇧 English](https://github.com/kardaskerimmert/personal-site-backend/blob/main/README.md)

## 📂 Proje Yapısı

```text
src/
├── config/         # Veritabanı ve ortam yapılandırmaları
├── middleware/     # Kimlik doğrulama, Hata yönetimi ve Zod doğrulama ara katmanları
├── models/         # Mongoose modelleri (User, SiteData)
├── routes/         # API Rota tanımları
├── services/       # İş mantığı katmanı
├── utils/          # Yardımcı fonksiyonlar (Logger, vb.)
├── validation/     # İstek doğrulaması için Zod şemaları
└── server.ts       # Uygulama giriş noktası

```

## ⚙️ Kurulum & Ayarlar

### 1. Depoyu (Repository) Klonlayın


```bash
git clone https://github.com/kardaskerimmert/personal-site-backend
cd personal-site-backend

```

### 2. Bağımlılıkları Yükleyin

Bu proje **pnpm** kullanmaktadır.


```bash
pnpm install
```

### 3. Ortam Değişkenleri

Ana dizinde `.env.example` dosyasını baz alarak bir `.env` dosyası oluşturun:

```
NODE_ENV=development
PORT=4000
MONGO_URI=mongodb://localhost:27017/portfolio
SESSION_SECRET=your_super_secret_session_key
SETUP_TOKEN=your_secure_setup_token_for_admin_creation
CORS_ORIGIN=http://localhost:3000

```

-   **SETUP_TOKEN:** API üzerinden ilk yönetici (admin) kullanıcısını oluşturmak için gereken gizli anahtar.
    

## 🏃‍♂️ Uygulamayı Çalıştırma

### Geliştirme Modu

Sunucuyu hot-reload (anlık yenileme) özelliği açık şekilde çalıştırır.


```bash
pnpm run dev
```

### Prodüksiyon Derlemesi (Build)

TypeScript kodunu `dist/` klasörüne JavaScript olarak derler.

```bash
pnpm run build
```

### Prodüksiyon Başlatma

Derlenmiş kodu çalıştırır.

```bash
pnpm start
```

### PM2 ile Dağıtım (Deployment)

Bu proje PM2 için bir `ecosystem.config.js` dosyası içerir.

```bash
# Prodüksiyon modunda Başlat/Yeniden Başlat
npm run deploy
# VEYA manuel olarak
pm2 start ecosystem.config.js --env production
```

## 📡 API Uç Noktaları (Endpoints)

### 🔐 Kimlik Doğrulama & Yönetici

|Metot|Endpoint|Açıklama|Yetki Gerekli mi|
|---|---|---|---|
|GET|/api/admin/exists|Yönetici var mı ve oturum aktif mi kontrol eder|Hayır|
|POST|/api/admin/setup|İlk yönetici hesabını oluşturur (setupToken gerektirir)|Hayır|
|POST|/api/admin/login|Yönetici olarak giriş yap|Hayır|
|POST|/api/admin/logout|Çıkış yap ve oturumu sonlandır|Evet|




### 🌍 Site Verileri
|Metot|Endpoint|Açıklama|Yetki Gerekli mi|
|---|---|---|---|
|GET|/api/site-data|Tüm herkese açık site bilgilerini getir|Hayır|
|POST|/api/site-data|Site bilgilerini güncelle|Evet|


## 🛡️ Güvenlik Önlemleri

1.  **Setup Token:** `/setup` endpoint `.env` içindeki gizli bir token ile korunmaktadır. Veritabanı boş olsa bile, yetkisiz kullanıcılar yönetici hesabı oluşturamaz.
    
2.  **Strict CORS:** Sadece izin verilen kaynaklar (``.env` içinde yapılandırılan) API'ye erişebilir.
    
3.  **Input Validation (Girdi Doğrulama):** Gelen tüm veriler Zod şemalarına göre doğrulanır. Geçersiz veriler, kontrolcüye (controller) ulaşmadan 400 Bad Request hatası ile reddedilir.
    
4.  **Graceful Shutdown:** Sunucu, kapanmadan önce veritabanı bağlantılarını ve bekleyen istekleri düzgün bir şekilde kapatmak için `SIGTERM` ve `SIGINT` sinyallerini işler.
    

## 📄 Lisans

Bu proje [GNU General Public License (GNU Genel Kamu Lisansı) v3.0](https://github.com/kardaskerimmert/personal-site-backend/blob/main/LICENSE) altında lisanslanmıştır.
