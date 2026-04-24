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
        // Medeasy often prefers a POST with the number in body, but let's ensure headers are tight
        const response = await axios.post(`https://api.medeasy.health/api/send-otp/`, 
          { registration_phone: medeasyNumber }, 
          {
            headers: {
              "accept": "application/json, text/plain, */*",
              "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
              "content-type": "application/json",
              "origin": "https://medeasy.health",
              "referer": "https://medeasy.health/",
              "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
            }
          }
        );
        return res.json({ success: true, data: response.data });
      } else if (type === "bikroy") {
        // For Bikroy, we use the local 11-digit or 10-digit format
        const response = await axios.get(`https://bikroy.com/data/phone_number_login/verifications/phone_login?phone=${localNumber}`, {
          headers: {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            "pragma": "no-cache",
            "priority": "u=1, i",
            "referer": "https://bikroy.com/bn/users/login",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            "x-bikroy-origin": "DASHBOARD"
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
