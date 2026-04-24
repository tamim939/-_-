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
    
    // Normalize number for Medeasy (+880...)
    const medeasyNumber = number.startsWith("+88") ? number : (number.startsWith("88") ? `+${number}` : `+88${number}`);
    // Normalize number for Bikroy (Local 10 or 11 digits)
    const localNumber = number.startsWith("+88") ? number.slice(3) : (number.startsWith("88") ? number.slice(2) : number);

    try {
      if (type === "medeasy") {
        const response = await axios.post("https://api.medeasy.health/api/send-otp/", 
          { registration_phone: medeasyNumber },
          {
            headers: {
              "Origin": "https://medeasy.health",
              "Referer": "https://medeasy.health/",
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
          }
        );
        return res.json({ success: true, data: response.data });
      } else if (type === "bikroy") {
        const response = await axios.get(`https://bikroy.com/data/phone_number_login/verifications/phone_login?phone=${localNumber}`, {
          headers: {
            "Origin": "https://bikroy.com",
            "Referer": "https://bikroy.com/bn/users/login",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          }
        });
        return res.json({ success: true, data: response.data });
      }
      res.status(400).json({ error: "Invalid API type" });
    } catch (error: any) {
      console.error(`Error sending via ${type}:`, error.message);
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
