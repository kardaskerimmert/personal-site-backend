import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import fs from "fs/promises";
import path from "path";
import session from "express-session";

declare module "express-session" {
  interface SessionData {
    loggedIn: boolean;
    username: string;
  }
}

const DATA_FILE = path.resolve(__dirname, "..", "data.json");
const PORT = Number(process.env.PORT || 4000);

type AdminRecord = { username: string; passwordHash: string } | null;
type SiteData = {
  title: string;
  subtitle: string;
  email: string;
  profileImage: string;
  topLinks: Array<{ label: string; url: string }>;
  socialLinks: Array<{ platform: string; url: string; icon: string }>;
  technologies: Array<{ name: string; icon: string; primary?: boolean }>;
  games: Array<{ name: string; url: string; icon: string }>;
  projects: Array<{ title: string; description: string; url: string }>;
  copyright: string;
};
type DataFile = {
  allowed: boolean;
  admin: AdminRecord;
  siteData: SiteData;
};

const app = express();

// 1. CORS AYARLARI
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

app.use(express.json());

// 2. SESSION (OTURUM) AYARLARI
app.use(session({
  name: 'fearlinn_session',
  secret: 'bu-cok-gizli-bir-anahtar-degistirilebilir',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  }
}));

async function readData(): Promise<DataFile> {
  try {
    const txt = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(txt) as DataFile;
  } catch (err: any) {
    if (err.code === "ENOENT") {
      const initial: DataFile = {
        allowed: false,
        admin: null,
        siteData: {
          title: "Benim Kişisel Web Sitem",
          subtitle: "Code, Games, Music",
          email: "benim@kisisel.sitem",
          profileImage: "https://avatar.iran.liara.run/public",
          topLinks: [],
          socialLinks: [],
          technologies: [],
          games: [],
          projects: [],
          copyright: "© 2025 Tüm hakları saklıdır.",
        },
      };
      await writeData(initial);
      return initial;
    }
    throw err;
  }
}

async function writeData(data: DataFile) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

// GET /api/allowed
app.get("/api/allowed", async (req, res) => {
  try {
    const data = await readData();
    res.json({ allowed: Boolean(data.allowed) });
  } catch (err) {
    res.status(500).send("Error reading data");
  }
});

// GET /api/site-data
app.get("/api/site-data", async (req, res) => {
  try {
    const data = await readData();
    res.json({ siteData: data.siteData });
  } catch (err) {
    res.status(500).send("Error reading site data");
  }
});

// GET /api/admin/exists
app.get("/api/admin/exists", async (req, res) => {
  try {
    const data = await readData();
    res.json({ 
      exists: Boolean(data.admin),
      loggedIn: req.session.loggedIn === true
    });
  } catch (err) {
    res.status(500).send("Error reading data");
  }
});

// POST /api/admin/setup
app.post("/api/admin/setup", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).send("username and password required");

    const data = await readData();
    if (data.admin) return res.status(409).send("admin already exists");

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    data.admin = { username, passwordHash: hash };
    data.allowed = true;
    data.siteData = {
      title: "Benim Kişisel Web Sitem",
      subtitle: "Benim, Kişisel, Sitem",
      email: "benim@kisisel.sitem",
      profileImage: "https://avatar.iran.liara.run/public",
      topLinks: [],
      socialLinks: [],
      technologies: [],
      games: [],
      projects: [],
      copyright: "© 2025 Tüm hakları saklıdır.",
    };
    await writeData(data);
    
    req.session.loggedIn = true;
    req.session.username = username;
    req.session.save(() => {
        res.status(200).json({ ok: true });
    });
    
  } catch (err) {
    res.status(500).send("Error creating admin");
  }
});

// POST /api/admin/login
app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).send("username and password required");

    const data = await readData();
    if (!data.admin) return res.status(404).send("no admin");

    if (data.admin.username !== username) return res.status(401).send("invalid credentials");

    const ok = await bcrypt.compare(password, data.admin.passwordHash);
    if (!ok) return res.status(401).send("invalid credentials");

    req.session.loggedIn = true;
    req.session.username = username;

    req.session.save(() => {
        res.status(200).json({ ok: true });
    });

  } catch (err) {
    res.status(500).send("Error during login");
  }
});

// POST /api/site-data (KORUMALI)
app.post("/api/site-data", async (req, res) => {
  try {
    if (!req.session.loggedIn) {
        return res.status(401).send("Unauthorized");
    }

    const body = req.body || {};
    const siteData = body.siteData as SiteData | undefined;
    if (!siteData) return res.status(400).send("siteData required in body");

    const data = await readData();
    data.siteData = siteData;
    await writeData(data);

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).send("Error writing site data");
  }
});

app.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
});