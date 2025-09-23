import prisma from "../db/db.config.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
export const signup = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!role || !["student", "driver"].includes(role)) {
      return res.status(400).json({ error: "Role must be student or driver" });
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
