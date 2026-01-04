import React from "react";
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Budget } from "../types";

interface Props {
  budgets: Budget[];
}

const PieChart: React.FC<Props> = ({ budgets }) => {
  const data = budgets
    .filter((b) => b.spent > 0)
    .map((b) => ({
      name: b.category,
      value: b.spent,
      color: b.color,
    }));

  if (data.length === 0) {
    return (
      <div className="h-48 flex flex-col items-center justify-center text-gray-400 text-[11px] font-bold uppercase tracking-widest gap-3">
        <span className="text-3xl grayscale opacity-30">🥥</span>
        <span>Awaiting Input</span>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPie>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
            stroke="none"
            animationDuration={800}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#000000",
              color: "#ffffff",
              borderRadius: "4px",
              borderWidth: "0px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              padding: "8px 12px",
              fontSize: "11px",
              fontWeight: "800",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
            itemStyle={{ color: "#ffffff" }}
            cursor={{ fill: "transparent" }}
            formatter={(value: number) => [`${value.toLocaleString()}`, ""]}
          />
        </RechartsPie>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChart;
