import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, cn } from "@/lib/utils";
import { Wallet, CalendarClock, Activity, Bell, Check, X, AlertTriangle, Clock, MapPin, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ToolResponseUIProps {
  toolName: string;
  toolResult?: any;
  onSendMessage?: (content: string) => void;
}

export function ToolResponseUI({ toolName, toolResult, onSendMessage }: ToolResponseUIProps) {
  const [isResponded, setIsResponded] = React.useState(false);

  // If we don't have the actual result yet (during optimistic update), just show a loading/action chip
  if (!toolResult) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
        <span className="animate-pulse">●</span> Executing {toolName.replace("_", " ")}...
      </div>
    );
  }

  // Handle errors
  if (toolResult.error) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
        Error: {toolResult.error}
      </div>
    );
  }

  // Visual cards based on tool type
  switch (toolName) {
    case "manage_finance":
      return (
        <Card className="w-full max-w-sm border-primary/20 bg-primary/5 shadow-none">
          <CardHeader className="p-3 pb-0 flex flex-row items-center gap-2 space-y-0">
            <div className="rounded-full bg-primary/20 p-1.5">
              <Wallet className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-sm font-medium">Finance Updated</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-2">
            <p className="text-xs text-muted-foreground line-clamp-2">
              Action successful. Data has been synced to your dashboard.
            </p>
          </CardContent>
        </Card>
      );
      
    case "manage_schedule":
      return (
        <Card className="w-full max-w-sm border-blue-500/20 bg-blue-500/5 shadow-none">
          <CardHeader className="p-3 pb-0 flex flex-row items-center gap-2 space-y-0">
            <div className="rounded-full bg-blue-500/20 p-1.5">
              <CalendarClock className="h-4 w-4 text-blue-500" />
            </div>
            <CardTitle className="text-sm font-medium">Schedule Updated</CardTitle>
          </CardHeader>
        </Card>
      );

    case "check_affordability":
      const isRisky = toolResult.isRisky;
      return (
        <Card className="w-full max-w-sm border-orange-500/20 bg-orange-500/5 shadow-none">
          <CardHeader className="p-3 pb-0 flex flex-row items-center gap-2 space-y-0">
            <div className="rounded-full bg-orange-500/20 p-1.5">
              <Activity className="h-4 w-4 text-orange-500" />
            </div>
            <CardTitle className="text-sm font-medium">Affordability Check</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-2">
            <div className="flex flex-col gap-1 text-sm">
              <span className="flex justify-between">
                <span>Available:</span> 
                <span className="font-semibold">{formatCurrency(toolResult.availableBudget)}</span>
              </span>
              <span className="flex justify-between text-muted-foreground">
                <span>Remaining After:</span> 
                <span>{formatCurrency(toolResult.remainingAfter)}</span>
              </span>
              {isRisky && (
                <span className="mt-1 text-xs text-orange-600 font-medium bg-orange-100 p-1.5 rounded">
                  Warning: This leaves you with less than 10% of your budget.
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      );

    case "get_life_status":
      return (
        <Card className="w-full max-w-sm border-purple-500/20 bg-purple-500/5 shadow-none">
          <CardHeader className="p-3 pb-0 flex flex-row items-center gap-2 space-y-0">
            <div className="rounded-full bg-purple-500/20 p-1.5">
              <Activity className="h-4 w-4 text-purple-500" />
            </div>
            <CardTitle className="text-sm font-medium">Life Status Recap</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-2 grid grid-cols-2 gap-2 text-sm">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Spent</span>
              <span className="font-medium">{formatCurrency(toolResult.totalSpent)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Income</span>
              <span className="font-medium text-emerald-600">{formatCurrency(toolResult.totalIncome)}</span>
            </div>
          </CardContent>
        </Card>
      );

    case "set_reminder":
      return (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600">
          <Bell className="h-3 w-3" /> Reminder set
        </div>
      );

    case "request_confirmation": {
      const payload = toolResult.payload;
      const isSchedule = payload.action_type.includes("schedule");
      const isDelete = payload.action_type.includes("delete");
      const isUpdate = payload.action_type.includes("update");

      const handleApprove = () => {
        if (isResponded) {
          toast.info("Kartu ini sudah tidak berfungsi karena kamu sudah merespons.");
          return;
        }
        setIsResponded(true);
        onSendMessage?.("oke lanjut");
      };
      
      const handleReject = () => {
        if (isResponded) {
          toast.info("Kartu ini sudah tidak berfungsi karena kamu sudah merespons.");
          return;
        }
        setIsResponded(true);
        onSendMessage?.("batal");
      };

      return (
        <Card className={cn(
          "w-full max-w-sm border-2 overflow-hidden",
          isDelete ? "border-destructive/30 bg-destructive/5" : "border-primary/30 bg-primary/5"
        )}>
          <CardHeader className={cn(
            "p-3 pb-2 flex flex-row items-center gap-2 space-y-0",
            isDelete ? "bg-destructive/10" : "bg-primary/10"
          )}>
            <div className={cn(
              "rounded-full p-1.5",
              isDelete ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"
            )}>
              {isSchedule ? <CalendarClock className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
            </div>
            <CardTitle className="text-sm font-bold uppercase tracking-tight">
              {isDelete ? "Konfirmasi Hapus" : isUpdate ? "Konfirmasi Ubah" : "Konfirmasi Simpan"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {/* Main Info */}
            <div className="space-y-2">
              <h3 className="text-base font-semibold leading-tight">
                {isSchedule ? payload.title : payload.description || payload.category}
              </h3>
              
              <div className="grid gap-1.5">
                {/* Time/Date */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{payload.dateTime_wib_label || "Waktu saat ini"}</span>
                </div>

                {/* Amount/Cost */}
                {(payload.amount || payload.estimatedCost) && (
                  <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                    <Tag className="h-3.5 w-3.5" />
                    <span>{formatCurrency(payload.amount || payload.estimatedCost)}</span>
                    <Badge variant="outline" className="text-[10px] py-0 h-4 ml-1">
                      {payload.type === "income" ? "Pemasukan" : "Pengeluaran"}
                    </Badge>
                  </div>
                )}

                {/* Location */}
                {payload.location && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{payload.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Warning */}
            {payload.warning && (
              <div className="flex items-start gap-2 rounded-md bg-amber-500/10 p-2 text-[11px] text-amber-700 border border-amber-500/20">
                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>{payload.warning}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <Button 
                size="sm" 
                className={cn(
                  "flex-1 h-8 text-xs gap-1.5",
                  isResponded ? "bg-muted text-muted-foreground hover:bg-muted cursor-not-allowed" : ""
                )}
                onClick={handleApprove}
              >
                <Check className="h-3.5 w-3.5" /> Konfirmasi
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className={cn(
                  "flex-1 h-8 text-xs gap-1.5",
                  isResponded ? "bg-muted text-muted-foreground border-transparent cursor-not-allowed" : "border-muted-foreground/20"
                )}
                onClick={handleReject}
              >
                <X className="h-3.5 w-3.5" /> Batal
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    default:
      return (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          ✓ {toolName.replace("_", " ")}
        </div>
      );
  }
}
