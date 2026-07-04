import { apiClient } from "../../../lib/apiClient";

export const dashboardApi = {
  getSummary: async (year: number, month: number) => {
    const response = await apiClient.get("/dashboard/summary", {
      params: { year, month },
    });
    return response.data; // returns { total_income, total_expense, net_balance, pending_expenses, expected_incomes }
  },

  getExpensesByCategory: async (year: number, month: number) => {
    const response = await apiClient.get("/dashboard/expenses-by-category", {
      params: { year, month },
    });
    return response.data; // returns { items: CategoryShare[] }
  },
};
