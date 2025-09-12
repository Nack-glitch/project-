import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, phoneNumber, password, role, farmName, location } = req.body;

    // check if user exists
    const userExists = await User.findOne({ phoneNumber });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      phoneNumber,
      password,
      role,
      farmName,
      location,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      role: user.role,
      farmName: user.farmName,
      location: user.location,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    const user = await User.findOne({ phoneNumber });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        role: user.role,
        farmName: user.farmName,
        location: user.location,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid phone number or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
