import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "career-coach", // Unique app ID
  name: "Career Coach",
  credentials: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
    },
  },
});
