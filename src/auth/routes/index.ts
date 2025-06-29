import { Router } from "express";
import { register, login, logout, signInWithGoogle } from "../controllers/auth.controller";

const router = Router();
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/user/google",signInWithGoogle)

export default router;
