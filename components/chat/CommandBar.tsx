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
    <div className="relative group w-full max-w-3xl mx-auto">
      {/* Soft ambient glow that intensifies on focus */}
      <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 rounded-full blur-xl opacity-40 group-focus-within:opacity-80 transition duration-500 pointer-events-none" />
      
      <form 
        onSubmit={handleSubmit}
        className="relative flex items-center bg-card/95 backdrop-blur-3xl border border-border rounded-full shadow-lg dark:shadow-[0_8px_32px_rgba(0,0,0,0.6)] group-focus-within:border-foreground/30 transition-colors duration-300 overflow-hidden"
      >
        {/* Inner top edge highlight */}
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.15] to-transparent pointer-events-none opacity-0 dark:opacity-100" />
        
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything or capture an event..."
          className="pr-14 py-7 text-[15px] rounded-full bg-transparent border-none focus-visible:ring-0 shadow-none placeholder:text-muted-foreground/50 text-foreground"
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
