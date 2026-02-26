const express = require("express");
const {
  authRequired,
} = require("../middleware/auth");
const {
  Interview,
  INTERVIEW_TYPES,
  DIFFICULTY_LEVELS,
} = require("../models/Interview");
const {
  generateQuestions,
  evaluateAnswer,
  summarizeInterview,
} = require("../services/aiService");

const router = express.Router();

const VALID_TYPES = Object.values(INTERVIEW_TYPES);
const VALID_DIFFICULTY = Object.values(DIFFICULTY_LEVELS);

// Start a new interview
router.post("/start", authRequired, async (req, res, next) => {
  try {
    const { type, difficulty, techStack } = req.body;

    if (!type || !VALID_TYPES.includes(type)) {
      return res
        .status(400)
        .json({ message: `type must be one of: ${VALID_TYPES.join(", ")}` });
    }

    if (!difficulty || !VALID_DIFFICULTY.includes(difficulty)) {
      return res.status(400).json({
        message: `difficulty must be one of: ${VALID_DIFFICULTY.join(", ")}`,
      });
    }

    const normalizedTechStack = Array.isArray(techStack)
      ? techStack.map((t) => String(t).trim()).filter(Boolean)
      : [];

    const questions = await generateQuestions({
      type,
      difficulty,
      techStack: normalizedTechStack,
    });

    const interview = await Interview.create({
      userId: req.user.id,
      type,
      difficulty,
      techStack: normalizedTechStack,
      questions,
      answers: [],
    });

    return res.status(201).json({
      interviewId: interview._id.toString(),
      questionIndex: 0,
      totalQuestions: questions.length,
      question: questions[0],
    });
  } catch (err) {
    return next(err);
  }
});

// Submit answer for a specific question
router.post("/:id/answer", authRequired, async (req, res, next) => {
  try {
    const { questionIndex, answer } = req.body;

    const idx = Number(questionIndex);
    if (!Number.isInteger(idx) || idx < 0 || idx > 4) {
      return res
        .status(400)
        .json({ message: "questionIndex must be an integer between 0 and 4." });
    }

    if (!answer || typeof answer !== "string" || !answer.trim()) {
      return res
        .status(400)
        .json({ message: "answer text is required." });
    }

    const interview = await Interview.findById(req.params.id);
    if (!interview || interview.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: "Interview not found." });
    }

    const question = interview.questions[idx];
    if (!question) {
      return res.status(400).json({ message: "Invalid question index." });
    }

    const alreadyAnswered = interview.answers.find(
      (a) => a.questionIndex === idx
    );

    const evaluation = await evaluateAnswer({
      type: interview.type,
      difficulty: interview.difficulty,
      techStack: interview.techStack,
      question: question.prompt,
      answer,
    });

    if (alreadyAnswered) {
      alreadyAnswered.text = answer;
      alreadyAnswered.score = evaluation.score;
      alreadyAnswered.correctness = evaluation.correctness;
      alreadyAnswered.clarity = evaluation.clarity;
      alreadyAnswered.depth = evaluation.depth;
      alreadyAnswered.communication = evaluation.communication;
      alreadyAnswered.feedback = evaluation.feedback;
      alreadyAnswered.weakAreas = evaluation.weakAreas;
    } else {
      interview.answers.push({
        questionIndex: idx,
        text: answer,
        score: evaluation.score,
        correctness: evaluation.correctness,
        clarity: evaluation.clarity,
        depth: evaluation.depth,
        communication: evaluation.communication,
        feedback: evaluation.feedback,
        weakAreas: evaluation.weakAreas,
      });
    }

    // If all 5 questions answered, compute final summary
    let isComplete = false;
    if (interview.answers.length === interview.questions.length) {
      const qa = interview.answers
        .sort((a, b) => a.questionIndex - b.questionIndex)
        .map((a) => ({
          question: interview.questions[a.questionIndex].prompt,
          answer: a.text,
          score: a.score,
          feedback: a.feedback,
        }));

      const summary = await summarizeInterview({
        type: interview.type,
        difficulty: interview.difficulty,
        techStack: interview.techStack,
        qa,
      });

      interview.score = summary.overallScore;
      interview.feedback = summary.summary;
      isComplete = true;
    }

    await interview.save();

    const nextIndex = idx + 1;
    const hasNext = nextIndex < interview.questions.length;

    return res.json({
      questionIndex: idx,
      question: question,
      answer: {
        text: answer,
        score: evaluation.score,
        correctness: evaluation.correctness,
        clarity: evaluation.clarity,
        depth: evaluation.depth,
        communication: evaluation.communication,
        feedback: evaluation.feedback,
        weakAreas: evaluation.weakAreas,
      },
      nextQuestion: hasNext ? interview.questions[nextIndex] : null,
      nextIndex: hasNext ? nextIndex : null,
      isComplete,
      finalScore: isComplete ? interview.score : null,
      finalFeedback: isComplete ? interview.feedback : null,
    });
  } catch (err) {
    return next(err);
  }
});

// Get a single interview (for review)
router.get("/:id", authRequired, async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview || interview.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: "Interview not found." });
    }

    return res.json({ interview });
  } catch (err) {
    return next(err);
  }
});

// List current user's interviews (history)
router.get("/", authRequired, async (req, res, next) => {
  try {
    const interviews = await Interview.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    return res.json({ interviews });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

