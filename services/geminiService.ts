import { GoogleGenAI } from "@google/genai";
import { Post } from "../types";

// Note: API key is read from process.env.API_KEY, which is a hard requirement.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const suggestPostTitle = async (content: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Based on the following post content, suggest a short, catchy title (less than 10 words):\n\n---\n${content}\n---`,
    });
    // Use .text to get the string output directly
    const suggestedTitle = response.text.trim().replace(/"/g, ''); // Clean up quotes
    return suggestedTitle;
  } catch (error) {
    console.error("Error suggesting post title:", error);
    return "Post Title";
  }
};

export const summarizePost = async (post: Post): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Summarize the following post in one sentence:\n\nTitle: ${post.title}\nContent: ${post.content}`,
        });
        // Use .text to get the string output directly
        return response.text.trim();
    } catch (error) {
        console.error("Error summarizing post:", error);
        return "Could not summarize post.";
    }
}
