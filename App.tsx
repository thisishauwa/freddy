import React, { useState, useEffect, useMemo } from "react";
import {
  Budget,
  IncomeStream,
  ChatMessage,
  Transaction,
  Currency,
  GeminiResponse,
} from "./types";
import Onboarding from "./components/Onboarding";
import ChatInterface from "./components/ChatInterface";
import BudgetCard from "./components/BudgetCard";
import PieChart from "./components/PieChart";
import { processUserMessage } from "./services/geminiService";
import {
  LayoutDashboard,
  MessageCircle,
  Settings2,
  X,
  Trash2,
  Plus,
  ArrowUpRight,
  TrendingDown,
  ShieldCheck,
} from "lucide-react";

const COLORS = [
  "#007AFF",
  "#FF2D55",
  "#34C759",
  "#FFCC00",
  "#5856D6",
  "#AF52DE",
];
const STORAGE_KEY = "freddy_premium_v17_fixed";

function App() {
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [incomes, setIncomes] = useState<IncomeStream[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    Currency.USD
  );
  const [payday, setPayday] = useState<number>(1);
  const [paydayInput, setPaydayInput] = useState<string>("1");
  const [lastResetMonth, setLastResetMonth] = useState<number>(-1);

  const [isTyping, setIsTyping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "chat">("dashboard");

  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [manualAmount, setManualAmount] = useState("");
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [editLimit, setEditLimit] = useState("");
  const [editCategory, setEditCategory] = useState("");

  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [editTxAmount, setEditTxAmount] = useState("");
  const [editTxDescription, setEditTxDescription] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setBudgets(parsed.budgets || []);
        setIncomes(parsed.incomes || []);
        setMessages(parsed.messages || []);
        setTransactions(parsed.transactions || []);
        setSelectedCurrency(parsed.selectedCurrency || Currency.USD);
        setPayday(parsed.payday || 1);
        setPaydayInput((parsed.payday || 1).toString());
        setLastResetMonth(parsed.lastResetMonth ?? -1);
        setIsOnboarded(parsed.isOnboarded === true);
      } catch (e) {
        setIsOnboarded(false);
      }
    } else {
      setIsOnboarded(false);
    }
  }, []);

  useEffect(() => {
    if (isOnboarded === true) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          isOnboarded,
          budgets,
          incomes,
          messages,
          transactions,
          selectedCurrency,
          payday,
          lastResetMonth,
        })
      );
    }
  }, [
    isOnboarded,
    budgets,
    incomes,
    messages,
    transactions,
    selectedCurrency,
    payday,
    lastResetMonth,
  ]);

  const handleOnboardingComplete = (
    newIncome: IncomeStream[],
    newBudgets: Budget[],
    currency: Currency,
    day: number
  ) => {
    setIncomes(newIncome);
    setBudgets(newBudgets);
    setSelectedCurrency(currency);
    setPayday(day);
    setPaydayInput(day.toString());
    setMessages([
      {
        id: "init",
        role: "model",
        text: "Account structure verified. Active.",
        timestamp: Date.now(),
      },
    ]);
    setLastResetMonth(new Date().getFullYear() * 12 + new Date().getMonth());
    setIsOnboarded(true);
  };

  const handleManualLog = () => {
    if (!selectedBudget || !manualAmount) return;
    const amount = parseFloat(manualAmount);
    if (isNaN(amount) || amount <= 0) return;
    setBudgets((prev) =>
      prev.map((b) =>
        b.id === selectedBudget.id ? { ...b, spent: b.spent + amount } : b
      )
    );
    setTransactions((prev) => [
      {
        id: Date.now().toString(),
        amount,
        category: selectedBudget.category,
        description: `Manual Log`,
        date: new Date().toLocaleDateString(),
        currency: selectedCurrency,
      },
      ...prev,
    ]);
    setSelectedBudget(null);
    setManualAmount("");
  };

  const handleUpdateBudget = () => {
    if (!selectedBudget || !editLimit || !editCategory) return;
    const limit = parseFloat(editLimit);
    if (isNaN(limit) || limit <= 0) return;
    setBudgets((prev) =>
      prev.map((b) =>
        b.id === selectedBudget.id ? { ...b, limit, category: editCategory } : b
      )
    );
    setIsEditingBudget(false);
    setSelectedBudget(null);
  };

  const handleDeleteBudget = () => {
    if (!selectedBudget) return;
    setBudgets((prev) => prev.filter((b) => b.id !== selectedBudget.id));
    setTransactions((prev) =>
      prev.filter((t) => t.category !== selectedBudget.category)
    );
    setSelectedBudget(null);
    setIsEditingBudget(false);
  };

  const handleDeleteTransaction = (txId: string) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx) return;
    setTransactions((prev) => prev.filter((t) => t.id !== txId));
    setBudgets((prev) =>
      prev.map((b) =>
        b.category === tx.category
          ? { ...b, spent: Math.max(0, b.spent - tx.amount) }
          : b
      )
    );
  };

  const handleUpdateTransaction = () => {
    if (!editingTransaction || !editTxAmount || !editTxDescription) return;
    const newAmount = parseFloat(editTxAmount);
    if (isNaN(newAmount) || newAmount <= 0) return;

    const oldAmount = editingTransaction.amount;
    const diff = newAmount - oldAmount;

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === editingTransaction.id
          ? { ...t, amount: newAmount, description: editTxDescription }
          : t
      )
    );

    setBudgets((prev) =>
      prev.map((b) =>
        b.category === editingTransaction.category
          ? { ...b, spent: b.spent + diff }
          : b
      )
    );

    setEditingTransaction(null);
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);
    try {
      const response: GeminiResponse = await processUserMessage(
        text,
        [...messages, userMsg],
        budgets,
        incomes,
        transactions
      );

      // Process all actions
      if (response.actions && response.actions.length > 0) {
        response.actions.forEach((action, index) => {
          const { type, data } = action;

          if (type === "LOG_EXPENSE" && data?.amount && data?.category) {
            const cat = data.category;
            const amt = data.amount;

            setBudgets((prev) => {
              const idx = prev.findIndex(
                (b) => b.category.toLowerCase() === cat.toLowerCase()
              );
              if (idx !== -1) {
                const next = [...prev];
                next[idx].spent += amt;
                return next;
              }
              // Auto-create budget if it doesn't exist
              return [
                ...prev,
                {
                  id: Date.now().toString() + index,
                  category: cat,
                  limit: 1000,
                  spent: amt,
                  color: COLORS[prev.length % COLORS.length],
                },
              ];
            });

            setTransactions((prev) => [
              {
                id: Date.now().toString() + index,
                amount: amt,
                category: cat,
                description: data.item || "Expense",
                date: new Date().toLocaleDateString(),
                currency: selectedCurrency,
              },
              ...prev,
            ]);
          }

          if (type === "CREATE_BUDGET" && data?.category && data?.limit) {
            const cat = data.category;
            const limit = data.limit;
            const amt = data.amount || 0;

            setBudgets((prev) => {
              const exists = prev.find(
                (b) => b.category.toLowerCase() === cat.toLowerCase()
              );
              if (exists) return prev;

              return [
                ...prev,
                {
                  id: Date.now().toString() + index,
                  category: cat,
                  limit: limit,
                  spent: amt,
                  color: COLORS[prev.length % COLORS.length],
                },
              ];
            });

            if (amt > 0) {
              setTransactions((prev) => [
                {
                  id: Date.now().toString() + index,
                  amount: amt,
                  category: cat,
                  description: data.item || "Expense",
                  date: new Date().toLocaleDateString(),
                  currency: selectedCurrency,
                },
                ...prev,
              ]);
            }
          }
        });
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "model",
          text: response.message,
          timestamp: Date.now(),
        },
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  const totalMonthlyIncome = useMemo(
    () => incomes.reduce((sum, i) => sum + i.amount, 0),
    [incomes]
  );
  const totalSpentInCycle = useMemo(
    () => budgets.reduce((sum, b) => sum + b.spent, 0),
    [budgets]
  );
  const currentSurplus = totalMonthlyIncome - totalSpentInCycle;

  const handlePaydayChange = (val: string) => {
    setPaydayInput(val);
    const num = parseInt(val);
    if (!isNaN(num) && num >= 1 && num <= 31) {
      setPayday(num);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  if (isOnboarded === null) return null;
  if (isOnboarded === false)
    return <Onboarding onComplete={handleOnboardingComplete} />;

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#FDFDFD] text-[#111111] overflow-hidden">
      {/* Dashboard Side */}
      <div
        className={`flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 ${
          activeTab === "chat" ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Superior Editorial Header */}
        <header className="px-4 md:px-8 pt-6 pb-5 shrink-0 bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto flex flex-col gap-6">
            {/* Meta Header */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-brand-lime animate-pulse"></div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em]">
                  Monthly Retained
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-gray-200" />
                  <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">
                    Day {payday} Sync
                  </span>
                </div>
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-2.5 bg-gray-50 border border-gray-100 hover:border-gray-300 transition-all"
                >
                  <Settings2 size={14} className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* Core Values */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="flex items-baseline">
                <span className="text-2xl md:text-3xl font-display font-light text-gray-200 italic mr-3 select-none leading-none">
                  {selectedCurrency}
                </span>
                <h1
                  className={`text-5xl md:text-6xl font-display font-medium tracking-tight tabular-nums leading-none ${
                    currentSurplus < 0 ? "text-brand-pink" : "text-black"
                  }`}
                >
                  {formatNumber(currentSurplus)}
                </h1>
              </div>

              <div className="grid grid-cols-2 gap-x-8 lg:pl-12 lg:border-l border-gray-100 shrink-0">
                <div className="space-y-1.5">
                  <h3 className="text-[9px] font-bold uppercase tracking-widest text-gray-300">
                    Projected
                  </h3>
                  <p className="text-xl font-display italic text-gray-400 tabular-nums leading-none">
                    {selectedCurrency}
                    {formatNumber(totalMonthlyIncome)}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-[9px] font-bold uppercase tracking-widest text-gray-300">
                    In-Flow
                  </h3>
                  <p className="text-xl font-display italic text-gray-400 tabular-nums leading-none">
                    {selectedCurrency}
                    {formatNumber(totalSpentInCycle)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dense Dashboard Grid */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 pb-24 no-scrollbar">
          <div className="max-w-7xl mx-auto py-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Allocations & Analytics */}
            <div className="lg:col-span-8 space-y-6">
              <section className="bg-white p-5 border border-gray-50 shadow-premium">
                <div className="flex justify-between items-center mb-5 border-b border-gray-50 pb-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400">
                    Capital Partition
                  </h4>
                  <p className="text-[9px] font-display italic text-gray-300">
                    Active distribution profile
                  </p>
                </div>
                <div className="h-44">
                  <PieChart budgets={budgets} />
                </div>
              </section>

              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400">
                    Active Allocations
                  </h4>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {budgets.map((b) => (
                    <BudgetCard
                      key={b.id}
                      budget={b}
                      currencySymbol={selectedCurrency}
                      onClick={(budget) => {
                        setSelectedBudget(budget);
                        setIsEditingBudget(false);
                        setManualAmount("");
                      }}
                      onManage={(budget) => {
                        setSelectedBudget(budget);
                        setIsEditingBudget(true);
                        setEditLimit(budget.limit.toString());
                        setEditCategory(budget.category);
                      }}
                    />
                  ))}
                  <button
                    onClick={() => setShowSettings(true)}
                    className="p-6 border border-dashed border-gray-100 hover:border-gray-300 hover:bg-gray-50/50 flex flex-col items-center justify-center gap-2 text-gray-200 transition-all hover:text-gray-400 group min-h-[140px]"
                  >
                    <Plus
                      size={18}
                      className="opacity-30 group-hover:opacity-100"
                    />
                    <span className="text-[8px] font-bold uppercase tracking-[0.2em]">
                      Add Allocation
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Audit Trail Sidecar */}
            <div className="lg:col-span-4 space-y-5">
              <section className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400">
                    Recent Activity
                  </h4>
                  <span className="text-[9px] font-display text-gray-400">
                    {transactions.length}{" "}
                    {transactions.length === 1 ? "entry" : "entries"}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {transactions.length === 0 ? (
                    <div className="py-20 text-center">
                      <div className="text-gray-200 text-4xl mb-3">📊</div>
                      <p className="text-gray-300 text-sm font-medium">
                        No transactions yet
                      </p>
                      <p className="text-gray-200 text-xs mt-1">
                        Start logging your expenses
                      </p>
                    </div>
                  ) : (
                    transactions.map((tx) => {
                      const sentenceCaseDesc =
                        tx.description.charAt(0).toUpperCase() +
                        tx.description.slice(1).toLowerCase();
                      return (
                        <div
                          key={tx.id}
                          className="flex justify-between items-center py-2.5 px-3 bg-white border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-all group"
                        >
                          <div className="min-w-0 flex-1 mr-3">
                            <p className="font-semibold text-[12px] text-gray-900 truncate leading-tight">
                              {sentenceCaseDesc}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">
                                {tx.category}
                              </span>
                              <span className="text-gray-300 text-[8px]">
                                •
                              </span>
                              <span className="text-[8px] text-gray-400">
                                {tx.date}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-display font-medium text-sm text-brand-pink tabular-nums leading-none">
                              -{selectedCurrency}
                              {formatNumber(tx.amount)}
                            </span>
                            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingTransaction(tx);
                                  setEditTxAmount(tx.amount.toString());
                                  setEditTxDescription(tx.description);
                                }}
                                className="p-1 text-gray-300 hover:text-black transition-all"
                                title="Edit"
                              >
                                <Settings2 size={11} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTransaction(tx.id);
                                }}
                                className="p-1 text-gray-300 hover:text-brand-pink transition-all"
                                title="Delete"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* Manual Entry Modal */}
      {selectedBudget && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-2xl z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm p-8 shadow-premium border border-gray-50 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-display tracking-tight italic">
                {isEditingBudget ? "Category" : "Entry"}
              </h2>
              <button
                onClick={() => {
                  setSelectedBudget(null);
                  setIsEditingBudget(false);
                }}
                className="p-2 text-gray-300 hover:text-black"
              >
                <X size={24} strokeWidth={1} />
              </button>
            </div>

            {!isEditingBudget ? (
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 border border-gray-100 text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mb-4 truncate">
                    {selectedBudget.category}
                  </p>
                  <div className="flex items-center justify-center">
                    <span className="text-3xl font-display font-light text-gray-200 mr-3 italic select-none leading-none">
                      {selectedCurrency}
                    </span>
                    <input
                      autoFocus
                      type="number"
                      placeholder="0"
                      value={manualAmount}
                      onChange={(e) => setManualAmount(e.target.value)}
                      className="bg-transparent border-none text-5xl font-display focus:ring-0 w-full italic tabular-nums leading-none"
                    />
                  </div>
                </div>
                <button
                  onClick={handleManualLog}
                  className="w-full py-5 bg-black text-white font-bold text-[10px] uppercase tracking-[0.4em] shadow-lg hover:bg-gray-900 active:scale-95 transition-all"
                >
                  Synchronize Entry
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.3em] block mb-2">
                      Category Name
                    </label>
                    <input
                      type="text"
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 px-4 py-3 text-base font-semibold focus:outline-none focus:border-gray-300 transition-all"
                      placeholder="e.g., Rent & Living"
                    />
                  </div>
                  <div className="bg-gray-50 p-6 border border-gray-100 text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mb-4">
                      Target Amount
                    </p>
                    <div className="flex items-center justify-center">
                      <span className="text-3xl font-display font-light text-gray-200 mr-3 italic select-none leading-none">
                        {selectedCurrency}
                      </span>
                      <input
                        autoFocus
                        type="number"
                        value={editLimit}
                        onChange={(e) => setEditLimit(e.target.value)}
                        className="bg-transparent border-none text-5xl font-display focus:ring-0 w-full italic tabular-nums leading-none"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleUpdateBudget}
                    className="w-full py-5 bg-black text-white font-bold text-[10px] uppercase tracking-[0.4em] shadow-lg"
                  >
                    Apply Profile
                  </button>
                  <button
                    onClick={handleDeleteBudget}
                    className="w-full py-3 text-brand-pink font-bold text-[9px] uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:opacity-50 transition-opacity"
                  >
                    <Trash2 size={12} /> Discard Partition
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transaction Edit Modal */}
      {editingTransaction && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-2xl z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm p-8 shadow-premium border border-gray-50">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-display tracking-tight italic">
                Edit Transaction
              </h2>
              <button
                onClick={() => setEditingTransaction(null)}
                className="p-2 text-gray-300 hover:text-black"
              >
                <X size={24} strokeWidth={1} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.3em] block mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={editTxDescription}
                  onChange={(e) => setEditTxDescription(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 px-4 py-3 text-base font-semibold transition-all"
                  placeholder="e.g., Groceries"
                />
              </div>

              <div className="bg-gray-50 p-6 border border-gray-100 text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mb-4">
                  Amount
                </p>
                <div className="flex items-center justify-center">
                  <span className="text-3xl font-display font-light text-gray-200 mr-3 italic select-none leading-none">
                    {selectedCurrency}
                  </span>
                  <input
                    autoFocus
                    type="number"
                    value={editTxAmount}
                    onChange={(e) => setEditTxAmount(e.target.value)}
                    className="bg-transparent border-none text-5xl font-display w-full italic tabular-nums leading-none"
                  />
                </div>
              </div>

              <button
                onClick={handleUpdateTransaction}
                className="w-full py-5 bg-black text-white font-bold text-[10px] uppercase tracking-[0.4em] shadow-lg hover:bg-gray-900 active:scale-95 transition-all"
              >
                Update Transaction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-2xl z-[110] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md max-h-[90vh] p-8 shadow-premium border border-gray-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8 shrink-0">
              <h2 className="text-3xl font-display tracking-tight italic">
                Preferences
              </h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 text-gray-400 hover:text-black"
              >
                <X size={28} strokeWidth={1} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-8 pr-1 pb-6">
              <section>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.5em] block mb-5">
                  Ledger Unit
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.values(Currency).map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedCurrency(c)}
                      className={`py-4 text-xs font-bold border transition-all ${
                        selectedCurrency === c
                          ? "bg-black text-white border-black font-display text-2xl italic"
                          : "bg-white text-gray-300 border-gray-100 hover:border-gray-300"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.5em] block mb-5">
                  Cycle Synchrony
                </label>
                <div className="flex items-center gap-8 bg-gray-50 p-6 border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest leading-none">
                    Day of Month
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={paydayInput}
                    onChange={(e) => handlePaydayChange(e.target.value)}
                    className="bg-transparent border-none text-5xl font-display w-full text-right focus:ring-0 italic leading-none"
                  />
                </div>
              </section>

              <section>
                <div className="flex justify-between items-center mb-5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.5em]">
                    Projected Flow
                  </label>
                  <button
                    onClick={() =>
                      setIncomes([
                        ...incomes,
                        { id: Date.now().toString(), source: "", amount: 0 },
                      ])
                    }
                    className="text-[9px] font-bold uppercase tracking-widest text-brand-blue flex items-center gap-1 hover:opacity-50"
                  >
                    <Plus size={12} /> New Stream
                  </button>
                </div>
                <div className="space-y-3">
                  {incomes.map((income) => (
                    <div
                      key={income.id}
                      className="flex gap-4 items-center bg-gray-50 p-4 border border-gray-100 group"
                    >
                      <input
                        type="text"
                        className="flex-1 bg-transparent text-[13px] font-semibold text-gray-800 focus:outline-none placeholder:text-gray-200"
                        value={income.source}
                        onChange={(e) =>
                          setIncomes(
                            incomes.map((i) =>
                              i.id === income.id
                                ? { ...i, source: e.target.value }
                                : i
                            )
                          )
                        }
                        placeholder="Source Name"
                      />
                      <div className="flex items-center font-display text-2xl italic leading-none">
                        <span className="text-gray-300 text-xs mr-2 not-italic">
                          {selectedCurrency}
                        </span>
                        <input
                          type="number"
                          className="w-24 bg-transparent text-right focus:outline-none"
                          value={income.amount || ""}
                          onChange={(e) =>
                            setIncomes(
                              incomes.map((i) =>
                                i.id === income.id
                                  ? {
                                      ...i,
                                      amount: parseFloat(e.target.value) || 0,
                                    }
                                  : i
                              )
                            )
                          }
                        />
                      </div>
                      <button
                        onClick={() =>
                          setIncomes(incomes.filter((i) => i.id !== income.id))
                        }
                        className="text-gray-300 hover:text-brand-pink p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="pt-6 shrink-0 border-t border-gray-50 mt-4">
              <button
                onClick={() => setShowSettings(false)}
                className="w-full py-5 bg-black text-white font-bold text-[11px] uppercase tracking-[0.5em] shadow-lg hover:bg-gray-900 active:scale-[0.99] transition-all"
              >
                Synchronize All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Sidebar */}
      <div
        className={`md:h-full md:w-[360px] lg:w-[420px] bg-white md:border-l border-gray-100 relative z-20 transition-all duration-500 ${
          activeTab === "dashboard" ? "hidden md:block" : "flex flex-col h-full"
        }`}
      >
        <ChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          isTyping={isTyping}
        />
      </div>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 bg-white border border-gray-200 p-2 flex gap-3 z-50 shadow-premium rounded-full">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`p-4 rounded-full transition-all ${
            activeTab === "dashboard"
              ? "bg-black text-white shadow-lg"
              : "text-gray-300"
          }`}
        >
          <LayoutDashboard size={20} />
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`p-4 rounded-full transition-all ${
            activeTab === "chat"
              ? "bg-black text-white shadow-lg"
              : "text-gray-300"
          }`}
        >
          <MessageCircle size={20} />
        </button>
      </nav>
    </div>
  );
}

export default App;
