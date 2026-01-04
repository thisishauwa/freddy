import React from "react";
import { Budget } from "../types";
import { Plus, Settings2 } from "lucide-react";

interface Props {
  budget: Budget;
  currencySymbol: string;
  onClick: (budget: Budget) => void;
  onManage: (budget: Budget) => void;
}

const BudgetCard: React.FC<Props> = ({
  budget,
  currencySymbol,
  onClick,
  onManage,
}) => {
  const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
  const remaining = budget.limit - budget.spent;
  const isOver = remaining < 0;
  const isClose = !isOver && percentage > 85;

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <div className="group relative w-full bg-white p-4 shadow-minimal border border-gray-50 hover:border-gray-200 hover:shadow-premium transition-all flex flex-col min-h-[130px]">
      <div className="flex justify-between items-start mb-3 w-full">
        {/* Category Label Container */}
        <div className="flex-1 min-w-0 pr-3">
          <h3 className="font-display font-medium text-[17px] text-black tracking-tight italic leading-tight mb-0.5 truncate">
            {budget.category}
          </h3>
          <div className="flex items-center">
            <span className="text-[8px] text-gray-300 font-bold uppercase tracking-[0.2em] opacity-80 leading-none truncate">
              Target: {currencySymbol}
              {formatNumber(budget.limit)}
            </span>
          </div>
        </div>

        {/* Action/Status Container */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onManage(budget);
            }}
            className="p-1.5 hover:bg-gray-100 text-gray-200 hover:text-black transition-colors rounded-full"
            title="Adjust"
          >
            <Settings2 size={13} strokeWidth={1.5} />
          </button>
          <div
            className={`px-2 py-1 text-[7px] font-bold uppercase tracking-[0.2em] border leading-none ${
              isOver
                ? "bg-brand-pink/5 text-brand-pink border-brand-pink/10"
                : isClose
                ? "bg-brand-yellow/5 text-brand-yellow border-brand-yellow/10"
                : "bg-brand-lime/5 text-brand-lime border-brand-lime/10"
            }`}
          >
            {isOver ? "EXCEEDED" : isClose ? "NEAR" : "STABLE"}
          </div>
        </div>
      </div>

      {/* Precision progress bar */}
      <div className="relative w-full h-[2px] bg-gray-50 overflow-hidden mb-4 mt-auto">
        <div
          className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-in-out ${
            isOver ? "bg-brand-pink" : isClose ? "bg-brand-yellow" : "bg-black"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between items-center w-full">
        <div className="flex items-baseline min-w-0 mr-3 overflow-hidden">
          <span className="text-[13px] font-display font-light text-gray-200 mr-1.5 select-none italic leading-none shrink-0">
            {currencySymbol}
          </span>
          <span className="text-[24px] font-display font-medium text-black not-italic leading-none tabular-nums overflow-hidden text-ellipsis">
            {formatNumber(budget.spent)}
          </span>
        </div>
        <button
          onClick={() => onClick(budget)}
          className="flex items-center gap-1.5 px-4 py-2 bg-black text-white text-[9px] font-bold uppercase tracking-[0.2em] shadow-lg hover:bg-gray-900 active:scale-95 transition-all shrink-0"
        >
          <Plus size={14} strokeWidth={3} /> Record
        </button>
      </div>
    </div>
  );
};

export default BudgetCard;
