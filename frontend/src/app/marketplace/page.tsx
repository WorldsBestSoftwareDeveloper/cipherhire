"use client";

import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Filter, Lock, Cpu, Shield, RefreshCw } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { TaskCard } from "@/components/marketplace/TaskCard";
import { BidSubmissionModal } from "@/components/marketplace/BidSubmissionModal";
import { CreateTaskModal } from "@/components/marketplace/CreateTaskModal";
import { MatchingEngineView } from "@/components/matching/MatchingEngineView";
import { VisibilityMatrix } from "@/components/ui/VisibilityMatrix";
import { GlassCard } from "@/components/ui/GlassCard";
import { EncryptedStatusBadge } from "@/components/ui/EncryptedStatusBadge";
import { useTaskManager } from "@/hooks/useTaskManager";
import type { Task, TaskCategory } from "@/types";

type Tab = "tasks" | "matching" | "privacy";

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const defaultTab = (searchParams.get("tab") as Tab) ?? "tasks";

  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [bidTask, setBidTask] = useState<Task | null>(null);
  const [matchingTask, setMatchingTask] = useState<Task | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { tasks, isLoading, createTask, submitBid, runMatching, loadTasks } = useTaskManager();

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterStatus === "all" || t.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "tasks", label: "Marketplace", icon: Lock },
    { id: "matching", label: "Matching Engine", icon: Cpu },
    { id: "privacy", label: "Privacy Matrix", icon: Shield },
  ];

  // Stats
  const stats = {
    total: tasks.length,
    open: tasks.filter((t) => t.status === "Open").length,
    encrypted: tasks.reduce((acc, t) => acc + t.bidCount, 0),
    completed: tasks.filter((t) => t.status === "Completed").length,
  };

  return (
    <div className="min-h-screen">
      {/* Page header */}
      <div className="border-b border-white/[0.06] bg-[#030307]/80 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
          {/* Title row */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Confidential Marketplace
              </h1>
              <p className="mt-1 text-sm text-white/40">
                All bids and budgets are FHE-encrypted on Sepolia
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadTasks}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-white/40 transition-colors hover:bg-white/5 hover:text-white"
              >
                <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 rounded-xl bg-cipher-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cipher-500/20 transition-all hover:bg-cipher-400"
              >
                <Plus size={15} />
                Create Task
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Total Tasks", value: stats.total, color: "text-white" },
              { label: "Open Tasks", value: stats.open, color: "text-neon-emerald" },
              { label: "Encrypted Bids", value: stats.encrypted, color: "text-cipher-400" },
              { label: "Completed", value: stats.completed, color: "text-white/50" },
            ].map((stat) => (
              <GlassCard key={stat.label} padding="sm" className="text-center">
                <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="mt-0.5 text-[11px] text-white/30">{stat.label}</div>
              </GlassCard>
            ))}
          </div>

          {/* Tabs */}
          <div className="mt-6 flex gap-1 overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-cipher-500/15 text-cipher-300 border border-cipher-500/25"
                      : "text-white/40 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <Icon size={13} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">
          {/* Tasks tab */}
          {activeTab === "tasks" && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              {/* Search + filter */}
              <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search
                    size={14}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search tasks..."
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-9 pr-4 text-sm text-white placeholder-white/20 outline-none focus:border-cipher-500/30 focus:ring-1 focus:ring-cipher-500/20"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter size={13} className="text-white/30" />
                  {["all", "Open", "Computing", "Completed"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilterStatus(s)}
                      className={`rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                        filterStatus === s
                          ? "bg-cipher-500/20 text-cipher-300"
                          : "text-white/40 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {s === "all" ? "All" : s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Task grid */}
              {filteredTasks.length === 0 ? (
                <div className="py-24 text-center">
                  <Lock size={32} className="mx-auto mb-4 text-white/10" />
                  <p className="text-white/40">No tasks found</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-4 text-sm text-cipher-400 hover:text-cipher-300"
                  >
                    Create the first task →
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredTasks.map((task, i) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      index={i}
                      onSelect={setSelectedTask}
                      onBid={(t) => setBidTask(t)}
                      onRunMatching={(t) => {
                        setMatchingTask(t);
                        setActiveTab("matching");
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Encrypted activity indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 flex items-center justify-center gap-3"
              >
                <div className="h-px flex-1 bg-white/[0.04]" />
                <div className="flex items-center gap-2">
                  <EncryptedStatusBadge status="encrypted" size="sm" label="All bid values encrypted" />
                  <EncryptedStatusBadge status="confidential" size="sm" label="FHE-protected" />
                </div>
                <div className="h-px flex-1 bg-white/[0.04]" />
              </motion.div>
            </motion.div>
          )}

          {/* Matching Engine tab */}
          {activeTab === "matching" && (
            <motion.div
              key="matching"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mx-auto max-w-2xl"
            >
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white">Confidential Matching Engine</h2>
                <p className="mt-1 text-sm text-white/40">
                  Select a task with bids to run encrypted matching
                </p>
              </div>

              {/* Task selector */}
              <div className="mb-6 space-y-2">
                {tasks
                  .filter((t) => t.status === "Open" || t.status === "Completed")
                  .slice(0, 5)
                  .map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setMatchingTask(t)}
                      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-all ${
                        matchingTask?.id === t.id
                          ? "border-cipher-500/30 bg-cipher-500/10"
                          : "border-white/[0.06] hover:border-white/10 hover:bg-white/[0.02]"
                      }`}
                    >
                      <div>
                        <div className="text-sm font-medium text-white">{t.title}</div>
                        <div className="mt-0.5 text-xs text-white/40">
                          {t.bidCount} encrypted bids · {t.status}
                        </div>
                      </div>
                      <EncryptedStatusBadge
                        status={t.status === "Completed" ? "never" : "encrypted"}
                        size="sm"
                      />
                    </button>
                  ))}
              </div>

              {matchingTask ? (
                <MatchingEngineView
                  task={matchingTask}
                  onRunMatching={() => runMatching(matchingTask.id)}
                />
              ) : (
                <GlassCard className="py-16 text-center">
                  <Cpu size={32} className="mx-auto mb-4 text-white/10" />
                  <p className="text-white/40">Select a task above to run matching</p>
                </GlassCard>
              )}
            </motion.div>
          )}

          {/* Privacy tab */}
          {activeTab === "privacy" && (
            <motion.div
              key="privacy"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mx-auto max-w-2xl"
            >
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white">Privacy Architecture</h2>
                <p className="mt-1 text-sm text-white/40">
                  What data is visible to whom at every stage of the protocol
                </p>
              </div>
              <VisibilityMatrix />

              {/* FHE explanation */}
              <GlassCard className="mt-6" variant="blue">
                <h3 className="mb-3 text-sm font-semibold text-white">
                  How FHE Enables This
                </h3>
                <div className="space-y-2 text-xs leading-relaxed text-white/50">
                  <p>
                    <span className="text-cipher-400 font-medium">Fully Homomorphic Encryption</span> allows
                    computation on encrypted data without decrypting it first. The result of
                    the computation, when decrypted, matches what you'd get computing on
                    plaintext.
                  </p>
                  <p>
                    In CipherHire, <code className="text-cipher-400">TFHE.lt(encBidA, encBidB)</code> compares two
                    encrypted bids and returns an encrypted boolean — never revealing either value.
                    <code className="text-cipher-400"> TFHE.select()</code> picks the winner, also in ciphertext.
                  </p>
                  <p>
                    Only the winning bid is decrypted via the Zama Gateway callback. All losing
                    bids remain as ciphertexts permanently — mathematically inaccessible.
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateTaskModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={createTask}
          />
        )}
        {bidTask && (
          <BidSubmissionModal
            task={bidTask}
            onClose={() => setBidTask(null)}
            onSubmit={submitBid}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense>
      <MarketplaceContent />
    </Suspense>
  );
}
