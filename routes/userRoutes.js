const express = require("express");
const router = express.Router();
const { loginUser, getAllUsers, getUserById, registerUser } = require("../controllers/userController");

console.log("User routes loaded");


router.post("/login", loginUser);
router.post("/register", registerUser);
router.get("/", getAllUsers);
router.get("/:id", getUserById);

module.exports = router;
