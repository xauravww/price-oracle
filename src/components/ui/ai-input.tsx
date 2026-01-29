"use client";

import { CornerRightUp, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AIInputProps {
  id?: string
  placeholder?: string
  minHeight?: number
  maxHeight?: number
  onSubmit?: (value: string) => void
  className?: string
  initialValue?: string
}

export function AIInput({
  id = "ai-input",
  placeholder = "Type your message...",
  minHeight = 52,
  maxHeight = 200,
  onSubmit,
  className,
  initialValue = ""
}: AIInputProps) {
  const [inputValue, setInputValue] = useState(initialValue);

  const handleReset = () => {
    if (!inputValue.trim()) return;
    onSubmit?.(inputValue);
    // Removed setInputValue("") to keep query persistent
  };

  const handleClear = () => {
    setInputValue("");
  };

  return (
    <div className={cn("relative max-w-xl w-full mx-auto", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center w-full bg-white rounded-[32px] border border-slate-200 transition-all duration-300 ease-out shadow-sm",
          "focus-within:border-slate-400 focus-within:shadow-[0_4px_20px_rgba(0,0,0,0.03)]",
          "min-h-[52px]"
        )}
        style={{ minHeight: `${minHeight}px` }}
      >
        {/* Ghost element to drive height */}
        <div
          className="w-full px-6 py-4 text-center invisible whitespace-pre-wrap break-words leading-relaxed text-slate-900 font-medium text-[15px]"
          aria-hidden="true"
          style={{ minHeight: `${minHeight}px`, maxHeight: `${maxHeight}px` }}
        >
          {inputValue || placeholder}
        </div>

        <textarea
          id={id}
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleReset();
            }
          }}
          className={cn(
            "absolute inset-0 w-full h-full bg-transparent px-6 py-4",
            "text-slate-900 text-center resize-none overflow-hidden placeholder:text-slate-400",
            "focus:outline-none font-medium text-[15px]",
            "flex items-center justify-center",
            "leading-relaxed"
          )}
        />

        <div className="flex items-center gap-1.5 absolute top-1/2 -translate-y-1/2 right-4 z-10">
          {inputValue && (
            <button
              onClick={handleClear}
              type="button"
              className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors duration-200 text-slate-400 hover:text-slate-600"
              title="Clear input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handleReset}
            type="button"
            className={cn(
              "rounded-full bg-slate-900 p-2 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
              inputValue
                ? "opacity-100 scale-100 translate-x-0"
                : "opacity-0 scale-90 translate-x-2 pointer-events-none"
            )}
          >
            <CornerRightUp className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
