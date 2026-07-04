import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "../api/settings";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import { Trash2, Loader2 } from "lucide-react";

export const CategoryManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("expenses");
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("#00668b");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: expenseCategories = [], isLoading: loadingExpenses } = useQuery({
    queryKey: ["expense_categories"],
    queryFn: settingsApi.listExpenseCategories,
  });

  const { data: incomeCategories = [], isLoading: loadingIncomes } = useQuery({
    queryKey: ["income_categories"],
    queryFn: settingsApi.listIncomeCategories,
  });

  const createExpenseMutation = useMutation({
    mutationFn: settingsApi.createExpenseCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense_categories"] });
      setNewCatName("");
      setErrorMsg(null);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.detail || "Failed to create category");
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: settingsApi.deleteExpenseCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense_categories"] });
    },
  });

  const createIncomeMutation = useMutation({
    mutationFn: settingsApi.createIncomeCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income_categories"] });
      setNewCatName("");
      setErrorMsg(null);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.detail || "Failed to create category");
    },
  });

  const deleteIncomeMutation = useMutation({
    mutationFn: settingsApi.deleteIncomeCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income_categories"] });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const payload = {
      name: newCatName,
      color_hex: newCatColor,
      icon: activeTab === "expenses" ? "expense" : "income",
    };

    if (activeTab === "expenses") {
      createExpenseMutation.mutate(payload);
    } else {
      createIncomeMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    if (activeTab === "expenses") {
      deleteExpenseMutation.mutate(id);
    } else {
      deleteIncomeMutation.mutate(id);
    }
  };

  const categories = activeTab === "expenses" ? expenseCategories : incomeCategories;
  const isLoading = activeTab === "expenses" ? loadingExpenses : loadingIncomes;
  const isCreating = createExpenseMutation.isPending || createIncomeMutation.isPending;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Category Manager</h1>

      {errorMsg && (
        <div className="bg-destructive/15 text-destructive text-sm rounded-md border border-destructive/20 p-3">
          {errorMsg}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="expenses">Expense Categories</TabsTrigger>
          <TabsTrigger value="incomes">Income Categories</TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-5">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">
                New {activeTab === "expenses" ? "Expense" : "Income"} Category
              </h3>
              
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="catName">Category Name</Label>
                  <Input
                    id="catName"
                    required
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="catColor">Label Color</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="catColor"
                      type="color"
                      className="w-16 h-10 p-1 cursor-pointer"
                      value={newCatColor}
                      onChange={(e) => setNewCatColor(e.target.value)}
                    />
                    <Input
                      value={newCatColor}
                      onChange={(e) => setNewCatColor(e.target.value)}
                      className="flex-1 uppercase"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className={`w-full ${activeTab === "expenses" ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" : "bg-success hover:bg-success/90 text-success-foreground"}`}
                  disabled={isCreating}
                >
                  {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Create Category"}
                </Button>
              </form>
            </div>
          </div>

          <div className="md:col-span-7">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm min-h-[300px]">
              <h3 className="text-lg font-semibold mb-4">Active Categories</h3>

              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : categories.length === 0 ? (
                <div className="text-muted-foreground text-center py-8">
                  No categories defined yet.
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {categories.map((cat: any) => {
                    const id = activeTab === "expenses" ? cat.expense_category_id : cat.income_category_id;
                    return (
                      <li key={id} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full border border-border"
                            style={{ backgroundColor: cat.color_hex || "#ccc" }}
                          />
                          <span className="font-medium text-foreground">{cat.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(id)}
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
      </Tabs>
    </div>
  );
};
