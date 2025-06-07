import express from "express";
import { signup, login } from "../services/authService.js"; // Adjust path if needed

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

export default router;
