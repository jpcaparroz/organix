import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "../api/settings";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Trash2, Loader2, CreditCard, Banknote, Smartphone } from "lucide-react";

const PAYMENT_TYPES = [
  { value: "CASH", label: "Cash", icon: Banknote },
  { value: "CREDIT_CARD", label: "Credit Card", icon: CreditCard },
  { value: "DEBIT_CARD", label: "Debit Card", icon: CreditCard },
  { value: "PIX", label: "Pix", icon: Smartphone },
  { value: "BANK_TRANSFER", label: "Bank Transfer", icon: Banknote },
];

export const PaymentMethodManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [type, setType] = useState<string>("CASH");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: paymentMethods = [], isLoading } = useQuery({
    queryKey: ["payment_methods"],
    queryFn: settingsApi.listPaymentMethods,
  });

  const createMutation = useMutation({
    mutationFn: settingsApi.createPaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment_methods"] });
      setName("");
      setType("CASH");
      setErrorMsg(null);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.detail || "Failed to create payment method");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: settingsApi.deletePaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment_methods"] });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createMutation.mutate({
      name,
      type: type as any,
      icon: type.toLowerCase(),
    });
  };

  const isCreating = createMutation.isPending;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Payment Methods</h1>

      {errorMsg && (
        <div className="bg-destructive/15 text-destructive text-sm rounded-md border border-destructive/20 p-3">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-5">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">New Payment Method</h3>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="methodName">Name (e.g., Chase Sapphire)</Label>
                <Input
                  id="methodName"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_TYPES.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <option.icon className="w-4 h-4 text-muted-foreground" />
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={isCreating}>
                {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Create Method"}
              </Button>
            </form>
          </div>
        </div>

        <div className="md:col-span-7">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm min-h-[300px]">
            <h3 className="text-lg font-semibold mb-4">Active Methods</h3>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : paymentMethods.length === 0 ? (
              <div className="text-muted-foreground text-center py-8">
                No payment methods defined yet.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {paymentMethods.map((method: any) => {
                  const methodType = PAYMENT_TYPES.find(t => t.value === method.type);
                  const Icon = methodType?.icon || CreditCard;
                  
                  return (
                    <li key={method.payment_method_id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{method.name}</div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {method.type.replace("_", " ").toLowerCase()}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(method.payment_method_id)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
