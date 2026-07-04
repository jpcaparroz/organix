import { apiClient } from "../../../lib/apiClient";

export interface IncomePayload {
  name: string;
  description?: string;
  amount: number;
  date: string; // YYYY-MM-DD
  status: "EXPECTED" | "RECEIVED";
  income_category_id: string;
  payment_method_id: string;
  installment_quantity?: number;
}

export const incomesApi = {
  listIncomes: async (params: {
    start_date?: string;
    end_date?: string;
    category_id?: string;
    status?: string;
    skip?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get("/incomes", { params });
    return response.data;
  },

  getIncome: async (id: string) => {
    const response = await apiClient.get(`/incomes/${id}`);
    return response.data;
  },

  createIncome: async (payload: IncomePayload) => {
    const response = await apiClient.post("/incomes", payload);
    return response.data;
  },

  updateIncome: async (id: string, payload: Partial<IncomePayload>, updateType: string = "single") => {
    const response = await apiClient.patch(`/incomes/${id}`, payload, {
      params: { update_type: updateType },
    });
    return response.data;
  },

  deleteIncome: async (id: string, deleteType: string = "single") => {
    await apiClient.delete(`/incomes/${id}`, {
      params: { delete_type: deleteType },
    });
  },
};
