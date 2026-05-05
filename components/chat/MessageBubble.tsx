import React from "react";
import { cn } from "@/lib/utils";
import { ToolResponseUI } from "./ToolResponseUI";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  toolsUsed?: string[];
  toolResults?: any[];
}

export function MessageBubble({ role, content, toolsUsed, toolResults }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={cn("flex w-full mb-6", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-5 py-3",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-none"
            : "bg-muted text-foreground rounded-bl-none"
        )}
      >
        {toolsUsed && toolsUsed.length > 0 && (
          <div className="mb-3 space-y-2">
            {toolsUsed.map((tool, idx) => (
              <ToolResponseUI 
                key={idx} 
                toolName={tool} 
                toolResult={toolResults ? toolResults[idx] : undefined} 
              />
            ))}
          </div>
        )}
        
        {content && (
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {content}
          </div>
        )}
      </div>
    </div>
  );
}
