var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_firebase_admin = __toESM(require("firebase-admin"), 1);
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);

// firebase-applet-config.json
var firebase_applet_config_default = {
  projectId: "kinetic-folio-7sjh2",
  appId: "1:850293114828:web:c54c489eb2af186d19ff69",
  apiKey: "AIzaSyDz0vN58tQyu8kKMvqW5EWPTvpAbk0ZvCc",
  authDomain: "kinetic-folio-7sjh2.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-f8b941b6-1823-4f30-8ade-74c12ba0cb2b",
  storageBucket: "kinetic-folio-7sjh2.firebasestorage.app",
  messagingSenderId: "850293114828",
  measurementId: ""
};

// server.ts
try {
  import_firebase_admin.default.initializeApp({
    projectId: firebase_applet_config_default.projectId
  });
} catch (error) {
}
var JWT_SECRET = process.env.JWT_SECRET || "afd-house-secret-key-2024";
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app.post("/api/auth/register", async (req, res) => {
    const { name, email, phone, countryCode, password } = req.body;
    try {
      const db = import_firebase_admin.default.firestore();
      let existingUser;
      if (email) {
        existingUser = await db.collection("users").where("email", "==", email).get();
      } else if (phone) {
        existingUser = await db.collection("users").where("phone", "==", phone).get();
      }
      if (existingUser && !existingUser.empty) {
        return res.status(400).json({ success: false, message: "User already exists" });
      }
      const hashedPassword = await import_bcryptjs.default.hash(password, 10);
      const newUser = {
        name,
        email: email || null,
        phone: phone || null,
        countryCode: countryCode || null,
        password: hashedPassword,
        role: "user",
        createdAt: import_firebase_admin.default.firestore.FieldValue.serverTimestamp()
      };
      const docRef = await db.collection("users").add(newUser);
      const token = import_jsonwebtoken.default.sign({ id: docRef.id, email, role: "user" }, JWT_SECRET, { expiresIn: "7d" });
      res.status(201).json({
        success: true,
        token,
        user: { id: docRef.id, name, email, phone, role: "user" }
      });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  });
  app.post("/api/auth/login", async (req, res) => {
    const { email, phone, password } = req.body;
    try {
      const db = import_firebase_admin.default.firestore();
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
      const isPasswordValid = await import_bcryptjs.default.compare(password, userData.password);
      if (!isPasswordValid) {
        return res.status(401).json({ success: false, message: "Invalid password" });
      }
      const token = import_jsonwebtoken.default.sign({ id: userDoc.id, email: userData.email, role: userData.role }, JWT_SECRET, { expiresIn: "7d" });
      res.json({
        success: true,
        token,
        user: { id: userDoc.id, name: userData.name, email: userData.email, phone: userData.phone, role: userData.role }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  });
  app.post("/api/auth/logout", (req, res) => {
    res.json({ success: true, message: "Logged out successfully" });
  });
  const otpStore = /* @__PURE__ */ new Map();
  app.post("/api/auth/otp/send", async (req, res) => {
    const { target, type } = req.body;
    if (!target) return res.status(400).json({ success: false, message: "Target required" });
    const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
    const expires = Date.now() + 5 * 60 * 1e3;
    otpStore.set(target, { code: otp, expires });
    console.log(`[OTP] Sending ${otp} to ${target} via ${type}`);
    res.json({
      success: true,
      message: `OTP sent to ${target}`,
      debug_code: otp
      // Only for development/demo ease
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
      const db = import_firebase_admin.default.firestore();
      let userQuery;
      const isEmail = target.includes("@");
      if (isEmail) {
        userQuery = await db.collection("users").where("email", "==", target).get();
      } else {
        userQuery = await db.collection("users").where("phone", "==", target).get();
      }
      let userDoc;
      let userData;
      if (userQuery.empty) {
        const hashedPassword = password ? await import_bcryptjs.default.hash(password, 10) : await import_bcryptjs.default.hash(Math.random().toString(), 10);
        const newUser = {
          name: name || "Anonymous User",
          email: isEmail ? target : null,
          phone: !isEmail ? target : null,
          password: hashedPassword,
          role: "user",
          createdAt: import_firebase_admin.default.firestore.FieldValue.serverTimestamp()
        };
        const ref = await db.collection("users").add(newUser);
        userDoc = await ref.get();
        userData = userDoc.data();
      } else {
        userDoc = userQuery.docs[0];
        userData = userDoc.data();
      }
      const token = import_jsonwebtoken.default.sign(
        { id: userDoc.id, email: userData?.email, role: userData?.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      res.json({
        success: true,
        token,
        user: { id: userDoc.id, name: userData?.name, email: userData?.email, phone: userData?.phone, role: userData?.role }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
//# sourceMappingURL=server.cjs.map
