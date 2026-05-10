import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendHorizonal, Loader2 } from "lucide-react";

interface CommandBarProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export function CommandBar({ onSendMessage, isLoading }: CommandBarProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    onSendMessage(input);
    setInput("");
  };

  return (
    <div className="p-4">
      <form 
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto relative flex items-center"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. Futsal besok jam 8 malam, 50rb..."
          className="pr-12 py-6 rounded-full bg-muted/50 border-transparent focus-visible:ring-1 focus-visible:ring-primary shadow-sm"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          size="icon"
          disabled={!input.trim() || isLoading}
          className="absolute right-1.5 h-9 w-9 rounded-full transition-all"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <SendHorizonal className="h-4 w-4" />
          )}
          <span className="sr-only">Send message</span>
        </Button>
      </form>
    </div>
  );
}
