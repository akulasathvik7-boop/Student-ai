const express = require("express");
const fs = require("fs");
const path = require("path");
const { Note } = require("../models/Note");
const { User } = require("../models/User");
const { authRequired, requireRole, ROLES } = require("../middleware/auth");
const { upload } = require("../middleware/upload");

const router = express.Router();

// Create/upload a note (student)
router.post(
  "/",
  authRequired,
  upload,
  async (req, res, next) => {
    try {
      const { title, subject, branch, semester } = req.body;

      if (!title || !subject || !branch || !semester) {
        return res
          .status(400)
          .json({ message: "title, subject, branch, semester are required." });
      }

      if (!req.file) {
        return res.status(400).json({ message: "PDF file is required." });
      }

      const fileUrl = `/uploads/notes/${req.file.filename}`;

      const note = await Note.create({
        title,
        subject,
        branch,
        semester,
        fileUrl,
        uploadedBy: req.user.id,
        approved: false,
      });

      return res.status(201).json({ note: note.toSafeJSON() });
    } catch (err) {
      return next(err);
    }
  }
);

// List notes (students) with filters/search - only approved
router.get("/", authRequired, async (req, res, next) => {
  try {
    const { branch, semester, subject, q } = req.query;
    const filter = { approved: true };

    if (branch) filter.branch = branch;
    if (semester) filter.semester = semester;
    if (subject) filter.subject = subject;
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { subject: { $regex: q, $options: "i" } },
      ];
    }

    const notes = await Note.find(filter)
      .sort({ createdAt: -1 })
      .populate("uploadedBy", "name email");

    return res.json({ notes: notes.map((n) => n.toSafeJSON()) });
  } catch (err) {
    return next(err);
  }
});

// Get single note (must be approved or uploadedBy self)
router.get("/:id", authRequired, async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found." });
    }

    if (!note.approved && note.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Note not accessible." });
    }

    return res.json({ note: note.toSafeJSON() });
  } catch (err) {
    return next(err);
  }
});

// Download note - increments download count then redirects to file
router.get("/:id/download", authRequired, async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found." });
    }
    if (!note.approved && note.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Note not accessible." });
    }

    note.downloads += 1;
    await note.save();

    const relativePath = note.fileUrl.replace("/uploads/", "");
    const absolutePath = path.join(process.cwd(), "uploads", relativePath);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: "File not found on server." });
    }

    return res.download(absolutePath, path.basename(absolutePath));
  } catch (err) {
    return next(err);
  }
});

// Bookmark a note (toggle)
router.post("/:id/bookmark", authRequired, async (req, res, next) => {
  try {
    const noteId = req.params.id;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const idx = user.bookmarkedNotes.findIndex(
      (id) => id.toString() === noteId
    );

    let bookmarked;
    if (idx === -1) {
      user.bookmarkedNotes.push(noteId);
      bookmarked = true;
    } else {
      user.bookmarkedNotes.splice(idx, 1);
      bookmarked = false;
    }

    await user.save();

    return res.json({ bookmarked });
  } catch (err) {
    return next(err);
  }
});

// List bookmarked notes
router.get("/me/bookmarks/list", authRequired, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate(
      "bookmarkedNotes"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const notes =
      user.bookmarkedNotes?.map((n) =>
        typeof n.toSafeJSON === "function" ? n.toSafeJSON() : n
      ) || [];

    return res.json({ notes });
  } catch (err) {
    return next(err);
  }
});

// Rate a note (1-5 stars)
router.post("/:id/rate", authRequired, async (req, res, next) => {
  try {
    const { rating } = req.body;
    const value = Number(rating);
    if (!value || value < 1 || value > 5) {
      return res
        .status(400)
        .json({ message: "rating must be a number between 1 and 5." });
    }

    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found." });
    }
    if (!note.approved && note.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Note not accessible." });
    }

    const existingIdx = note.ratings.findIndex(
      (r) => r.user.toString() === req.user.id
    );
    if (existingIdx === -1) {
      note.ratings.push({ user: req.user.id, value });
    } else {
      note.ratings[existingIdx].value = value;
    }

    await note.save();

    return res.json({
      note: note.toSafeJSON(),
    });
  } catch (err) {
    return next(err);
  }
});

// ADMIN: list pending notes
router.get(
  "/admin/pending",
  authRequired,
  requireRole(ROLES.ADMIN),
  async (_req, res, next) => {
    try {
      const notes = await Note.find({ approved: false })
        .sort({ createdAt: 1 })
        .populate("uploadedBy", "name email");

      return res.json({ notes: notes.map((n) => n.toSafeJSON()) });
    } catch (err) {
      return next(err);
    }
  }
);

// ADMIN: approve note
router.post(
  "/:id/approve",
  authRequired,
  requireRole(ROLES.ADMIN),
  async (req, res, next) => {
    try {
      const note = await Note.findById(req.params.id);
      if (!note) {
        return res.status(404).json({ message: "Note not found." });
      }

      note.approved = true;
      await note.save();

      return res.json({ note: note.toSafeJSON() });
    } catch (err) {
      return next(err);
    }
  }
);

// ADMIN: reject note (delete)
router.post(
  "/:id/reject",
  authRequired,
  requireRole(ROLES.ADMIN),
  async (req, res, next) => {
    try {
      const note = await Note.findById(req.params.id);
      if (!note) {
        return res.status(404).json({ message: "Note not found." });
      }

      // Remove physical file if present
      if (note.fileUrl) {
        const relativePath = note.fileUrl.replace("/uploads/", "");
        const absolutePath = path.join(process.cwd(), "uploads", relativePath);
        if (fs.existsSync(absolutePath)) {
          fs.unlinkSync(absolutePath);
        }
      }

      await note.deleteOne();

      return res.json({ message: "Note rejected and removed." });
    } catch (err) {
      return next(err);
    }
  }
);

// ADMIN: delete inappropriate note (same as reject, but explicit DELETE)
router.delete(
  "/:id",
  authRequired,
  requireRole(ROLES.ADMIN),
  async (req, res, next) => {
    try {
      const note = await Note.findById(req.params.id);
      if (!note) {
        return res.status(404).json({ message: "Note not found." });
      }

      if (note.fileUrl) {
        const relativePath = note.fileUrl.replace("/uploads/", "");
        const absolutePath = path.join(process.cwd(), "uploads", relativePath);
        if (fs.existsSync(absolutePath)) {
          fs.unlinkSync(absolutePath);
        }
      }

      await note.deleteOne();

      return res.json({ message: "Note deleted." });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;

