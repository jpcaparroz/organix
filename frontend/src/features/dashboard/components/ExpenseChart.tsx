import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

interface ExpenseChartProps {
  chartData: {
    items: Array<{
      category_id: string;
      category_name: string;
      color_hex: string | null;
      amount: number;
      percentage: number;
    }>;
  };
}

export const ExpenseChart: React.FC<ExpenseChartProps> = ({ chartData }) => {
  const data = chartData.items || [];

  if (data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-3xl p-8 min-h-[300px] flex items-center justify-center text-center shadow-sm">
        <p className="text-muted-foreground">No expense transactions recorded for this month.</p>
      </div>
    );
  }

  // Predefined colors
  const defaultColors = [
    "#3b82f6", // blue-500
    "#ef4444", // red-500
    "#10b981", // emerald-500
    "#f59e0b", // amber-500
    "#8b5cf6", // violet-500
  ];

  const formattedData = data.map((item, idx) => ({
    name: item.category_name,
    value: parseFloat(item.amount as any),
    color: item.color_hex || defaultColors[idx % defaultColors.length],
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover text-popover-foreground p-3 border border-border rounded-lg shadow-md">
          <p className="font-semibold text-sm">{payload[0].name}</p>
          <p className="text-destructive font-medium text-sm mt-1">
            $ {payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
      <h3 className="text-lg font-bold mb-4">Expenses by Category</h3>
      <div className="w-full h-[300px]">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={formattedData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {formattedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
