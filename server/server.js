
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(express.json());

// OpenAI connection (optional)
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Demo receptionist responses
function demoReply(message) {
  const text = message.toLowerCase();

  if (text.includes("hello") || text.includes("hi")) {
    return "Hello! Welcome to A21 Receptionist AI. How may I assist you today?";
  }

  if (text.includes("hours") || text.includes("open")) {
    return "Thank you for contacting us! Please let us know which business hours you would like to confirm.";
  }

  if (text.includes("price") || text.includes("cost")) {
    return "Thank you for your interest. Please tell us which service you would like a price for.";
  }

  if (text.includes("appointment") || text.includes("booking")) {
    return "I'd be happy to help with an appointment. What date and time would you prefer?";
  }

  if (text.includes("location") || text.includes("address")) {
    return "Please let us know which branch or location you would like information about.";
  }

  if (text.includes("thank")) {
    return "You're welcome! Thank you for contacting A21. Have a wonderful day!";
  }

  return "Thank you for contacting A21 Receptionist AI. I'm currently operating in free demo mode. Please tell me more about how I can help you.";
}

// Home route
app.get("/", (req, res) => {
  res.send("A21 Receptionist AI Server is running!");
});

// Chat route
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({
      error: "Please enter a message."
    });
  }

  // Free demo mode
  if (process.env.DEMO_MODE === "true" || !openai) {
    return res.json({
      reply: demoReply(message),
      mode: "demo"
    });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: message
        }
      ]
    });

    res.json({
      reply: response.choices[0].message.content,
      mode: "ai"
    });

  } catch (error) {
    console.error("OpenAI Error:", error);

    // Use demo responses if OpenAI is unavailable
    res.json({
      reply: demoReply(message),
      mode: "demo"
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`A21 Receptionist AI Server running on port ${PORT}`);
});
