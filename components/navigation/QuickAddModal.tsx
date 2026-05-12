import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, Wallet, Check, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function QuickAddModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { user: clerkUser } = useUser();
  const dbUser = useQuery(api.users.getUserByClerkId, clerkUser?.id ? { clerkId: clerkUser.id } : "skip");
  
  const addFinance = useMutation(api.finances.insertFinance);
  const addSchedule = useMutation(api.schedules.insertSchedule);

  const [isScheduleEnabled, setIsScheduleEnabled] = useState(false);
  const [isExpenseEnabled, setIsExpenseEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("other");

  const handleSave = async () => {
    if (!dbUser) return;
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setIsLoading(true);
    try {
      let scheduleId;
      if (isScheduleEnabled) {
        const dateTime = new Date(`${date}T${time}`).getTime() || Date.now();
        scheduleId = await addSchedule({
          userId: dbUser._id,
          title,
          dateTime,
          duration: 60,
          status: "upcoming",
        });
      }

      if (isExpenseEnabled) {
        await addFinance({
          userId: dbUser._id,
          amount: parseFloat(amount) || 0,
          type: "expense",
          category,
          description: title + (description ? `: ${description}` : ""),
          status: isScheduleEnabled ? "planned" : "actual",
          dateTime: isScheduleEnabled ? new Date(`${date}T${time}`).getTime() || Date.now() : Date.now(),
          relatedScheduleId: scheduleId,
        });
      }

      toast.success("Successfully captured!");
      onOpenChange(false);
      // Reset form
      setTitle("");
      setDescription("");
      setIsScheduleEnabled(false);
      setIsExpenseEnabled(false);
    } catch (error) {
      toast.error("Failed to save. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-[95vw] sm:max-w-lg h-auto max-h-[90vh] overflow-hidden rounded-[2.5rem] border border-border/40 bg-background/80 backdrop-blur-3xl p-0 shadow-2xl flex flex-col focus-visible:outline-none"
      >
        <div className="flex-1 overflow-y-auto px-6 py-8 pb-28 sm:px-8 hide-scrollbar">
          <DialogHeader className="text-left mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-2xl bg-primary/10">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <DialogTitle className="text-3xl font-bold tracking-tight">Capture</DialogTitle>
            </div>
            <p className="text-sm text-muted-foreground/80 font-medium ml-1">What's on your mind today?</p>
          </DialogHeader>
          
          <div className="flex flex-col gap-8">
            {/* Basic Info */}
            <div className="space-y-4">
              <Input 
                placeholder="Title (e.g., Futsal, Dinner, Salary)" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl font-semibold h-14 bg-muted/20 border-none focus-visible:ring-1 shadow-sm px-4 rounded-2xl"
              />
              <Input 
                placeholder="Description (Optional)" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-base h-12 bg-muted/20 border-none focus-visible:ring-1 shadow-sm px-4 rounded-2xl"
              />
            </div>

            <div className="h-[1px] w-full bg-border/40 my-2" />

            {/* Schedule Section Toggle */}
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => setIsScheduleEnabled(!isScheduleEnabled)}
                className="flex items-center justify-between w-full p-4 rounded-[1.5rem] border border-border/40 bg-muted/10 hover:bg-muted/20 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("p-3 rounded-xl transition-all", isScheduleEnabled ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-muted text-muted-foreground")}>
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-base font-bold">Add to schedule</span>
                    <span className="text-xs text-muted-foreground">Pick a date and time</span>
                  </div>
                </div>
                <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all", isScheduleEnabled ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30")}>
                  {isScheduleEnabled && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>

              <AnimatePresence>
                {isScheduleEnabled && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0, marginTop: -10 }}
                    animate={{ height: "auto", opacity: 1, marginTop: 0 }}
                    exit={{ height: 0, opacity: 0, marginTop: -10 }}
                    className="grid grid-cols-2 gap-4 overflow-hidden"
                  >
                    <Input 
                      type="date" 
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="bg-muted/20 border-none h-12 text-sm rounded-xl px-4" 
                    />
                    <Input 
                      type="time" 
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="bg-muted/20 border-none h-12 text-sm rounded-xl px-4" 
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Expense Section Toggle */}
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => setIsExpenseEnabled(!isExpenseEnabled)}
                className="flex items-center justify-between w-full p-4 rounded-[1.5rem] border border-border/40 bg-muted/10 hover:bg-muted/20 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("p-3 rounded-xl transition-all", isExpenseEnabled ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" : "bg-muted text-muted-foreground")}>
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-base font-bold">Add expense</span>
                    <span className="text-xs text-muted-foreground">Log your spending</span>
                  </div>
                </div>
                <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all", isExpenseEnabled ? "bg-rose-500 border-rose-500 text-white" : "border-muted-foreground/30")}>
                  {isExpenseEnabled && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>

              <AnimatePresence>
                {isExpenseEnabled && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0, marginTop: -10 }}
                    animate={{ height: "auto", opacity: 1, marginTop: 0 }}
                    exit={{ height: 0, opacity: 0, marginTop: -10 }}
                    className="grid grid-cols-2 gap-4 overflow-hidden"
                  >
                    <Input 
                      type="number" 
                      placeholder="Rp Amount" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-muted/20 border-none h-12 text-sm rounded-xl px-4" 
                    />
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="flex h-12 w-full rounded-xl bg-muted/20 px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border-none"
                    >
                      <option value="other">Category</option>
                      <option value="food">Food & Dining</option>
                      <option value="transport">Transportation</option>
                      <option value="entertainment">Entertainment</option>
                      <option value="shopping">Shopping</option>
                      <option value="bills">Bills & Utilities</option>
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Floating Action Area */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background/95 to-transparent pt-12 pointer-events-none">
          <Button 
            className="w-full rounded-2xl h-14 text-lg font-bold shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-[0.98] pointer-events-auto bg-primary text-primary-foreground"
            disabled={isLoading || !title}
            onClick={handleSave}
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : null}
            Save to OS
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
