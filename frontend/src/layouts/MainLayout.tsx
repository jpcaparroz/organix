import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { ArrowDownCircle, ArrowUpCircle, Plus } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { AppNavbar } from "../components/navigation/AppNavbar";

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const [openTransactionModal, setOpenTransactionModal] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-background relative">
      <AppNavbar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col pt-8 md:pt-12 pb-24 md:pb-12 w-full max-w-7xl mx-auto px-4 md:px-8">
        <Outlet />
      </main>

      {/* Floating Action Button */}
      <Button
        size="icon"
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 size-14 rounded-full shadow-lg z-40"
        onClick={() => setOpenTransactionModal(true)}
      >
        <Plus className="size-6" />
      </Button>

      {/* Transaction Modal */}
      <Dialog open={openTransactionModal} onOpenChange={setOpenTransactionModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Create Transaction</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-4">
            <Button
              variant="destructive"
              className="w-full h-14 text-lg"
              onClick={() => {
                setOpenTransactionModal(false);
                navigate("/expenses?create=true");
              }}
            >
              <ArrowDownCircle className="size-6 mr-2" />
              New Expense
            </Button>
            <Button
              className="w-full h-14 text-lg bg-success hover:bg-success/90 text-success-foreground"
              onClick={() => {
                setOpenTransactionModal(false);
                navigate("/incomes?create=true");
              }}
            >
              <ArrowUpCircle className="size-6 mr-2" />
              New Income
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
