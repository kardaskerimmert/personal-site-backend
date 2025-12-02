[🇬🇧 English](https://github.com//blob/main/README.md) | [🇹🇷 Türkçe](https://github.com/kardaskerimmert/personal-site-backend/blob/main/README.TR.md)


## 📂 Project Structure

```text
src/
├── config/         # Database and environment configurations
├── middleware/     # Auth, Error handling, and Zod validation middlewares
├── models/         # Mongoose models (User, SiteData)
├── routes/         # API Route definitions
├── services/       # Business logic layer
├── utils/          # Utility functions (Logger, etc.)
├── validation/     # Zod schemas for request validation
└── server.ts       # Application entry point

```

## ⚙️ Installation & Setup

### 1. Clone the repository


```bash
git clone https://github.com/kardaskerimmert/personal-site-backend
cd personal-site-backend

```

### 2. Install dependencies

This project uses **pnpm**.


```bash
pnpm install
```

### 3. Environment Variables

Create a `.env` file in the root directory based on `.env.example`:

```
NODE_ENV=development
PORT=4000
MONGO_URI=mongodb://localhost:27017/portfolio
SESSION_SECRET=your_super_secret_session_key
SETUP_TOKEN=your_secure_setup_token_for_admin_creation
CORS_ORIGIN=http://localhost:3000

```

-   **SETUP_TOKEN:** A secret key required to create the first admin user via the API.
    

## 🏃‍♂️ Running the Application

### Development Mode

Runs the server with hot-reload enabled.


```bash
pnpm run dev
```

### Production Build

Compiles TypeScript code to JavaScript in the `dist/` folder.

```bash
pnpm run build
```

### Production Start

Runs the compiled code.

```bash
pnpm start
```

### Deployment with PM2

This project includes an `ecosystem.config.js` for PM2.

```bash
# Start/Restart in production mode
npm run deploy
# OR manually
pm2 start ecosystem.config.js --env production
```

## 📡 API Endpoints

### 🔐 Authentication & Admin

|Method|Endpoint|Description|Auth Required|
|---|---|---|---|
|GET|/api/admin/exists|Check if an admin exists and if session is active|No|
|POST|/api/admin/setup|Create the initial admin account (Requires `setupToken`)|No|
|POST|/api/admin/login|Log in as admin|No|
|POST|/api/admin/logout|Log out and destroy session|Yes|




### 🌍 Site Data
|Method|Endpoint|Description|Auth Required|
|---|---|---|---|
|GET|/api/site-data|Get all public site information|No|
|POST|/api/site-data|Update site information|Yes|


## 🛡️ Security Measures

1.  **Setup Token:** The `/setup` endpoint is protected by a secret token in `.env`. Even if the database is empty, unauthorized users cannot create an admin account.
    
2.  **Strict CORS:** Only allowed origins (configured in `.env`) can access the API.
    
3.  **Input Validation:** All incoming data is validated against Zod schemas. Invalid data is rejected with 400 Bad Request before reaching the controller.
    
4.  **Graceful Shutdown:** The server handles `SIGTERM` and `SIGINT` signals to close database connections and pending requests properly before shutting down.
    

## 📄 License

This project is licensed under the [GNU General Public License v3.0](https://github.com/kardaskerimmert/personal-site-backend/blob/main/LICENSE).
