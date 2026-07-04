import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { expensesApi } from "../api/expenses";
import { settingsApi } from "../../settings/api/settings";
import { ExpenseForm } from "./ExpenseForm";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Pencil, Trash2, Loader2, Copy } from "lucide-react";

export const ExpenseList: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // Dialog States
  const [openFormModal, setOpenFormModal] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<any>(null);
  const [expenseToDuplicate, setExpenseToDuplicate] = useState<any>(null);
  
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<any>(null);

  // Filter States
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    if (searchParams.get("create") === "true") {
      setExpenseToEdit(null);
      setExpenseToDuplicate(null);
      setOpenFormModal(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const { data: categories = [] } = useQuery({
    queryKey: ["expense_categories"],
    queryFn: settingsApi.listExpenseCategories,
  });

  const { data: expensesData, isLoading } = useQuery({
    queryKey: ["expenses", startDate, endDate, categoryId, statusFilter, page],
    queryFn: () =>
      expensesApi.listExpenses({
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        category_id: categoryId !== "all" ? categoryId : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        skip: (page - 1) * limit,
        limit,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, type }: { id: string; type: string }) =>
      expensesApi.deleteExpense(id, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard_summary"] });
      setOpenDeleteDialog(false);
    },
  });

  const handleEditClick = (expense: any) => {
    setExpenseToEdit(expense);
    setExpenseToDuplicate(null);
    setOpenFormModal(true);
  };

  const handleDuplicateClick = (expense: any) => {
    setExpenseToDuplicate(expense);
    setExpenseToEdit(null);
    setOpenFormModal(true);
  };

  const handleDeleteClick = (expense: any) => {
    setExpenseToDelete(expense);
    setOpenDeleteDialog(true);
  };

  const handleConfirmedDelete = (type: "single" | "subsequent" | "all") => {
    if (!expenseToDelete) return;
    deleteMutation.mutate({
      id: expenseToDelete.expense_id,
      type,
    });
  };

  const getCategoryName = (id: string) => {
    const cat = categories.find((c: any) => c.expense_category_id === id);
    return cat ? cat.name : "Uncategorized";
  };

  const totalPages = expensesData ? Math.ceil(expensesData.total_count / limit) : 0;
  const items = expensesData?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
        <Button variant="destructive" onClick={() => {
          setExpenseToEdit(null);
          setExpenseToDuplicate(null);
          setOpenFormModal(true);
        }}>
          New Expense
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="bg-card p-4 rounded-2xl shadow-sm border border-border grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Start Date</label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">End Date</label>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Category</label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat: any) => (
                <SelectItem key={cat.expense_category_id} value={cat.expense_category_id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Status</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No expenses found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((expense: any) => (
                  <TableRow key={expense.expense_id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(expense.date + "T00:00:00").toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">{expense.name}</div>
                      {expense.description && (
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {expense.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{getCategoryName(expense.expense_category_id)}</TableCell>
                    <TableCell className="text-destructive font-bold whitespace-nowrap">
                      $ {parseFloat(expense.amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${expense.status === "PAID" ? "bg-success/20 text-success" : "bg-warning/20 text-warning-foreground"}`}>
                        {expense.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDuplicateClick(expense)} className="text-primary hover:bg-primary/10" title="Duplicate">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(expense)} className="text-primary hover:bg-primary/10" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(expense)} className="text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
            Previous
          </Button>
          <div className="flex items-center px-4 font-medium">
            Page {page} of {totalPages}
          </div>
          <Button variant="outline" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
            Next
          </Button>
        </div>
      )}

      <Dialog open={openFormModal} onOpenChange={setOpenFormModal}>
        <DialogContent className="sm:max-w-[500px] p-0">
          <ExpenseForm
            expenseToEdit={expenseToEdit}
            expenseToDuplicate={expenseToDuplicate}
            onSuccess={() => setOpenFormModal(false)}
            onCancel={() => setOpenFormModal(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Expense</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground mt-2">
            Are you sure you want to delete this expense? If it is a recurring installment, choose how you would like to proceed.
          </div>
          <div className="flex flex-col gap-2 mt-6">
            {expenseToDelete?.transaction_group_id ? (
              <>
                <Button variant="destructive" onClick={() => handleConfirmedDelete("single")}>
                  Delete this installment only
                </Button>
                <Button variant="destructive" onClick={() => handleConfirmedDelete("subsequent")}>
                  Delete this and all future installments
                </Button>
                <Button variant="destructive" onClick={() => handleConfirmedDelete("all")}>
                  Delete all installments
                </Button>
              </>
            ) : (
              <Button variant="destructive" onClick={() => handleConfirmedDelete("single")}>
                Delete Transaction
              </Button>
            )}
            <Button variant="outline" onClick={() => setOpenDeleteDialog(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
