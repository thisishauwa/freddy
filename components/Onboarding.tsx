import React, { useState } from "react";
import { Plus, ArrowRight, AlertCircle, Trash2 } from "lucide-react";
import { IncomeStream, Budget, Currency } from "../types";

interface Props {
  onComplete: (
    income: IncomeStream[],
    budgets: Budget[],
    currency: Currency,
    payday: number
  ) => void;
}

const COLORS = [
  "#007AFF",
  "#FF2D55",
  "#34C759",
  "#FFCC00",
  "#5856D6",
  "#AF52DE",
];

const Onboarding: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [error, setError] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    Currency.USD
  );
  const [paydayInput, setPaydayInput] = useState("1");

  const [incomes, setIncomes] = useState<IncomeStream[]>([
    { id: "1", source: "Primary Salary", amount: 5000 },
  ]);
  const [budgets, setBudgets] = useState<Budget[]>([
    {
      id: "1",
      category: "Rent & Living",
      limit: 2000,
      spent: 0,
      color: COLORS[0],
    },
    { id: "2", category: "Lifestyle", limit: 800, spent: 0, color: COLORS[1] },
    { id: "3", category: "Savings", limit: 500, spent: 0, color: COLORS[2] },
  ]);

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const remaining = totalIncome - totalBudget;

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!paydayInput) {
        setError("Please define a cycle datum.");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (totalIncome <= 0) {
        setError("Inflows cannot be zero.");
        return;
      }
      setStep(4);
    } else {
      if (totalBudget > totalIncome) {
        setError(`Allocations exceed your projected capital.`);
        return;
      }
      const day = parseInt(paydayInput) || 1;
      onComplete(incomes, budgets, selectedCurrency, day);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center p-4 bg-[#FDFDFD] overflow-hidden no-scrollbar">
      <div className="w-full max-w-xl flex flex-col h-full max-h-[90vh]">
        {/* Branding */}
        <div className="mb-6 text-center shrink-0">
          <h1 className="text-3xl font-display font-medium text-black tracking-tight italic leading-none">
            Freddy
          </h1>
          <p className="text-gray-300 font-bold uppercase text-[8px] tracking-[0.4em] mt-2 opacity-80">
            Refined Ledger Logic
          </p>
        </div>

        <div className="bg-white p-6 shadow-premium border border-gray-50 flex flex-col overflow-hidden relative flex-1">
          <div className="flex-1 overflow-y-auto no-scrollbar pb-4">
            {step === 1 ? (
              <div className="space-y-6 py-2">
                <div className="text-center">
                  <h2 className="text-2xl font-display font-medium tracking-tight italic mb-1">
                    Denomination
                  </h2>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.3em]">
                    Core Account Unit
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                  {Object.values(Currency).map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedCurrency(c)}
                      className={`py-6 font-display font-medium text-3xl border transition-all ${
                        selectedCurrency === c
                          ? "border-black bg-black text-white italic shadow-lg"
                          : "border-gray-50 bg-gray-50 text-gray-300 hover:border-gray-200"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            ) : step === 2 ? (
              <div className="space-y-6 py-2">
                <div className="text-center">
                  <h2 className="text-2xl font-display font-medium tracking-tight italic mb-1">
                    Pulse Cycle
                  </h2>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.3em]">
                    Monthly Sync Day
                  </p>
                </div>
                <div className="bg-gray-50 p-8 flex flex-col items-center justify-center border border-gray-100 relative max-w-xs mx-auto">
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={paydayInput}
                    onChange={(e) => setPaydayInput(e.target.value)}
                    className="bg-transparent border-none text-6xl font-display text-center focus:ring-0 w-full tracking-tighter italic leading-none tabular-nums"
                  />
                  <span className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.4em] mt-4">
                    Calendar Datum
                  </span>
                </div>
              </div>
            ) : step === 3 ? (
              <div className="space-y-5 py-2">
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-display font-medium tracking-tight italic mb-1">
                    Capital Inflows
                  </h2>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.3em]">
                    Map Projected Liquidity
                  </p>
                </div>
                <div className="space-y-2">
                  {incomes.map((income) => (
                    <div
                      key={income.id}
                      className="flex gap-3 items-center bg-gray-50 p-3 border border-gray-100 transition-all hover:border-gray-200"
                    >
                      <input
                        type="text"
                        className="flex-1 bg-transparent text-gray-800 font-semibold text-sm focus:outline-none placeholder:text-gray-200"
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
                        placeholder="Stream Name"
                      />
                      <div className="flex items-center font-display font-medium italic text-xl leading-none tabular-nums">
                        <span className="text-gray-300 mr-2 opacity-60 not-italic text-xs">
                          {selectedCurrency}
                        </span>
                        <input
                          type="number"
                          className="w-20 bg-transparent text-right focus:outline-none"
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
                    </div>
                  ))}
                </div>
                <button
                  onClick={() =>
                    setIncomes([
                      ...incomes,
                      { id: Date.now().toString(), source: "", amount: 0 },
                    ])
                  }
                  className="w-full py-3 text-[8px] font-bold uppercase tracking-[0.3em] text-gray-300 border border-dashed border-gray-100 hover:border-gray-400 hover:text-black transition-all"
                >
                  + Add Stream
                </button>
              </div>
            ) : (
              <div className="space-y-5 py-2">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 border-b border-gray-50 pb-4">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-display font-medium tracking-tight italic leading-none">
                      Allocations
                    </h2>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.3em]">
                      Structural Partitioning
                    </p>
                  </div>
                  <div className="flex gap-3 shrink-0">
                    <div className="bg-black text-white p-3 min-w-[100px] shadow-lg text-center">
                      <span className="text-[7px] font-bold uppercase tracking-[0.2em] opacity-40 block mb-1">
                        Assigned
                      </span>
                      <div className="text-lg font-display italic tabular-nums leading-none">
                        {selectedCurrency}
                        {formatNumber(totalBudget)}
                      </div>
                    </div>
                    <div
                      className={`p-3 border border-gray-100 min-w-[100px] text-center ${
                        remaining >= 0
                          ? "bg-gray-50"
                          : "bg-brand-pink/5 text-brand-pink border-brand-pink/10"
                      }`}
                    >
                      <span className="text-[7px] font-bold uppercase tracking-[0.2em] opacity-40 block mb-1">
                        Retained
                      </span>
                      <div className="text-lg font-display italic tabular-nums leading-none">
                        {selectedCurrency}
                        {formatNumber(remaining)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {budgets.map((budget) => (
                    <div
                      key={budget.id}
                      className="bg-white p-3 border border-gray-50 shadow-minimal relative hover:border-gray-200 transition-all"
                    >
                      <div
                        className="absolute top-0 left-0 w-1 h-full opacity-30"
                        style={{ backgroundColor: budget.color }}
                      ></div>
                      <div className="flex justify-between items-start mb-3">
                        <input
                          type="text"
                          className="bg-transparent text-gray-800 font-bold text-sm focus:outline-none w-full pr-4"
                          value={budget.category}
                          onChange={(e) =>
                            setBudgets(
                              budgets.map((b) =>
                                b.id === budget.id
                                  ? { ...b, category: e.target.value }
                                  : b
                              )
                            )
                          }
                          placeholder="Category"
                        />
                        <button
                          onClick={() =>
                            setBudgets(
                              budgets.filter((b) => b.id !== budget.id)
                            )
                          }
                          className="text-gray-100 hover:text-brand-pink transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold uppercase tracking-[0.2em] text-gray-300 leading-none">
                          Target
                        </label>
                        <div className="flex items-center font-display font-medium italic text-xl leading-none tabular-nums">
                          <span className="mr-2 opacity-40 not-italic text-xs">
                            {selectedCurrency}
                          </span>
                          <input
                            type="number"
                            className="w-full bg-transparent focus:outline-none"
                            value={budget.limit || ""}
                            onChange={(e) =>
                              setBudgets(
                                budgets.map((b) =>
                                  b.id === budget.id
                                    ? {
                                        ...b,
                                        limit: parseFloat(e.target.value) || 0,
                                      }
                                    : b
                                )
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      setBudgets([
                        ...budgets,
                        {
                          id: Date.now().toString(),
                          category: "",
                          limit: 1000,
                          spent: 0,
                          color: COLORS[budgets.length % COLORS.length],
                        },
                      ])
                    }
                    className="flex flex-col items-center justify-center gap-2 p-6 border border-dashed border-gray-100 hover:border-gray-400 hover:text-black hover:bg-gray-50 transition-all text-gray-200 group"
                  >
                    <Plus
                      size={24}
                      strokeWidth={1}
                      className="opacity-20 group-hover:opacity-100"
                    />
                    <span className="text-[8px] font-bold uppercase tracking-[0.2em]">
                      Add
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 shrink-0 max-w-sm mx-auto w-full">
            {error && (
              <div className="mb-3 p-3 bg-brand-pink/5 border border-brand-pink/10 flex items-start gap-3 text-brand-pink text-[9px] font-bold uppercase tracking-[0.2em] leading-relaxed">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={handleNext}
                className="w-full bg-black text-white py-4 font-bold text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-2 shadow-lg hover:bg-gray-900 active:scale-[0.98] transition-all"
              >
                {step === 4 ? "Synchronize All" : "Continue"}{" "}
                <ArrowRight size={14} />
              </button>
              {step > 1 && (
                <button
                  onClick={() => setStep((step - 1) as any)}
                  className="w-full py-1 font-bold text-[9px] uppercase tracking-[0.2em] text-gray-200 hover:text-black transition-all"
                >
                  Go Back
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
