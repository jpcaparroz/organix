import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from "recharts";
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
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";

interface CategoryMonthlyShare {
  category_id: string;
  category_name: string;
  color_hex: string | null;
  amount: number;
}

interface MonthData {
  month: number;
  year: number;
  month_label: string;
  categories: CategoryMonthlyShare[];
}

interface StackedExpensesChartProps {
  chartData: {
    items: MonthData[];
  };
}

export const StackedExpensesChart: React.FC<StackedExpensesChartProps> = ({ chartData }) => {
  const items = chartData.items || [];

  const { chartConfig, formattedData, categoryKeys } = useMemo(() => {
    const config: ChartConfig = {};
    const catSet = new Set<string>();
    
    const defaultColors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6"];
    let colorIndex = 0;
    
    const formatted = items.map((monthItem) => {
      const dataPoint: any = {
        name: monthItem.month_label,
      };
      
      monthItem.categories.forEach((cat) => {
        const key = cat.category_name.toLowerCase().replace(/[^a-z0-9]/g, "_");
        dataPoint[key] = parseFloat(cat.amount as any);
        
        if (!config[key]) {
          config[key] = {
            label: cat.category_name,
            color: cat.color_hex || defaultColors[colorIndex % defaultColors.length],
          };
          colorIndex++;
        }
        catSet.add(key);
      });
      
      return dataPoint;
    });

    return {
      chartConfig: config,
      formattedData: formatted,
      categoryKeys: Array.from(catSet),
    };
  }, [items]);

  if (items.length === 0 || formattedData.length === 0) {
    return (
      <div className="bg-card border border-border rounded-3xl p-8 min-h-[300px] flex items-center justify-center text-center shadow-sm">
        <p className="text-muted-foreground">Nenhuma despesa registrada para o ano selecionado.</p>
      </div>
    );
  }

  return (
    <Card className="rounded-3xl shadow-sm border-border">
      <CardHeader>
        <CardTitle>Despesas Mensais por Categoria</CardTitle>
        <CardDescription>Visão geral de despesas nos meses selecionados</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="w-full h-[300px]">
          <BarChart accessibilityLayer data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} 
              dy={10} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} 
              tickFormatter={(value) => `$${value}`}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={{ fill: "var(--color-muted)", opacity: 0.4 }} />
            <ChartLegend content={<ChartLegendContent className="flex-wrap gap-2 justify-center" />} />
            
            {categoryKeys.map((catKey) => (
              <Bar
                key={catKey}
                dataKey={catKey}
                stackId="a"
                fill={`var(--color-${catKey})`}
                radius={[4, 4, 0, 0]}
              >
                <LabelList 
                  dataKey={catKey}
                  position="inside"
                  className="fill-white mix-blend-overlay"
                  fontSize={10} 
                  formatter={(value: number) => value > 10 ? `$${value}` : ''}
                />
              </Bar>
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
