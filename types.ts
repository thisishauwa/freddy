export enum Currency {
  USD = "$",
  NGN = "₦",
  EUR = "€",
  GBP = "£",
  JPY = "¥",
  INR = "₹",
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  color: string;
}

export interface IncomeStream {
  id: string;
  source: string;
  amount: number;
}

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  currency: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: number;
}

export interface GeminiAction {
  type: "LOG_EXPENSE" | "CREATE_BUDGET" | "REQUEST_BUDGET_CREATION" | "NONE";
  data?: {
    amount?: number;
    category?: string;
    item?: string;
    limit?: number;
  };
}

export interface GeminiResponse {
  message: string;
  actions: GeminiAction[];
}
