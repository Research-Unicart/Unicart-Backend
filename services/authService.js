const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

class AuthService {
  async register(userData) {
    const { name, email, password } = userData;
    const existingUser = await User.findByEmail(email);

    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await User.create(name, email, hashedPassword);

    const token = jwt.sign({ userId: result.insertId }, JWT_SECRET, {
      expiresIn: "24h",
    });

    return {
      user: {
        id: result.insertId,
        name,
        email,
      },
      token,
    };
  }

  async login(email, password) {
    const user = await User.findByEmail(email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isValidPassword = await bcrypt.compare(password, user[0].password);
    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign({ userId: user[0].id }, JWT_SECRET, {
      expiresIn: "24h",
    });

    return {
      user: {
        id: user[0].id,
        name: user[0].name,
        email: user[0].email,
      },
      token,
    };
  }
}

module.exports = new AuthService();
