const mongoose = require("mongoose");

const INTERVIEW_TYPES = {
  TECHNICAL: "technical",
  HR: "hr",
  MIXED: "mixed",
};

const DIFFICULTY_LEVELS = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
};

const questionSchema = new mongoose.Schema(
  {
    prompt: { type: String, required: true },
    category: { type: String },
  },
  { _id: false }
);

const answerSchema = new mongoose.Schema(
  {
    questionIndex: { type: Number, required: true },
    text: { type: String, required: true },
    score: { type: Number, min: 0, max: 10 },
    correctness: { type: Number, min: 0, max: 4 },
    clarity: { type: Number, min: 0, max: 2 },
    depth: { type: Number, min: 0, max: 2 },
    communication: { type: Number, min: 0, max: 2 },
    feedback: { type: String },
    weakAreas: [{ type: String }],
  },
  { _id: false }
);

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(INTERVIEW_TYPES),
      required: true,
    },
    difficulty: {
      type: String,
      enum: Object.values(DIFFICULTY_LEVELS),
      required: true,
    },
    techStack: {
      type: [String],
      default: [],
    },
    questions: {
      type: [questionSchema],
      required: true,
      validate: (arr) => arr.length === 5,
    },
    answers: {
      type: [answerSchema],
      default: [],
    },
    score: {
      type: Number,
      min: 0,
      max: 10,
    },
    feedback: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Interview = mongoose.model("Interview", interviewSchema);

module.exports = {
  Interview,
  INTERVIEW_TYPES,
  DIFFICULTY_LEVELS,
};

