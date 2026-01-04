import { GoogleGenAI, Type, Schema } from "@google/genai";
import {
  Budget,
  IncomeStream,
  GeminiResponse,
  Transaction,
  ChatMessage,
} from "../types";

const genAI = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

const MODEL_NAME = "gemini-2.5-flash";

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    message: {
      type: Type.STRING,
      description: "Freddy's response. Concise, clear, and slightly refined.",
    },
    actions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: {
            type: Type.STRING,
            enum: [
              "LOG_EXPENSE",
              "CREATE_BUDGET",
              "REQUEST_BUDGET_CREATION",
              "NONE",
            ],
          },
          data: {
            type: Type.OBJECT,
            nullable: true,
            properties: {
              amount: { type: Type.NUMBER },
              limit: { type: Type.NUMBER },
              category: { type: Type.STRING },
              item: { type: Type.STRING },
            },
          },
        },
        required: ["type"],
      },
    },
  },
  required: ["message", "actions"],
};

export const processUserMessage = async (
  userText: string,
  chatHistory: ChatMessage[],
  budgets: Budget[],
  incomeStreams: IncomeStream[],
  recentTransactions: Transaction[]
): Promise<GeminiResponse> => {
  const budgetContext = budgets
    .map((b) => `${b.category}: Limit ${b.limit}, Current ${b.spent}`)
    .join("\n");

  const historyContext = chatHistory
    .slice(-6)
    .map((msg) => `${msg.role === "user" ? "User" : "Freddy"}: ${msg.text}`)
    .join("\n");

  const prompt = `
    You are Freddy. You represent clarity in finance. You are concise and deliberate.
    
    Context:
    Budgets: ${budgetContext || "None."}
    History: ${historyContext}

    Current User Input: "${userText}"

    Instructions:
    1. Parse ALL expenses mentioned in the user's message, even if there are multiple.
    2. For each expense, determine the appropriate category:
       - Map vendors to categories (e.g., "Chowdeck" -> "Food", "Uber" -> "Transport", "tangerine" -> "Food", "chocolate" -> "Food")
       - Personal names (e.g., "my sister", "John") -> "Personal" or "Family"
    3. If a category exists in the budgets, use LOG_EXPENSE action.
    4. If a category doesn't exist, use REQUEST_BUDGET_CREATION action and ask the user if they want to create it.
    5. Return multiple actions if there are multiple expenses.
    
    Examples:
    - "I spent 4500 on tangerine, 2k on chocolate, 5k on my sister" should create 3 actions:
      * LOG_EXPENSE: 4500 to Food (tangerine)
      * LOG_EXPENSE: 2000 to Food (chocolate)  
      * REQUEST_BUDGET_CREATION or LOG_EXPENSE: 5000 to Personal/Family (my sister)
    
    Personality:
    - Use fewer words.
    - Be helpful but not chatty.
  `;

  try {
    const response = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    return JSON.parse(response.text || "{}") as GeminiResponse;
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      message: "I couldn't process that. Please try again.",
      actions: [{ type: "NONE" }],
    };
  }
};
