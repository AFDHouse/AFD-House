import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import admin from "firebase-admin";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import firebaseConfig from "./firebase-applet-config.json";

// Initialize Firebase Admin
try {
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
} catch (error) {
  // Already initialized or failed
}

const JWT_SECRET = process.env.JWT_SECRET || "afd-house-secret-key-2024";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON body parser
  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Auth APIs
  app.post("/api/auth/register", async (req, res) => {
    const { name, email, phone, countryCode, password } = req.body;
    
    try {
      const db = admin.firestore();
      
      // Check if user exists
      let existingUser;
      if (email) {
        existingUser = await db.collection("users").where("email", "==", email).get();
      } else if (phone) {
        existingUser = await db.collection("users").where("phone", "==", phone).get();
      }

      if (existingUser && !existingUser.empty) {
        return res.status(400).json({ success: false, message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        name,
        email: email || null,
        phone: phone || null,
        countryCode: countryCode || null,
        password: hashedPassword,
        role: "user",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await db.collection("users").add(newUser);
      const token = jwt.sign({ id: docRef.id, email, role: "user" }, JWT_SECRET, { expiresIn: "7d" });

      res.status(201).json({
        success: true,
        token,
        user: { id: docRef.id, name, email, phone, role: "user" }
      });
    } catch (error: any) {
      console.error("Register error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, phone, password } = req.body;
    
    try {
      const db = admin.firestore();
      let userQuery;

      if (email) {
        userQuery = await db.collection("users").where("email", "==", email).get();
      } else if (phone) {
        userQuery = await db.collection("users").where("phone", "==", phone).get();
      } else {
        return res.status(400).json({ success: false, message: "Email or phone required" });
      }

      if (userQuery.empty) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      const userDoc = userQuery.docs[0];
      const userData = userDoc.data();

      const isPasswordValid = await bcrypt.compare(password, userData.password);
      if (!isPasswordValid) {
        return res.status(401).json({ success: false, message: "Invalid password" });
      }

      const token = jwt.sign({ id: userDoc.id, email: userData.email, role: userData.role }, JWT_SECRET, { expiresIn: "7d" });

      res.json({
        success: true,
        token,
        user: { id: userDoc.id, name: userData.name, email: userData.email, phone: userData.phone, role: userData.role }
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.json({ success: true, message: "Logged out successfully" });
  });

  // OTP System
  const otpStore = new Map<string, { code: string, expires: number }>();

  app.post("/api/auth/otp/send", async (req, res) => {
    const { target, type } = req.body; // target is email or phone, type is 'email' or 'phone'
    if (!target) return res.status(400).json({ success: false, message: "Target required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStore.set(target, { code: otp, expires });

    console.log(`[OTP] Sending ${otp} to ${target} via ${type}`);

    // In a real app, you would send via Nodemailer or Twilio
    // For this build, we return it in the response for easy testing/demo
    res.json({ 
      success: true, 
      message: `OTP sent to ${target}`,
      debug_code: otp // Only for development/demo ease
    });
  });

  app.post("/api/auth/otp/verify", async (req, res) => {
    const { target, code, name, password } = req.body;
    
    const record = otpStore.get(target);
    if (!record || record.code !== code || Date.now() > record.expires) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    otpStore.delete(target);

    try {
      const db = admin.firestore();
      let userQuery;
      
      const isEmail = target.includes('@');
      if (isEmail) {
        userQuery = await db.collection("users").where("email", "==", target).get();
      } else {
        userQuery = await db.collection("users").where("phone", "==", target).get();
      }

      let userDoc;
      let userData;

      if (userQuery.empty) {
        // Create user if they don't exist
        const hashedPassword = password ? await bcrypt.hash(password, 10) : await bcrypt.hash(Math.random().toString(), 10);
        const newUser = {
          name: name || "Anonymous User",
          email: isEmail ? target : null,
          phone: !isEmail ? target : null,
          password: hashedPassword,
          role: "user",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        const ref = await db.collection("users").add(newUser);
        userDoc = await ref.get();
        userData = userDoc.data();
      } else {
        userDoc = userQuery.docs[0];
        userData = userDoc.data();
      }

      const token = jwt.sign(
        { id: userDoc.id, email: userData?.email, role: userData?.role }, 
        JWT_SECRET, 
        { expiresIn: "7d" }
      );

      res.json({
        success: true,
        token,
        user: { id: userDoc.id, name: userData?.name, email: userData?.email, phone: userData?.phone, role: userData?.role }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
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
    // Serving static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
