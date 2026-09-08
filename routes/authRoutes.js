const express = require("express");
const router = express.Router();
const { signup, login, verifyEmail, logout, getMe } = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");
const { updateProfile, changePassword ,saveFcmToken} = require("../controllers/authController");

router.post("/signup", signup);
router.post("/login", login);
router.get("/verify-email", verifyEmail);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);
router.post("/fcm-token", protect, saveFcmToken);

module.exports = router;