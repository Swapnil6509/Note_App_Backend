const express = require("express");
const router = express.Router();
const { addNote, getNotes, deleteNote } = require("../controllers/notesController");
const authenticateToken = require("../middleware/authMiddleware");

// Protected routes (require JWT)
router.post("/", authenticateToken, addNote);
router.get("/", authenticateToken, getNotes);
router.delete("/:id", authenticateToken, deleteNote);

module.exports = router;
