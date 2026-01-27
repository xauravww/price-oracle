"use client";

import { useState, useEffect } from "react";
import { Loader2, Search, BarChart, Database, Zap, Globe } from "lucide-react";

const steps = [
  { icon: Search, text: "Analyzing query parameters..." },
  { icon: Database, text: "Scanning historical price data..." },
  { icon: Globe, text: "Fetching real-time global benchmarks..." },
  { icon: Zap, text: "Verifying market signals..." },
  { icon: BarChart, text: "Synthesizing final valuation report..." },
];

export function CreativeLoader() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 800);

    return () => clearInterval(interval);
  }, []);

  const StepIcon = steps[currentStep].icon;

  return (
    <div className="flex flex-col items-center justify-center py-12 animate-in fade-in duration-500 max-w-md mx-auto">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl animate-pulse"></div>
        <div className="relative w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center border border-slate-100">
          <StepIcon className="w-8 h-8 text-blue-600 animate-bounce" />
        </div>
      </div>
      
      <div className="space-y-4 w-full px-6">
        <h3 className="text-xl font-bold text-slate-900 text-center mb-6">
          Price Oracle AI is working
        </h3>
        
        <div className="space-y-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div 
                key={index}
                className={`flex items-center gap-3 transition-all duration-500 ${
                  isActive || isCompleted ? "opacity-100 translate-x-0" : "opacity-30 translate-x-4"
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors duration-300 ${
                  isCompleted 
                    ? "bg-emerald-500 border-emerald-500 text-white" 
                    : isActive 
                      ? "border-blue-500 text-blue-500 bg-blue-50"
                      : "border-slate-200 text-slate-300"
                }`}>
                  {isCompleted ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isActive ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                  )}
                </div>
                <span className={`text-sm font-medium transition-colors ${
                  isActive ? "text-slate-900" : isCompleted ? "text-slate-500" : "text-slate-400"
                }`}>
                  {step.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
