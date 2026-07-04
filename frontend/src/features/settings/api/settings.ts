import { apiClient } from "../../../lib/apiClient";

export interface CategoryPayload {
  name: string;
  icon?: string;
  color_hex?: string;
}

export interface PaymentMethodPayload {
  name: string;
  type: "CASH" | "CREDIT_CARD" | "DEBIT_CARD" | "PIX" | "BANK_TRANSFER";
  icon?: string;
}

export const settingsApi = {
  // Expense Categories
  listExpenseCategories: async () => {
    const response = await apiClient.get("/categories/expenses");
    return response.data;
  },
  createExpenseCategory: async (payload: CategoryPayload) => {
    const response = await apiClient.post("/categories/expenses", payload);
    return response.data;
  },
  deleteExpenseCategory: async (id: string) => {
    await apiClient.delete(`/categories/expenses/${id}`);
  },

  // Income Categories
  listIncomeCategories: async () => {
    const response = await apiClient.get("/categories/incomes");
    return response.data;
  },
  createIncomeCategory: async (payload: CategoryPayload) => {
    const response = await apiClient.post("/categories/incomes", payload);
    return response.data;
  },
  deleteIncomeCategory: async (id: string) => {
    await apiClient.delete(`/categories/incomes/${id}`);
  },

  // Payment Methods
  listPaymentMethods: async () => {
    const response = await apiClient.get("/payment-methods");
    return response.data;
  },
  createPaymentMethod: async (payload: PaymentMethodPayload) => {
    const response = await apiClient.post("/payment-methods", payload);
    return response.data;
  },
  deletePaymentMethod: async (id: string) => {
    await apiClient.delete(`/payment-methods/${id}`);
  },
};
