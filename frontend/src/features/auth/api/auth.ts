import { apiClient } from "../../../lib/apiClient";

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  icon?: string;
}

export const authApi = {
  login: async (email: string, password: string) => {
    const params = new URLSearchParams();
    params.append("username", email);
    params.append("password", password);

    const response = await apiClient.post("/auth/login", params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return response.data; // returns { access_token, token_type }
  },

  register: async (payload: RegisterPayload) => {
    const response = await apiClient.post("/auth/register", payload);
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },
};
