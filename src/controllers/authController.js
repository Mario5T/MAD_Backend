import prisma from "../db/db.config.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export const signup = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!role || !["student", "driver", "admin"].includes(role)) {
      return res.status(400).json({ error: "Role must be student, driver, or admin" });
    }

    if (role === "student") {
      if (!email || !email.endsWith("@adypu.edu.in")) {
        return res.status(400).json({ error: "Students must use adypu.edu.in email" });
      }
    }

    if (role === "driver") {
      if (!phone) {
        return res.status(400).json({ error: "Drivers must provide a phone number" });
      }
    }

    if (role === "admin") {
      if (!email) {
        return res.status(400).json({ error: "Admins must provide an email address" });
      }
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, phone, password: hashedPassword, role },
    });

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Signup failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if (!email && !phone) {
      return res.status(400).json({ error: "Email or phone is required" });
    }

    const user = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );
    await createSession(user.id, token, req);

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

    const session = await prisma.userSession.create({
      data: {
        userId,
        token,
        ip,
        userAgent,
        device,
        isActive: true,
      },
    });

    return session;
  } catch (error) {
    console.error("Error creating session:", error);
  }
};

export const updateSessionActivity = async (token) => {
  try {
    await prisma.userSession.updateMany({
      where: { token, isActive: true },
      data: { lastActive: new Date() },
    });
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

    const session = await prisma.userSession.findFirst({
      where: { token, isActive: true },
      include: { user: true },
    });

    if (!session) {
      return res.status(401).json({ error: "Invalid session" });
    }
    const sessions = await prisma.userSession.findMany({
      where: { userId: session.userId, isActive: true },
      orderBy: { lastActive: "desc" },
    });

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

    const session = await prisma.userSession.findFirst({
      where: { token, isActive: true },
      include: { user: true },
    });

    if (!session) {
      return res.status(401).json({ error: "Invalid session" });
    }

    const { password, ...userWithoutPassword } = session.user;
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

    await prisma.userSession.updateMany({
      where: { token },
      data: { isActive: false },
    });

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error logging out" });
  }
};
