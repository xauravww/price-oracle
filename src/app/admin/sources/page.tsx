"use client";

import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Plus, 
  Trash2, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle,
  Tag,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  getTrustedSources, 
  addTrustedSource, 
  deleteTrustedSource, 
  toggleSourceStatus 
} from "@/lib/actions";

export default function SourcesPage() {
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', url: '', category: 'E-commerce' });
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const defaultCategories = ["E-commerce", "Price Tracker", "Official Brand", "Classifieds", "Marketplace"];

  useEffect(() => {
    loadSources();
  }, []);

  async function loadSources() {
    setLoading(true);
    try {
      const data = await getTrustedSources();
      setSources(data);
    } catch (error) {
      console.error("Failed to load sources:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await addTrustedSource(formData.name, formData.url, formData.category);
      if (result.success) {
        setFormData({ name: '', url: '', category: 'E-commerce' });
        setIsCustomCategory(false);
        setIsDialogOpen(false);
        await loadSources();
      } else {
        alert("Error: " + result.error);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to remove this source?")) return;
    await deleteTrustedSource(id);
    await loadSources();
  }

  async function handleToggle(id: number, currentStatus: boolean) {
    await toggleSourceStatus(id, !currentStatus);
    await loadSources();
  }

  // Pagination Logic
  const totalPages = Math.ceil(sources.length / itemsPerPage);
  const paginatedSources = sources.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="container mx-auto px-4 py-6 lg:py-10 space-y-8 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Trusted Sources</h1>
          <p className="text-muted-foreground text-base max-w-2xl">
            Manage verified marketplaces used by the Price Engine.
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-11 px-6 text-base font-medium shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Source
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Source</DialogTitle>
              <DialogDescription>
                Register a new verified marketplace or brand website.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 py-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Source Name</label>
                <Input 
                  placeholder="e.g. Amazon India" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Base URL</label>
                <Input 
                  placeholder="https://amazon.in" 
                  type="url"
                  value={formData.url}
                  onChange={e => setFormData({...formData, url: e.target.value})}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold">Category</label>
                  <button 
                    type="button"
                    onClick={() => {
                      setIsCustomCategory(!isCustomCategory);
                      setFormData({...formData, category: isCustomCategory ? 'E-commerce' : ''});
                    }}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3" />
                    {isCustomCategory ? "Select existing" : "Add custom"}
                  </button>
                </div>
                
                {isCustomCategory ? (
                  <Input 
                    placeholder="Enter custom category" 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    required
                    className="h-11"
                  />
                ) : (
                  <select 
                    className="w-full h-11 px-3 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    {defaultCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                )}
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  Add Source
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-sm border-muted-foreground/10">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Active Sources
          </CardTitle>
          <CardDescription>Currently active sources used for price verification.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading sources...</p>
            </div>
          ) : sources.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed rounded-2xl bg-muted/10">
              <AlertCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">No trusted sources configured yet.</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Add your first source to get started.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4">
                {paginatedSources.map((source) => (
                  <div 
                    key={source.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border rounded-2xl hover:bg-muted/30 transition-all gap-4"
                  >
                    <div className="flex items-start sm:items-center gap-4 min-w-0">
                      <div className={`p-3 rounded-xl shrink-0 ${source.isActive ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="font-bold text-lg truncate">{source.name}</h4>
                          <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider px-2 py-0">{source.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5 truncate">
                          <span className="truncate">{source.url}</span>
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-end gap-2 sm:border-l sm:pl-4 shrink-0">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleToggle(source.id, source.isActive)}
                        className={`rounded-full transition-all duration-200 gap-2 ${
                          source.isActive 
                            ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200" 
                            : "text-slate-500 bg-slate-100 hover:bg-slate-200 border border-slate-200"
                        }`}
                        title={source.isActive ? "Deactivate Source" : "Activate Source"}
                      >
                        {source.isActive ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-xs font-medium">Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4" />
                            <span className="text-xs font-medium">Inactive</span>
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                        onClick={() => handleDelete(source.id)}
                        title="Delete Source"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sources.length)} of {sources.length} sources
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}