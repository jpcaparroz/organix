import React, { useMemo } from "react";
import { PieChart, Pie, LabelList } from "recharts";
import { 
  type ChartConfig, 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent, 
  ChartLegend, 
  ChartLegendContent 
} from "../../../components/ui/chart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";

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

  const defaultColors = [
    "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
  ];

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {
      value: { label: "Despesas" }
    };
    data.forEach((item, idx) => {
      const key = item.category_name.toLowerCase().replace(/[^a-z0-9]/g, "_");
      config[key] = {
        label: item.category_name,
        color: item.color_hex || defaultColors[idx % defaultColors.length],
      };
    });
    return config;
  }, [data]);

  const formattedData = useMemo(() => {
    return data.map((item) => {
      const key = item.category_name.toLowerCase().replace(/[^a-z0-9]/g, "_");
      return {
        name: key,
        value: parseFloat(item.amount as any),
        fill: `var(--color-${key})`,
      };
    });
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-3xl p-8 min-h-[300px] flex items-center justify-center text-center shadow-sm">
        <p className="text-muted-foreground">No expense transactions recorded for this month.</p>
      </div>
    );
  }

  return (
    <Card className="rounded-3xl shadow-sm border-border flex flex-col h-full">
      <CardHeader className="pb-2">
        <CardTitle>Despesas por Categoria</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <ChartContainer config={chartConfig} className="w-full h-[300px]">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={formattedData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
            >
              <LabelList
                dataKey="value"
                position="outside"
                className="fill-foreground"
                fontSize={10}
                formatter={(value: number) => `$${value}`}
              />
            </Pie>
            <ChartLegend 
              content={<ChartLegendContent className="flex-wrap gap-2 justify-center" />} 
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
