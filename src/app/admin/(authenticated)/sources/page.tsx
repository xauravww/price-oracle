"use client";



import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
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
  ChevronRight,
  Ban,
  Filter,
  Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  toggleSourceStatus,
  getBlacklistRules,
  addBlacklistRule,
  deleteBlacklistRule,
  toggleBlacklistRule,
  generateRegexPattern,
  updateTrustedSource,
  updateBlacklistRule
} from "@/lib/actions";

export default function SourcesPage() {
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', url: '', category: 'E-commerce', priceSelector: '' });
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const defaultCategories = ["E-commerce", "Price Tracker", "Official Brand", "Classifieds", "Marketplace"];

  // Blacklist State
  const [blacklistRules, setBlacklistRules] = useState<any[]>([]);
  const [loadingRules, setLoadingRules] = useState(true);
  const [ruleFormData, setRuleFormData] = useState({ pattern: '', type: 'DOMAIN', description: '' });
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Edit State
  const [editingSourceId, setEditingSourceId] = useState<number | null>(null);
  const [editingRuleId, setEditingRuleId] = useState<number | null>(null);

  useEffect(() => {
    loadSources();
    loadBlacklistRules();
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

  async function loadBlacklistRules() {
    setLoadingRules(true);
    try {
      const data = await getBlacklistRules();
      setBlacklistRules(data);
    } catch (error) {
      console.error("Failed to load blacklist rules:", error);
    } finally {
      setLoadingRules(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      let result;
      if (editingSourceId) {
        result = await updateTrustedSource(editingSourceId, {
          name: formData.name,
          url: formData.url,
          category: formData.category,
          priceSelector: formData.priceSelector
        });
      } else {
        result = await addTrustedSource(formData.name, formData.url, formData.category, formData.priceSelector);
      }

      if (result.success) {
        setFormData({ name: '', url: '', category: 'E-commerce', priceSelector: '' });
        setIsCustomCategory(false);
        setIsDialogOpen(false);
        setEditingSourceId(null);
        await loadSources();
        toast.success(editingSourceId ? "Source updated successfully" : "Source added successfully");
      } else {
        toast.error("Error: " + result.error);
      }
    } finally {
      setSubmitting(false);
    }
  }

  function openAddDialog() {
    setEditingSourceId(null);
    setFormData({ name: '', url: '', category: 'E-commerce', priceSelector: '' });
    setIsDialogOpen(true);
  }

  function openEditDialog(source: any) {
    setEditingSourceId(source.id);
    setFormData({
      name: source.name,
      url: source.url,
      category: source.category,
      priceSelector: source.priceSelector || ''
    });
    setIsDialogOpen(true);
  }

  // Regex Validation State
  const [isRegexValid, setIsRegexValid] = useState(true);

  useEffect(() => {
    if (ruleFormData.type === 'REGEX' && ruleFormData.pattern) {
      try {
        new RegExp(ruleFormData.pattern);
        setIsRegexValid(true);
      } catch (e) {
        setIsRegexValid(false);
      }
    } else {
      setIsRegexValid(true);
    }
  }, [ruleFormData.pattern, ruleFormData.type]);

  async function handleRuleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!isRegexValid) {
      toast.error("Invalid Regex Pattern");
      return;
    }

    setSubmitting(true);
    try {
      let result;
      if (editingRuleId) {
        result = await updateBlacklistRule(editingRuleId, {
          pattern: ruleFormData.pattern,
          type: ruleFormData.type as 'DOMAIN' | 'REGEX',
          description: ruleFormData.description
        });
      } else {
        result = await addBlacklistRule(ruleFormData.pattern, ruleFormData.type as 'DOMAIN' | 'REGEX', ruleFormData.description);
      }

      if (result.success) {
        setRuleFormData({ pattern: '', type: 'DOMAIN', description: '' });
        setIsRuleDialogOpen(false);
        setEditingRuleId(null);
        await loadBlacklistRules();
        toast.success(editingRuleId ? "Rule updated successfully" : "Rule added successfully");
      } else {
        toast.error("Error: " + result.error);
      }
    } finally {
      setSubmitting(false);
    }
  }

  function openAddRuleDialog() {
    setEditingRuleId(null);
    setRuleFormData({ pattern: '', type: 'DOMAIN', description: '' });
    setIsRuleDialogOpen(true);
  }

  function openEditRuleDialog(rule: any) {
    setEditingRuleId(rule.id);
    setRuleFormData({
      pattern: rule.pattern,
      type: rule.type,
      description: rule.description || ''
    });
    setIsRuleDialogOpen(true);
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to remove this source?")) return;
    await deleteTrustedSource(id);
    await loadSources();
    toast.success("Source removed");
  }

  async function handleDeleteRule(id: number) {
    if (!confirm("Are you sure you want to remove this rule?")) return;
    await deleteBlacklistRule(id);
    await loadBlacklistRules();
    toast.success("Rule removed");
  }

  async function handleToggle(id: number, currentStatus: boolean) {
    await toggleSourceStatus(id, !currentStatus);
    await loadSources();
    toast.success(currentStatus ? "Source deactivated" : "Source activated");
  }

  async function handleToggleRule(id: number, currentStatus: boolean) {
    await toggleBlacklistRule(id, !currentStatus);
    await loadBlacklistRules();
    toast.success(currentStatus ? "Rule deactivated" : "Rule activated");
  }

  async function handleGenerateRegex() {
    if (!ruleFormData.description) {
      toast.error("Please enter a description first.");
      return;
    }

    setIsGenerating(true);
    try {
      // If user hasn't selected REGEX yet, switch to it
      if (ruleFormData.type !== 'REGEX') {
        setRuleFormData(prev => ({ ...prev, type: 'REGEX' }));
      }

      const result = await generateRegexPattern(ruleFormData.description);
      if (result.success && result.pattern) {
        setRuleFormData(prev => ({ ...prev, pattern: result.pattern!, type: 'REGEX' }));
        toast.success("Regex generated!");
      } else {
        toast.error("Failed to generate: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      toast.error("Failed to connect to AI service.");
    } finally {
      setIsGenerating(false);
    }
  }

  // Pagination Logic
  const totalPages = Math.ceil(sources.length / itemsPerPage);
  const paginatedSources = sources.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 md:space-y-12 overflow-x-hidden px-4 md:px-0">
      <Tabs defaultValue="sources" className="w-full">
        <TabsList className="mb-8 w-full justify-start rounded-none border-b-2 border-black bg-transparent p-0 h-auto">
          <TabsTrigger
            value="sources"
            className="rounded-none border-b-4 border-transparent px-6 py-3 font-bold uppercase tracking-widest text-gray-400 data-[state=active]:border-black data-[state=active]:text-black data-[state=active]:bg-transparent transition-all"
          >
            Verified Sources
          </TabsTrigger>
          <TabsTrigger
            value="blacklist"
            className="rounded-none border-b-4 border-transparent px-6 py-3 font-bold uppercase tracking-widest text-gray-400 data-[state=active]:border-red-500 data-[state=active]:text-red-500 data-[state=active]:bg-transparent transition-all"
          >
            Blacklist Rules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sources">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div className="flex flex-col gap-4">
              <h2 className="text-3xl font-doto font-black uppercase tracking-tighter">Trusted<br /><span className="text-emerald-600">Sources</span>.</h2>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs border-l-4 border-black pl-4">
                Manage verified marketplaces used by the Price Engine.
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddDialog} className="h-12 px-6 text-sm font-bold uppercase tracking-wider rounded-none border-2 border-black bg-black text-white hover:bg-white hover:text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Source
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] border-4 border-black rounded-none shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] p-8">
                <DialogHeader>
                  <DialogTitle className="font-doto font-black text-2xl uppercase tracking-tighter mb-2">
                    {editingSourceId ? "Edit Source" : "Add New Source"}
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 font-bold uppercase tracking-widest text-xs">
                    Register a new verified marketplace or brand website.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 py-6">
                  {/* ... (Existing Source Form Fields) ... */}
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
                    <label className="text-sm font-bold uppercase tracking-wider block">Price Selector (Optional)</label>
                    <Input
                      placeholder="E.G. .a-price-whole, #priceblock_ourprice"
                      value={formData.priceSelector}
                      onChange={e => setFormData({ ...formData, priceSelector: e.target.value })}
                      className="h-12 border-2 border-black rounded-none focus:ring-0 focus:bg-yellow-50 focus:border-black font-mono text-sm"
                    />
                    <p className="text-[10px] uppercase font-bold text-gray-400">
                      CSS Selector to target precise price element.
                    </p>
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
                      {editingSourceId ? "Update Source" : "Add Source"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="border-0 shadow-none bg-transparent">
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
                              <span className="truncate border-b border-dashed border-gray-400 max-w-[200px]">{source.url}</span>
                              <ExternalLink className="w-3 h-3 shrink-0 opacity-50" />
                              {source.priceSelector && (
                                <span className="ml-2 px-2 py-0.5 bg-gray-100 border border-black text-[10px] text-black rounded-none font-bold uppercase tracking-wider shrink-0">
                                  {source.priceSelector}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 sm:border-l-2 sm:border-black sm:pl-6 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(source)}
                            className="h-10 w-10 rounded-none border-2 border-black text-black hover:bg-black hover:text-white transition-all mr-2"
                            title="Edit Source"
                          >
                            <Zap className="w-4 h-4" />
                          </Button>
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
        </TabsContent>

        <TabsContent value="blacklist">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div className="flex flex-col gap-4">
              <h2 className="text-3xl font-doto font-black uppercase tracking-tighter">Blacklist<br /><span className="text-red-600">Rules</span>.</h2>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs border-l-4 border-red-500 pl-4">
                Block domains or regular expressions from search results.
              </p>
            </div>

            <Dialog open={isRuleDialogOpen} onOpenChange={setIsRuleDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddRuleDialog} className="h-12 px-6 text-sm font-bold uppercase tracking-wider rounded-none border-2 border-black bg-red-600 text-white hover:bg-black hover:text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Rule
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] border-4 border-black rounded-none shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] p-8">
                <DialogHeader>
                  <DialogTitle className="font-doto font-black text-2xl uppercase tracking-tighter mb-2">
                    {editingRuleId ? "Edit Filter Rule" : "Create Filter Rule"}
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 font-bold uppercase tracking-widest text-xs">
                    Define a new pattern to exclude from search results.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleRuleSubmit} className="space-y-6 py-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider block">Rule Type</label>
                    <select
                      className="w-full h-12 px-3 border-2 border-black bg-white focus:outline-none focus:bg-yellow-50 font-bold uppercase text-sm"
                      value={ruleFormData.type}
                      onChange={e => setRuleFormData({ ...ruleFormData, type: e.target.value })}
                    >
                      <option value="DOMAIN">Exact Domain</option>
                      <option value="REGEX">Regular Expression</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider block">Pattern</label>
                    <Input
                      placeholder={ruleFormData.type === 'DOMAIN' ? "E.G. amazon.in" : "E.G. /s\?k=.*"}
                      value={ruleFormData.pattern}
                      onChange={e => setRuleFormData({ ...ruleFormData, pattern: e.target.value })}
                      required
                      className={`h-12 border-2 rounded-none focus:ring-0 focus:bg-yellow-50 font-mono text-sm ${!isRegexValid ? 'border-red-500 bg-red-50' : 'border-black focus:border-black'
                        }`}
                    />
                    {!isRegexValid && (
                      <p className="text-[10px] font-bold uppercase tracking-widest text-red-500">
                        Invalid Regular Expression Syntax
                      </p>
                    )}
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      {ruleFormData.type === 'DOMAIN'
                        ? "Blocks all URLs from this domain."
                        : "Blocks URLs matching this regex pattern."}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider block">Description</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="E.G. Filter search result pages"
                        value={ruleFormData.description}
                        onChange={e => setRuleFormData({ ...ruleFormData, description: e.target.value })}
                        className="h-12 border-2 border-black rounded-none focus:ring-0 focus:bg-yellow-50 focus:border-black font-bold uppercase flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGenerateRegex}
                        disabled={isGenerating || !ruleFormData.description}
                        className="h-12 px-4 rounded-none border-2 border-black font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-all whitespace-nowrap"
                        title="Generate Regex from Description"
                      >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <div className="flex items-center gap-2"><Zap className="w-4 h-4" /> <span>AI Gen</span></div>}
                      </Button>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Describe what to block and click 'AI GEN' to auto-create the pattern.
                    </p>
                  </div>
                  <DialogFooter className="pt-6">
                    <Button type="button" variant="outline" onClick={() => setIsRuleDialogOpen(false)} disabled={submitting} className="rounded-none border-2 border-black font-bold uppercase tracking-wider h-12 hover:bg-gray-100">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting} className="rounded-none border-2 border-black bg-red-600 text-white hover:bg-red-500 font-bold uppercase tracking-wider h-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                      {editingRuleId ? "Update Rule" : "Add Rule"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="border-0 shadow-none bg-transparent">
            <CardContent className="px-0">
              {loadingRules ? (
                <div className="flex flex-col items-center justify-center py-20 gap-6 border-2 border-black border-dashed bg-gray-50">
                  <Loader2 className="w-12 h-12 animate-spin text-black" />
                  <p className="font-bold uppercase tracking-widest text-gray-400">Loading rules...</p>
                </div>
              ) : blacklistRules.length === 0 ? (
                <div className="text-center py-24 border-2 border-black border-dashed bg-gray-50">
                  <div className="inline-flex p-4 border-2 border-black bg-white mb-6">
                    <ShieldCheck className="w-8 h-8 text-black" />
                  </div>
                  <p className="font-doto font-bold text-xl uppercase mb-2">No Rules Active</p>
                  <p className="text-xs font-bold uppercase text-gray-400 tracking-widest">All search results are currently permitted.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {blacklistRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-6 border-2 border-black bg-white hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all group gap-6"
                    >
                      <div className="flex items-start md:items-center gap-4 md:gap-6 min-w-0 flex-1">
                        <div className={`p-4 border-2 border-black shrink-0 ${rule.isActive ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                          <Ban className="w-8 h-8" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-3">
                            <h4 className="font-mono font-bold text-lg truncate text-red-600">{rule.pattern}</h4>
                            <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest h-auto border border-black bg-gray-200 text-black">{rule.type}</span>
                          </div>
                          <p className="text-sm font-bold uppercase text-gray-500 truncate">
                            {rule.description || "No description provided"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 sm:border-l-2 sm:border-black sm:pl-6 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditRuleDialog(rule)}
                          className="h-10 w-10 rounded-none border-2 border-black text-black hover:bg-black hover:text-white transition-all mr-2"
                          title="Edit Rule"
                        >
                          <Zap className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleRule(rule.id, rule.isActive)}
                          className={`rounded-none border-2 border-black h-10 px-4 transition-all gap-2 ${rule.isActive
                            ? "bg-black text-white hover:bg-red-500 hover:text-white"
                            : "bg-white text-black hover:bg-gray-200"
                            }`}
                        >
                          {rule.isActive ? (
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
                          onClick={() => handleDeleteRule(rule.id)}
                          title="Delete Rule"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div >
  );
}