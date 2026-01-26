"use client";

import { CornerRightUp, Mic, Image as ImageIcon, X } from "lucide-react";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface AIInputProps {
  id?: string
  placeholder?: string
  minHeight?: number
  maxHeight?: number
  onSubmit?: (value: string, image?: string) => void
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
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    if (!inputValue.trim() && !image) return;
    onSubmit?.(inputValue, image || undefined);
    setInputValue("");
    setImage(null);
  };

  return (
    <div className={cn("relative max-w-xl w-full mx-auto", className)}>
      {image && (
        <div className="absolute bottom-full mb-2 left-0 p-2 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center gap-2">
          <img src={image} alt="Preview" className="w-12 h-12 object-cover rounded-lg" />
          <button 
            onClick={() => setImage(null)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      )}
      
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

        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center z-10">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ImageIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 rounded-xl bg-gray-100 py-1 px-1 transition-all duration-200 z-10",
            inputValue || image ? "right-10" : "right-3"
          )}
        >
          <Mic className="w-4 h-4 text-gray-600" />
        </div>
        
        <button
          onClick={handleReset}
          type="button"
          className={cn(
            "absolute top-1/2 -translate-y-1/2 right-3 z-10",
            "rounded-xl bg-gray-100 py-1 px-1",
            "transition-all duration-200",
            inputValue || image
              ? "opacity-100 scale-100"
              : "opacity-0 scale-95 pointer-events-none"
          )}
        >
          <CornerRightUp className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  );
}
