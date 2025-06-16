const express = require("express");
const router = express.Router();
const {loginUser}= require("../controllers/userController");
const { getAllUsers } = require("../controllers/userController");
const { getUserById } = require("../controllers/userController");

console.log("User routes loaded");


router.post("/login", loginUser);
router.get("/", getAllUsers);
router.get("/:id", getUserById);

module.exports = router;
