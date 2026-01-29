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
    <div className="max-w-6xl mx-auto space-y-8 md:space-y-12 overflow-x-hidden px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl md:text-6xl font-doto font-black uppercase tracking-tighter leading-none">Trusted<br /><span className="text-emerald-600">Sources</span>.</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs border-l-4 border-black pl-4">
            Manage verified marketplaces used by the Price Engine.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-14 px-8 text-base font-doto font-bold uppercase tracking-wider rounded-none border-2 border-black bg-black text-white hover:bg-white hover:text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
              <Plus className="w-5 h-5 mr-3" />
              Add Source
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] border-4 border-black rounded-none shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] p-8">
            <DialogHeader>
              <DialogTitle className="font-doto font-black text-2xl uppercase tracking-tighter mb-2">Add New Source</DialogTitle>
              <DialogDescription className="text-gray-600 font-bold uppercase tracking-widest text-xs">
                Register a new verified marketplace or brand website.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 py-6">
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider block">Source Name</label>
                <Input
                  placeholder="E.G. AMAZON INDIA"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-12 border-2 border-black rounded-none focus:ring-0 focus:bg-yellow-50 focus:border-black font-bold uppercase placeholder:normal-case placeholder:text-gray-400"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider block">Base URL</label>
                <Input
                  placeholder="https://amazon.in"
                  type="url"
                  value={formData.url}
                  onChange={e => setFormData({ ...formData, url: e.target.value })}
                  required
                  className="h-12 border-2 border-black rounded-none focus:ring-0 focus:bg-yellow-50 focus:border-black font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold uppercase tracking-wider block">Category</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomCategory(!isCustomCategory);
                      setFormData({ ...formData, category: isCustomCategory ? 'E-commerce' : '' });
                    }}
                    className="text-xs font-bold text-black border-b-2 border-black hover:bg-black hover:text-white transition-colors"
                  >
                    {isCustomCategory ? "SELECT EXISTING" : "ADD CUSTOM"}
                  </button>
                </div>

                {isCustomCategory ? (
                  <Input
                    placeholder="ENTER CUSTOM CATEGORY"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="h-12 border-2 border-black rounded-none focus:ring-0 focus:bg-yellow-50 focus:border-black font-bold uppercase"
                  />
                ) : (
                  <select
                    className="w-full h-12 px-3 border-2 border-black bg-white focus:outline-none focus:bg-yellow-50 font-bold uppercase text-sm"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    {defaultCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                )}
              </div>
              <DialogFooter className="pt-6">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={submitting} className="rounded-none border-2 border-black font-bold uppercase tracking-wider h-12 hover:bg-gray-100">
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="rounded-none border-2 border-black bg-emerald-500 text-black hover:bg-emerald-400 font-bold uppercase tracking-wider h-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  Add Source
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="pb-8 px-0 border-b-2 border-black mb-8">
          <CardTitle className="text-2xl font-doto font-bold uppercase tracking-wider flex items-center gap-3">
            <Globe className="w-6 h-6" />
            Active Index
          </CardTitle>
          <CardDescription className="font-bold uppercase tracking-widest text-xs text-gray-500 mt-2">Currently active sources used for price verification.</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-6 border-2 border-black border-dashed bg-gray-50">
              <Loader2 className="w-12 h-12 animate-spin text-black" />
              <p className="font-bold uppercase tracking-widest text-gray-400">Loading sources...</p>
            </div>
          ) : sources.length === 0 ? (
            <div className="text-center py-24 border-2 border-black border-dashed bg-gray-50">
              <div className="inline-flex p-4 border-2 border-black bg-white mb-6">
                <AlertCircle className="w-8 h-8 text-black" />
              </div>
              <p className="font-doto font-bold text-xl uppercase mb-2">Index Empty</p>
              <p className="text-xs font-bold uppercase text-gray-400 tracking-widest">Add your first source to get started.</p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid gap-6">
                {paginatedSources.map((source) => (
                  <div
                    key={source.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-6 border-2 border-black bg-white hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all group gap-6 mr-2 md:mr-0"
                  >
                    <div className="flex items-start md:items-center gap-4 md:gap-6 min-w-0 w-full">
                      <div className={`p-4 border-2 border-black shrink-0 ${source.isActive ? 'bg-emerald-400 text-black' : 'bg-gray-100 text-gray-400'}`}>
                        <ShieldCheck className="w-8 h-8" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <h4 className="font-doto font-bold text-xl uppercase tracking-tight truncate">{source.name}</h4>
                          <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest h-auto border border-black bg-yellow-300 text-black">{source.category}</span>
                        </div>
                        <p className="text-sm font-mono text-gray-500 flex items-center gap-2 truncate">
                          <span className="truncate border-b border-dashed border-gray-400">{source.url}</span>
                          <ExternalLink className="w-3 h-3 shrink-0 opacity-50" />
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 sm:border-l-2 sm:border-black sm:pl-6 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggle(source.id, source.isActive)}
                        className={`rounded-none border-2 border-black h-10 px-4 transition-all gap-2 ${source.isActive
                          ? "bg-black text-white hover:bg-emerald-500 hover:text-black"
                          : "bg-white text-black hover:bg-gray-200"
                          }`}
                        title={source.isActive ? "Deactivate Source" : "Activate Source"}
                      >
                        {source.isActive ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Inactive</span>
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-none border-2 border-black text-black hover:bg-red-600 hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]"
                        onClick={() => handleDelete(source.id)}
                        title="Delete Source"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls - Brutalist */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t-2 border-black pt-8">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, sources.length)} of {sources.length} sources
                  </p>
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="rounded-none border-2 border-black h-12 w-12 hover:bg-black hover:text-white disabled:opacity-20 disabled:hover:bg-white disabled:hover:text-black transition-all"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded-none border-2 border-black h-12 w-12 hover:bg-black hover:text-white disabled:opacity-20 disabled:hover:bg-white disabled:hover:text-black transition-all"
                    >
                      <ChevronRight className="w-6 h-6" />
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