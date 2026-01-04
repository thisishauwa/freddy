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
              "TRANSFER_BUDGET",
              "GIVE_ADVICE",
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
              fromCategory: { type: Type.STRING },
              toCategory: { type: Type.STRING },
              advice: { type: Type.STRING },
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
    
    2. For each expense, FIRST check the existing budgets list above:
       - Look for an EXACT or CLOSE match in the existing budgets
       - If a matching budget exists, use LOG_EXPENSE with that exact budget name
       - Only suggest a new category if NO existing budget fits
    
    3. Category matching rules (only if creating new budget):
       
       FOOD ITEMS (suggest "Food" category):
       - Fruits: tangerine, orange, apple, banana, etc.
       - Snacks: chocolate, candy, chips, etc.
       - Restaurants: Chowdeck, McDonald's, KFC, etc.
       - Groceries: supermarket, grocery, etc.
       
       TRANSPORT (suggest "Transport" category):
       - Uber, Lyft, taxi, bus, train, gas, fuel
       
       PERSONAL/FAMILY (suggest "Personal" category):
       - Payments to people: "my sister", "John", "mom", "friend"
       - Gifts, loans to individuals
       
       LIFESTYLE (suggest "Lifestyle" category):
       - Entertainment: movies, concerts, games
       - Shopping: clothes, accessories, electronics
       - Subscriptions: Netflix, Spotify, gym
       
    4. Action logic:
       - If matching budget EXISTS → LOG_EXPENSE with exact budget name
       - If NO matching budget → REQUEST_BUDGET_CREATION and ask user
       - When user confirms (says "yes", "ok", "sure", "create it", etc.) → CREATE_BUDGET with category, limit, and amount
    
    5. IMPORTANT: When user confirms budget creation, you MUST:
       - Use CREATE_BUDGET action
       - Include the category name
       - Include a suggested limit (e.g., 5000 or higher than the expense)
       - Include the original amount to log the transaction
       - Include the item description
    
    6. FINANCIAL ADVICE (use GIVE_ADVICE action):
       - When user asks "can I afford X?" or "how much can I spend on Y?"
       - Calculate based on current surplus and budget remaining
       - Be honest and practical
       - Example: "You have $2,500 remaining. You can afford the $800 laptop."
    
    7. BUDGET TRANSFERS (use TRANSFER_BUDGET action):
       - When user says "move X from A to B" or "transfer X from A budget to B"
       - Include fromCategory, toCategory, and amount
       - Confirm the transfer in your message
       - Example: "Moved $500 from Food to Entertainment."
    
    Examples:
    - "I spent 4500 on tangerine, 2k on chocolate, 5k on my sister" should create 3 actions:
      * LOG_EXPENSE: 4500 to Food (tangerine is a fruit)
      * LOG_EXPENSE: 2000 to Food (chocolate is food)  
      * REQUEST_BUDGET_CREATION: Ask to create "Personal" budget for 5000 (my sister is a person)
    
    - If user says "yes" after being asked to create a budget:
      * CREATE_BUDGET: Create the budget with suggested limit and log the pending transaction
    
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
