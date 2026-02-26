const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid"); // Cryptographically secure standard
const { config } = require("../utils/config");

const notesUploadDir = path.join(process.cwd(), config.uploadDir, "notes");

if (!fs.existsSync(notesUploadDir)) {
  fs.mkdirSync(notesUploadDir, { recursive: true });
}

// Security: Use MemoryStorage to validate magic bytes before writing to disk
const storage = multer.memoryStorage();

function fileFilter(_req, file, cb) {
  // Primary MIME Validation
  if (file.mimetype !== "application/pdf") {
    return cb(new Error("Only PDF files are allowed."), false);
  }

  // Extension check to prevent basic spoofing (.php.pdf)
  if (!file.originalname.toLowerCase().endsWith(".pdf")) {
    return cb(new Error("File must end with .pdf extension."), false);
  }

  cb(null, true);
}

const uploader = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Strict 10MB limit
  },
});

// Middleware to wrap multer, validate magic bytes, and save safely
function upload(req, res, next) {
  const singleUpload = uploader.single("file");

  singleUpload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: { message: err.message } });
    }

    if (!req.file) {
      return next(); // Some routes might not include a file
    }

    // Security Hardening: Validate Magic Bytes for PDF (%PDF-)
    const buffer = req.file.buffer;
    if (buffer.length < 5) {
      return res.status(400).json({ success: false, error: { message: "Invalid file format." } });
    }

    // PDF Magic bytes are 0x25 0x50 0x44 0x46 0x2D ('%PDF-')  
    const magicBytes = buffer.toString("hex", 0, 5);
    if (magicBytes !== "255044462d") {
      return res.status(400).json({ success: false, error: { message: "File contents do not match PDF format." } });
    }

    // Generate secure randomized filename to stop Path Traversal
    const safeFilename = `${uuidv4()}.pdf`;
    const finalPath = path.join(notesUploadDir, safeFilename);

    try {
      fs.writeFileSync(finalPath, buffer);

      // Mimic classic multer req.file object for downstream controllers
      req.file.filename = safeFilename;
      req.file.path = finalPath;

      next();
    } catch (fsErr) {
      return res.status(500).json({ success: false, error: { message: "Failed to save file securely." } });
    }
  });
}

module.exports = { upload };

