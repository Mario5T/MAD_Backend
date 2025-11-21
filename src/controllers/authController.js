import "../db/db.config.js";
import User from "../models/User.js";
import UserSession from "../models/UserSession.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export const signup = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    const emailRaw = typeof email === "string" ? email.toLowerCase().trim() : undefined;
    const phoneRaw = typeof phone === "string" ? phone.trim() : undefined;
    const normEmail = emailRaw ? emailRaw : undefined;
    const normPhone = phoneRaw ? phoneRaw : undefined;

    if (!role || !["student", "driver", "admin"].includes(role)) {
      return res.status(400).json({ error: "Role must be student, driver, or admin" });
    }

    if (role === "student") {
      if (!normEmail || !normEmail.endsWith("@adypu.edu.in")) {
        return res.status(400).json({ error: "Students must use adypu.edu.in email" });
      }
    }

    if (role === "driver") {
      if (!normPhone) {
        return res.status(400).json({ error: "Drivers must provide a phone number" });
      }
    }

    if (role === "admin") {
      if (!normEmail) {
        return res.status(400).json({ error: "Admins must provide an email address" });
      }
    }

    const orConditions = [];
    if (normEmail) orConditions.push({ email: normEmail });
    if (normPhone) orConditions.push({ phone: normPhone });
    const existingUser = orConditions.length
      ? await User.findOne({ $or: orConditions })
      : null;
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createDoc = { name, password: hashedPassword, role };
    if (normEmail) createDoc.email = normEmail;
    if (normPhone) createDoc.phone = normPhone;
    const user = await User.create(createDoc);

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Signup failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    const emailRaw = typeof email === "string" ? email.toLowerCase().trim() : undefined;
    const phoneRaw = typeof phone === "string" ? phone.trim() : undefined;
    const normEmail = emailRaw ? emailRaw : undefined;
    const normPhone = phoneRaw ? phoneRaw : undefined;

    if (!normEmail && !normPhone) {
      return res.status(400).json({ error: "Email or phone is required" });
    }

    const orConditions = [];
    if (normEmail) orConditions.push({ email: normEmail });
    if (normPhone) orConditions.push({ phone: normPhone });
    const user = await User.findOne({ $or: orConditions });

    if (!user) return res.status(404).json({ error: "User not found" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );
    await createSession(user._id, token, req);

    res.json({
      message: "Login successful",
      token,
      role: user.role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
};

export const createSession = async (userId, token, req) => {
  try {
    const ip = req.ip || req.connection?.remoteAddress || "Unknown";
    const userAgent = req.get("User-Agent") || "Unknown";
    const device = userAgent.includes("Mobile") ? "Mobile" : "Desktop";

    const session = await UserSession.create({
      userId,
      token,
      ip,
      userAgent,
      device,
      isActive: true,
    });

    return session;
  } catch (error) {
    console.error("Error creating session:", error);
  }
};

export const updateSessionActivity = async (token) => {
  try {
    await UserSession.updateMany({ token, isActive: true }, { $set: { lastActive: new Date() } });
  } catch (error) {
    console.error("Error updating session activity:", error);
  }
};

export const getUserSessions = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const session = await UserSession.findOne({ token, isActive: true });

    if (!session) {
      return res.status(401).json({ error: "Invalid session" });
    }

    const sessions = await UserSession.find({ userId: session.userId, isActive: true }).sort({ lastActive: -1 });

    res.json({ sessions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching sessions" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const session = await UserSession.findOne({ token, isActive: true });

    if (!session) {
      return res.status(401).json({ error: "Invalid session" });
    }

    const user = await User.findById(session.userId).lean();
    if (!user) return res.status(404).json({ error: "User not found" });
    const { password, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching profile" });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    await UserSession.updateMany({ token }, { $set: { isActive: false } });

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error logging out" });
  }
};

export const getDrivers = async (req, res) => {
  try {
    const drivers = await User.find({ role: "driver" })
      .select("name email phone role")
      .lean();
    res.json({ drivers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching drivers" });
  }
};
