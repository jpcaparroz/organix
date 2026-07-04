import { apiClient } from "../../../lib/apiClient";

export interface ExpensePayload {
  name: string;
  description?: string;
  amount: number;
  date: string; // YYYY-MM-DD
  status: "PENDING" | "PAID";
  tags?: string[];
  expense_category_id: string;
  payment_method_id: string;
  installment_quantity?: number;
}

export const expensesApi = {
  listExpenses: async (params: {
    start_date?: string;
    end_date?: string;
    category_id?: string;
    status?: string;
    skip?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get("/expenses", { params });
    return response.data; // returns { items: ExpenseRead[], total_count: number }
  },

  getExpense: async (id: string) => {
    const response = await apiClient.get(`/expenses/${id}`);
    return response.data;
  },

  createExpense: async (payload: ExpensePayload) => {
    const response = await apiClient.post("/expenses", payload);
    return response.data;
  },

  updateExpense: async (id: string, payload: Partial<ExpensePayload>, updateType: string = "single") => {
    const response = await apiClient.patch(`/expenses/${id}`, payload, {
      params: { update_type: updateType },
    });
    return response.data;
  },

  deleteExpense: async (id: string, deleteType: string = "single") => {
    await apiClient.delete(`/expenses/${id}`, {
      params: { delete_type: deleteType },
    });
  },
};
