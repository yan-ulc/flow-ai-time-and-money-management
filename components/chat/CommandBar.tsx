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
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 via-primary/5 to-blue-500/10 rounded-full blur-md opacity-70 group-hover:opacity-100 transition duration-500" />
      <form 
        onSubmit={handleSubmit}
        className="relative flex items-center bg-background/80 backdrop-blur-2xl border border-border/50 rounded-full shadow-lg overflow-hidden"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything or capture an event..."
          className="pr-14 py-7 text-[15px] rounded-full bg-transparent border-none focus-visible:ring-0 shadow-none placeholder:text-muted-foreground/70"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          size="icon"
          disabled={!input.trim() || isLoading}
          className="absolute right-2 h-10 w-10 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
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
