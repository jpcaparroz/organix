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
import { Trash2, Loader2, CreditCard, Banknote, Smartphone, Pencil } from "lucide-react";
import { LogoSelector } from "../../../components/ui/logo-selector";

const PAYMENT_TYPES = [
  { value: "CASH", label: "Cash", icon: Banknote },
  { value: "CREDIT_CARD", label: "Credit Card", icon: CreditCard },
  { value: "DEBIT_CARD", label: "Debit Card", icon: CreditCard },
  { value: "PIX", label: "Pix", icon: Smartphone },
  { value: "BANK_TRANSFER", label: "Bank Transfer", icon: Banknote },
];

import { Skeleton } from "../../../components/ui/skeleton";

export const PaymentMethodManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [type, setType] = useState<string>("CASH");
  const [icon, setIcon] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: paymentMethods = [], isLoading } = useQuery({
    queryKey: ["payment_methods"],
    queryFn: settingsApi.listPaymentMethods,
  });

  const resetForm = () => {
    setName("");
    setType("CASH");
    setIcon("");
    setEditingId(null);
    setErrorMsg(null);
  };

  const createMutation = useMutation({
    mutationFn: settingsApi.createPaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment_methods"] });
      resetForm();
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.detail || "Failed to create payment method");
    },
  });

  const updateMutation = useMutation({
    mutationFn: settingsApi.updatePaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment_methods"] });
      resetForm();
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.detail || "Failed to update payment method");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: settingsApi.deletePaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment_methods"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name,
      type: type as any,
      icon: icon || type.toLowerCase(),
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEdit = (method: any) => {
    setName(method.name);
    setType(method.type);
    setIcon(method.icon && method.icon.endsWith('.png') ? method.icon : "");
    setEditingId(method.payment_method_id);
    setErrorMsg(null);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

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
            <h3 className="text-lg font-semibold mb-4">{editingId ? "Edit Payment Method" : "New Payment Method"}</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <div className="space-y-2 flex flex-col">
                <Label>Logo (Optional)</Label>
                <LogoSelector value={icon} onValueChange={setIcon} className="w-full" />
              </div>

              <div className="flex gap-3 pt-2">
                {editingId && (
                  <Button type="button" variant="outline" className="flex-1" onClick={resetForm} disabled={isSaving}>
                    Cancel
                  </Button>
                )}
                <Button type="submit" className="flex-1" disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : editingId ? "Save Changes" : "Create Method"}
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className="md:col-span-7">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm min-h-[300px]">
            <h3 className="text-lg font-semibold mb-4">Active Methods</h3>

            {isLoading ? (
              <div className="space-y-4 py-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-md" />
                ))}
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
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center overflow-hidden shrink-0">
                          {method.icon && method.icon.endsWith('.png') ? (
                            <img 
                              src={`/payment-method-logos/${method.icon}`} 
                              alt={method.name} 
                              className="w-6 h-6 object-contain rounded-full ring-1 ring-border bg-white"
                            />
                          ) : (
                            <Icon className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{method.name}</div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {method.type.replace("_", " ").toLowerCase()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(method)}
                          className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(method.payment_method_id)}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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
