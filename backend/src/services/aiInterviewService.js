const OpenAI = require("openai");
const { config } = require("../utils/config");

// Lazily configure OpenAI so the backend can still run
// when OPENAI_API_KEY is not set. AI endpoints will return
// a clear error instead of crashing the whole server.
const client = config.openAiApiKey
  ? new OpenAI({
      apiKey: config.openAiApiKey,
    })
  : null;

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

function ensureClient() {
  if (!client) {
    const err = new Error(
      "AI features are not configured. Please set OPENAI_API_KEY on the backend."
    );
    err.status = 503;
    throw err;
  }
}

async function generateQuestions({ type, difficulty, techStack }) {
  ensureClient();
  const techStackText =
    techStack && techStack.length
      ? `Focus on these technologies where relevant: ${techStack.join(", ")}.`
      : "You may pick any broadly relevant technologies.";

  const systemPrompt =
    "You are an expert interview question generator for university students preparing for placements. " +
    "You create concise, clear questions suitable for spoken mock interviews.";

  const userPrompt = `
Generate exactly 5 interview questions.
Interview type: ${type}
Difficulty: ${difficulty}
${techStackText}

Return JSON ONLY with this shape:
{
  "questions": [
    { "prompt": "question text", "category": "short label like DSA|OS|HR" }
  ]
}
  `.trim();

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.6,
  });

  const content = response.choices[0]?.message?.content || "";

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (err) {
    // Try to salvage JSON from within code fences or text
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Failed to parse interview questions from AI.");
    }
    parsed = JSON.parse(match[0]);
  }

  if (!parsed.questions || !Array.isArray(parsed.questions)) {
    throw new Error("AI did not return a questions array.");
  }

  const questions = parsed.questions
    .slice(0, 5)
    .map((q) => ({
      prompt: String(q.prompt || "").trim(),
      category: q.category ? String(q.category).trim() : undefined,
    }))
    .filter((q) => q.prompt);

  if (questions.length !== 5) {
    throw new Error("AI did not return exactly 5 valid questions.");
  }

  return questions;
}

async function evaluateAnswer({
  type,
  difficulty,
  techStack,
  question,
  answer,
}) {
  ensureClient();
  const techStackText =
    techStack && techStack.length
      ? `Candidate mentioned tech stack: ${techStack.join(", ")}.`
      : "No specific tech stack provided.";

  const systemPrompt =
    "You are an experienced interview evaluator for software engineering and campus placements. " +
    "You grade concise spoken-style answers on a 0-10 scale and give actionable feedback.";

  const userPrompt = `
Interview type: ${type}
Difficulty: ${difficulty}
${techStackText}

Question: ${question}
Candidate answer: ${answer}

Evaluate this single answer. Return JSON ONLY with:
{
  "score": 0-10 number (can be decimal),
  "feedback": "short paragraph of feedback",
  "weakAreas": ["topic1", "topic2", ...]
}
  `.trim();

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.4,
  });

  const content = response.choices[0]?.message?.content || "";

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (err) {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Failed to parse evaluation from AI.");
    }
    parsed = JSON.parse(match[0]);
  }

  const score = Number(parsed.score);
  const feedback = String(parsed.feedback || "").trim();
  const weakAreas = Array.isArray(parsed.weakAreas)
    ? parsed.weakAreas.map((w) => String(w).trim()).filter(Boolean)
    : [];

  if (Number.isNaN(score)) {
    throw new Error("AI did not return a numeric score.");
  }

  return {
    score: Math.max(0, Math.min(10, score)),
    feedback,
    weakAreas,
  };
}

async function summarizeInterview({ type, difficulty, techStack, qa }) {
  ensureClient();
  const techStackText =
    techStack && techStack.length
      ? `Candidate tech stack: ${techStack.join(", ")}.`
      : "No specific tech stack provided.";

  const systemPrompt =
    "You are an expert career coach summarizing a mock interview performance for a student.";

  const qaText = qa
    .map(
      (item, idx) =>
        `Q${idx + 1}: ${item.question}\nAnswer: ${item.answer}\nScore: ${
          item.score
        }\nFeedback: ${item.feedback}`
    )
    .join("\n\n");

  const userPrompt = `
Interview type: ${type}
Difficulty: ${difficulty}
${techStackText}

Question/answer evaluations:
${qaText}

Provide an overall summary. Return JSON ONLY with:
{
  "overallScore": 0-10 number (can be decimal, typically average),
  "summary": "2-4 sentence summary of performance",
  "weakAreas": ["topic1", "topic2", ...]
}
  `.trim();

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.4,
  });

  const content = response.choices[0]?.message?.content || "";

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (err) {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Failed to parse summary from AI.");
    }
    parsed = JSON.parse(match[0]);
  }

  const overallScore = Number(parsed.overallScore);
  const summary = String(parsed.summary || "").trim();
  const weakAreas = Array.isArray(parsed.weakAreas)
    ? parsed.weakAreas.map((w) => String(w).trim()).filter(Boolean)
    : [];

  if (Number.isNaN(overallScore)) {
    throw new Error("AI did not return an overallScore.");
  }

  return {
    overallScore: Math.max(0, Math.min(10, overallScore)),
    summary,
    weakAreas,
  };
}

module.exports = {
  generateQuestions,
  evaluateAnswer,
  summarizeInterview,
};

