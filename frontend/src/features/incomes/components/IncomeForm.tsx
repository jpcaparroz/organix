import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "../../settings/api/settings";
import { incomesApi } from "../api/incomes";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";

const incomeSchema = zod.object({
  name: zod.string().min(1, "Name is required"),
  description: zod.string().optional(),
  amount: zod.number().gt(0, "Amount must be greater than 0"),
  date: zod.string().min(1, "Date is required"),
  status: zod.enum(["EXPECTED", "RECEIVED"]),
  income_category_id: zod.string().uuid("Invalid category"),
  payment_method_id: zod.string().uuid("Invalid payment method"),
  installment_quantity: zod.number().int().min(1),
});

type IncomeFields = zod.infer<typeof incomeSchema>;

interface IncomeFormProps {
  incomeToEdit?: any;
  incomeToDuplicate?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export const IncomeForm: React.FC<IncomeFormProps> = ({
  incomeToEdit,
  incomeToDuplicate,
  onSuccess,
  onCancel,
}) => {
  const queryClient = useQueryClient();
  const [showInstallments, setShowInstallments] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<IncomeFields | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ["income_categories"],
    queryFn: settingsApi.listIncomeCategories,
  });

  const { data: paymentMethods = [] } = useQuery({
    queryKey: ["payment_methods"],
    queryFn: settingsApi.listPaymentMethods,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<IncomeFields>({
    resolver: zodResolver(incomeSchema),
    defaultValues: incomeToEdit ? {
      name: incomeToEdit.name.replace(/\s\(\d+\/\d+\)$/, ""),
      description: incomeToEdit.description || "",
      amount: parseFloat(incomeToEdit.amount),
      date: incomeToEdit.date,
      status: incomeToEdit.status,
      income_category_id: incomeToEdit.income_category_id || "",
      payment_method_id: incomeToEdit.payment_method_id || "",
      installment_quantity: 1,
    } : incomeToDuplicate ? {
      name: `${incomeToDuplicate.name.replace(/\s\(\d+\/\d+\)$/, "")} (Copy)`,
      description: incomeToDuplicate.description || "",
      amount: parseFloat(incomeToDuplicate.amount),
      date: incomeToDuplicate.date,
      status: "EXPECTED",
      income_category_id: incomeToDuplicate.income_category_id || "",
      payment_method_id: incomeToDuplicate.payment_method_id || "",
      installment_quantity: 1,
    } : {
      name: "",
      description: "",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      status: "EXPECTED",
      income_category_id: "",
      payment_method_id: "",
      installment_quantity: 1,
    },
  });

  useEffect(() => {
    if (incomeToEdit) {
      reset({
        name: incomeToEdit.name.replace(/\s\(\d+\/\d+\)$/, ""),
        description: incomeToEdit.description || "",
        amount: parseFloat(incomeToEdit.amount),
        date: incomeToEdit.date,
        status: incomeToEdit.status,
        income_category_id: incomeToEdit.income_category_id || "",
        payment_method_id: incomeToEdit.payment_method_id || "",
        installment_quantity: 1,
      });
      setShowInstallments(false);
    } else if (incomeToDuplicate) {
      reset({
        name: `${incomeToDuplicate.name.replace(/\s\(\d+\/\d+\)$/, "")} (Copy)`,
        description: incomeToDuplicate.description || "",
        amount: parseFloat(incomeToDuplicate.amount),
        date: incomeToDuplicate.date,
        status: "EXPECTED",
        income_category_id: incomeToDuplicate.income_category_id || "",
        payment_method_id: incomeToDuplicate.payment_method_id || "",
        installment_quantity: 1,
      });
      setShowInstallments(false);
    } else {
      reset({
        name: "",
        description: "",
        amount: 0,
        date: new Date().toISOString().split("T")[0],
        status: "EXPECTED",
        income_category_id: "",
        payment_method_id: "",
        installment_quantity: 1,
      });
      setShowInstallments(false);
    }
  }, [incomeToEdit, incomeToDuplicate, reset]);

  const createMutation = useMutation({
    mutationFn: incomesApi.createIncome,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incomes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard_summary"] });
      onSuccess();
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.detail || "Failed to save transaction");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload, type }: { id: string; payload: any; type: string }) =>
      incomesApi.updateIncome(id, payload, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incomes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard_summary"] });
      onSuccess();
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.detail || "Failed to save transaction");
    },
  });

  const onSubmit = (data: IncomeFields) => {
    const formattedData = {
      ...data,
      installment_quantity: showInstallments ? data.installment_quantity : 1,
    };

    if (incomeToEdit) {
      if (incomeToEdit.transaction_group_id) {
        setPendingFormData(data);
        setOpenUpdateDialog(true);
      } else {
        updateMutation.mutate({
          id: incomeToEdit.income_id,
          payload: formattedData,
          type: "single",
        });
      }
    } else {
      createMutation.mutate(formattedData);
    }
  };

  const handleConfirmedUpdate = (type: "single" | "subsequent" | "all") => {
    if (!pendingFormData || !incomeToEdit) return;
    setOpenUpdateDialog(false);

    updateMutation.mutate({
      id: incomeToEdit.income_id,
      payload: pendingFormData,
      type,
    });
  };

  return (
    <div className="p-6 overflow-y-auto max-h-[85vh]">
      <h2 className="text-xl font-bold mb-6">
        {incomeToEdit ? "Edit Income" : "New Income"}
      </h2>

      {incomeToEdit?.transaction_group_id && (
        <div className="bg-warning/10 text-warning-foreground p-3 rounded-md mb-4 text-sm border border-warning/20">
          This is installment <strong>{incomeToEdit.installment_current}/{incomeToEdit.installment_total}</strong> of a recurring income.
        </div>
      )}

      {errorMsg && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4 text-sm border border-destructive/20">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name")} className={errors.name ? "border-destructive" : ""} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea id="description" {...register("description")} className={errors.description ? "border-destructive" : ""} />
          {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={field.value || ""}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  className={errors.amount ? "border-destructive" : ""}
                />
              )}
            />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" {...register("date")} className={errors.date ? "border-destructive" : ""} />
            {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select value={field.value || undefined} onValueChange={field.onChange}>
                  <SelectTrigger className={errors.status ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EXPECTED">Expected</SelectItem>
                    <SelectItem value="RECEIVED">Received</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Controller
              name="income_category_id"
              control={control}
              render={({ field }) => (
                <Select value={field.value || undefined} onValueChange={field.onChange}>
                  <SelectTrigger className={errors.income_category_id ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat: any) => (
                      <SelectItem key={cat.income_category_id} value={cat.income_category_id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Payment Method</Label>
          <Controller
            name="payment_method_id"
            control={control}
            render={({ field }) => (
              <Select value={field.value || undefined} onValueChange={field.onChange}>
                <SelectTrigger className={errors.payment_method_id ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((pm: any) => (
                    <SelectItem key={pm.payment_method_id} value={pm.payment_method_id}>
                      {pm.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {!incomeToEdit && (
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-border text-primary"
                checked={showInstallments}
                onChange={(e) => setShowInstallments(e.target.checked)}
              />
              <span className="text-sm font-medium">This transaction has installments</span>
            </label>

            {showInstallments && (
              <div className="space-y-2 mt-4">
                <Label htmlFor="installment_quantity">Number of Installments</Label>
                <Controller
                  name="installment_quantity"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="installment_quantity"
                      type="number"
                      value={field.value}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      className={errors.installment_quantity ? "border-destructive" : ""}
                    />
                  )}
                />
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-6 border-t border-border mt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="default" className="bg-success hover:bg-success/90 text-success-foreground">
            Save Income
          </Button>
        </div>
      </form>

      <Dialog open={openUpdateDialog} onOpenChange={setOpenUpdateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Installments</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground mt-2">
            This income is part of an installment chain. How would you like to apply your updates?
          </div>
          <div className="flex flex-col gap-2 mt-6">
            <Button variant="outline" onClick={() => handleConfirmedUpdate("single")}>
              Update this installment only
            </Button>
            <Button variant="outline" onClick={() => handleConfirmedUpdate("subsequent")}>
              Update this and all future installments
            </Button>
            <Button variant="outline" onClick={() => handleConfirmedUpdate("all")}>
              Update all installments
            </Button>
            <Button variant="ghost" onClick={() => setOpenUpdateDialog(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
