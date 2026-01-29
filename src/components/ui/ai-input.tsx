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
          "relative flex items-center justify-center w-full bg-white rounded-3xl border border-gray-200 transition-all duration-200 focus-within:ring-2 focus-within:ring-slate-500",
          "min-h-[52px]"
        )}
        style={{ minHeight: `${minHeight}px` }}
      >
        {/* Ghost element to drive height */}
        <div
          className="w-full px-12 py-3.5 text-center invisible whitespace-pre-wrap break-words leading-relaxed text-black"
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
            "absolute inset-0 w-full h-full bg-transparent px-12 py-3.5",
            "text-black text-center resize-none overflow-hidden",
            "focus:outline-none",
            "flex items-center justify-center",
            "leading-relaxed"
          )}
        />

        {/* Voice input icon disabled for now
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 rounded-xl bg-gray-100 py-1 px-1 transition-all duration-200 z-10",
            inputValue ? "right-10" : "right-3"
          )}
        >
          <Mic className="w-4 h-4 text-gray-600" />
        </div>
        */}

        <div className="flex items-center gap-1 absolute top-1/2 -translate-y-1/2 right-3 z-10">
          {inputValue && (
            <button
              onClick={handleClear}
              type="button"
              className="p-1 px-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200 text-gray-400 hover:text-gray-600"
              title="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleReset}
            type="button"
            className={cn(
              "rounded-xl bg-slate-900 py-1 px-1.5 transition-all duration-200",
              inputValue
                ? "opacity-100 scale-100 shadow-sm"
                : "opacity-0 scale-95 pointer-events-none"
            )}
          >
            <CornerRightUp className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
