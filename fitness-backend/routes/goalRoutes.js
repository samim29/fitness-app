const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { setGoal, getGoal } = require("../controllers/goalController");

router.post("/", protect, setGoal);
router.get("/", protect, getGoal);

module.exports = router;
