import React from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Info,
  ChevronRight,
  SkipBack
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SummaryCardsProps {
  summary: {
    total_income: number;
    total_expense: number;
    net_balance: number;
    pending_expenses: number;
    expected_incomes: number;
  };
  prevSummary?: {
    total_income: number;
    total_expense: number;
    net_balance: number;
    pending_expenses: number;
    expected_incomes: number;
  };
}

const formatBRL = (value: number | string) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number(value));
};

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary, prevSummary }) => {
  const navigate = useNavigate();

  const getPercentageData = (currentRaw: number | string, previousRaw: number | string, type: 'income' | 'expense') => {
    const current = Number(currentRaw);
    const previous = Number(previousRaw);

    if (previous === 0 || isNaN(previous)) return { text: "0%", color: 'text-muted-foreground' };
    
    const diff = current - previous;
    const roundedPercent = Math.round((diff / previous) * 100);
    const text = `${roundedPercent > 0 ? '+' : ''}${roundedPercent}%`;
    
    if (roundedPercent === 0) {
      return { text: "0%", color: 'text-muted-foreground' };
    }

    if (type === 'income') {
      return { text, color: roundedPercent > 0 ? 'text-success' : 'text-destructive' };
    } else {
      return { text, color: roundedPercent > 0 ? 'text-destructive' : 'text-success' };
    }
  };

  const prevIncome = prevSummary?.total_income || 0;
  const prevExpense = prevSummary?.total_expense || 0;

  const incomePercentage = getPercentageData(summary.total_income, prevIncome, 'income');
  const expensePercentage = getPercentageData(summary.total_expense, prevExpense, 'expense');

  const cards = [
    {
      title: "Despesas",
      value: summary.total_expense,
      HeaderIcon: ArrowUpRight,
      headerIconColor: "text-destructive",
      previousValue: prevExpense,
      percentage: expensePercentage.text,
      percentageColor: expensePercentage.color,
      link: "/expenses"
    },
    {
      title: "Receitas",
      value: summary.total_income,
      HeaderIcon: ArrowDownRight,
      headerIconColor: "text-success",
      previousValue: prevIncome,
      percentage: incomePercentage.text,
      percentageColor: incomePercentage.color,
      link: "/incomes"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {cards.map((card) => (
        <div key={card.title} className="bg-card border border-border rounded-3xl p-6 flex flex-col shadow-sm">
          {/* Header Row */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <card.HeaderIcon className={`w-5 h-5 ${card.headerIconColor}`} />
              <h3 className="text-lg font-bold text-foreground">{card.title}</h3>
              <Info className="w-4 h-4 text-muted-foreground ml-1 cursor-help" />
            </div>
            <button 
              onClick={() => navigate(card.link)}
              className="p-1 hover:bg-accent rounded-full transition-colors text-muted-foreground"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          {/* Main Value Row */}
          <div className="text-3xl font-bold text-foreground mb-4">
            {formatBRL(card.value)}
          </div>
          
          {/* Comparison Row */}
          <div className="flex items-center gap-2 text-sm mt-auto">
            <SkipBack className="w-4 h-4 text-muted-foreground opacity-70" />
            <span className="text-muted-foreground">{formatBRL(card.previousValue)}</span>
            <div className="bg-white/5 backdrop-blur-2xl border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] px-2.5 py-0.5 rounded-full flex items-center justify-center ml-2 transition-all">
              <span className={`font-medium text-[11px] uppercase tracking-wider ${card.percentageColor}`}>{card.percentage}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
