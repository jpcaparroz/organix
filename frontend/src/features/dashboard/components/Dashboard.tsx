import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useGlobalStore } from "../../../store/globalStore";
import { dashboardApi } from "../api/dashboard";
import { SummaryCards } from "./SummaryCards";
import { ExpenseChart } from "./ExpenseChart";
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover";
import { MonthPicker } from "../../../components/ui/month-picker";
import { Loader2, Calendar, ChevronDown } from "lucide-react";

const PT_MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export const Dashboard: React.FC = () => {
  const { activeDateFilter, setDateFilter } = useGlobalStore();
  const { month, year } = activeDateFilter;

  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ["dashboard_summary", year, month],
    queryFn: () => dashboardApi.getSummary(year, month),
  });

  const { data: chartData, isLoading: loadingChart } = useQuery({
    queryKey: ["dashboard_expenses_by_category", year, month],
    queryFn: () => dashboardApi.getExpensesByCategory(year, month),
  });

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;

  const { data: prevSummary, isLoading: loadingPrevSummary } = useQuery({
    queryKey: ["dashboard_summary", prevYear, prevMonth],
    queryFn: () => dashboardApi.getSummary(prevYear, prevMonth),
  });



  const isLoading = loadingSummary || loadingChart || loadingPrevSummary;

  return (
    <div className="space-y-6">
      <div className="flex justify-start items-center">
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-2 bg-card border border-border shadow-sm text-foreground text-sm font-medium px-4 py-2 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors">
              <Calendar className="w-4 h-4 text-orange-500" />
              <span>{PT_MONTHS[month - 1]} {year}</span>
              <ChevronDown className="w-4 h-4 text-orange-500" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <MonthPicker
              selectedMonth={new Date(year, month - 1)}
              onMonthSelect={(date) => {
                setDateFilter({ ...activeDateFilter, month: date.getMonth() + 1, year: date.getFullYear() });
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 space-y-6">
            {summary && <SummaryCards summary={summary} prevSummary={prevSummary} />}
          </div>
          <div className="md:col-span-5">
            {chartData && <ExpenseChart chartData={chartData} />}
          </div>
        </div>
      )}
    </div>
  );
};
