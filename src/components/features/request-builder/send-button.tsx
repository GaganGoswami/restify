"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";

interface SendButtonProps {
  onSend: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function SendButton({ onSend, isLoading, disabled }: SendButtonProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (!disabled && !isLoading) {
          onSend();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSend, disabled, isLoading]);

  return (
    <Button onClick={onSend} disabled={disabled || isLoading} size="lg">
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Sending...
        </>
      ) : (
        <>
          <Send className="mr-2 h-4 w-4" />
          Send
        </>
      )}
    </Button>
  );
}
