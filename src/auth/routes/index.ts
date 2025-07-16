import { Router } from "express";
import { register, login, logout, signInWithGoogle, getUserInfo } from "../controllers/auth.controller";

const router = Router();
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/user/google",signInWithGoogle)
router.post("/user/info",getUserInfo)

export default router;
