import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/auth";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Loader2 } from "lucide-react";

const registerSchema = zod.object({
  name: zod.string().min(1, "Name is required"),
  email: zod.string().email("Invalid email address"),
  password: zod.string().min(6, "Password must be at least 6 characters"),
  icon: zod.string().optional(),
});

type RegisterFields = zod.infer<typeof registerSchema>;

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFields) => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await authApi.register({
        email: data.email,
        password: data.password,
        name: data.name,
        icon: data.icon || "user",
      });
      setSuccessMsg("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Registration failed. Email might already be taken.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold">Sign Up</h2>
      </div>

      {errorMsg && (
        <div className="p-3 bg-destructive/15 text-destructive text-sm rounded-md border border-destructive/20">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="p-3 bg-success/15 text-success text-sm rounded-md border border-success/20">
          {successMsg}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            autoFocus
            {...register("name")}
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
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
            {...register("password")}
            className={errors.password ? "border-destructive" : ""}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="icon">Icon Name (Optional)</Label>
          <Input
            id="icon"
            {...register("icon")}
            className={errors.icon ? "border-destructive" : ""}
          />
          {errors.icon && (
            <p className="text-sm text-destructive">{errors.icon.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full h-11" disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Sign Up"}
      </Button>

      <div className="text-center mt-4">
        <Link to="/login" className="text-sm text-primary hover:underline">
          Already have an account? Sign In
        </Link>
      </div>
    </form>
  );
};
