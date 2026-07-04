import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/auth";
import { useGlobalStore } from "../../../store/globalStore";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Loader2 } from "lucide-react";

const loginSchema = zod.object({
  email: zod.string().email("Invalid email address"),
  password: zod.string().min(6, "Password must be at least 6 characters"),
});

type LoginFields = zod.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { setToken, setUser } = useGlobalStore();
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFields) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // 1. Authenticate user
      const loginRes = await authApi.login(data.email, data.password);
      setToken(loginRes.access_token);

      // 2. Fetch logged-in user profile
      const userRes = await authApi.getMe();
      setUser(userRes);

      // 3. Redirect to dashboard
      navigate("/");
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.detail || "Authentication failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold">Sign In</h2>
      </div>

      {errorMsg && (
        <div className="p-3 bg-destructive/15 text-destructive text-sm rounded-md border border-destructive/20">
          {errorMsg}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            {...register("email")}
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register("password")}
            className={errors.password ? "border-destructive" : ""}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full h-11" disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Sign In"}
      </Button>

      <div className="text-center mt-4">
        <Link to="/register" className="text-sm text-primary hover:underline">
          Don't have an account? Sign Up
        </Link>
      </div>
    </form>
  );
};
