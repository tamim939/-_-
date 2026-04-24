import express from "express";
import cors from "cors";
import axios from "axios";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Proxy Route
  app.post("/api/send", async (req, res) => {
    const { number, type } = req.body;
    
    // Normalize number for Medeasy (e.g., +88017...)
    let medeasyNumber = number;
    if (!medeasyNumber.startsWith("+")) {
      medeasyNumber = medeasyNumber.startsWith("88") ? `+${medeasyNumber}` : `+88${medeasyNumber}`;
    }
    
    // Normalize number for Bikroy (e.g., 017...)
    let localNumber = number;
    if (localNumber.startsWith("+88")) localNumber = localNumber.slice(3);
    else if (localNumber.startsWith("88")) localNumber = localNumber.slice(2);

    try {
      if (type === "medeasy") {
        const response = await axios.post(`https://api.medeasy.health/api/send-otp/`, 
          { registration_phone: medeasyNumber }, 
          {
            headers: {
              "Origin": "https://medeasy.health",
              "Referer": "https://medeasy.health/",
              "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
              "Accept": "application/json",
              "Content-Type": "application/json"
            }
          }
        );
        return res.json({ success: true, data: response.data });
      } else if (type === "bikroy") {
        const response = await axios.get(`https://bikroy.com/data/phone_number_login/verifications/phone_login?phone=${localNumber}`, {
          headers: {
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.9",
            "Referer": "https://bikroy.com/bn/users/login",
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
            "X-Bikroy-Origin": "DASHBOARD"
          }
        });
        return res.json({ success: true, data: response.data });
      }
      res.status(400).json({ error: "Invalid API type" });
    } catch (error: any) {
      console.error(`[SERVER] ERROR [${type}]:`, error.message);
      res.status(error.response?.status || 500).json({ 
        error: error.message,
        details: error.response?.data
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
