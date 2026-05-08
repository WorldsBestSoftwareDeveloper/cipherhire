"use client";

import { useState, useCallback, useEffect } from "react";
import { usePublicClient, useWalletClient, useAccount } from "wagmi";
import { parseEther } from "viem";
import { DEMO_CONTRACT_ADDRESS, CIPHER_HIRE_DEMO_ABI } from "@/lib/demoContractAbi";
import type { Task, TaskStatus, TaskCategory } from "@/types";

export function useTaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { address, isConnected } = useAccount();

  // Load tasks from chain on mount and when connection changes
  useEffect(() => {
    loadTasks();
  }, [isConnected]);

  // ── Load all tasks from contract ─────────────────────────────────────────
  const loadTasks = useCallback(async () => {
    if (!publicClient) return;
    setIsLoading(true);
    try {
      const count = await publicClient.readContract({
        address: DEMO_CONTRACT_ADDRESS as `0x${string}`,
        abi: CIPHER_HIRE_DEMO_ABI,
        functionName: "taskCounter",
      });

      const loaded: Task[] = [];
      for (let i = 1; i <= Number(count); i++) {
        try {
          const t = await publicClient.readContract({
            address: DEMO_CONTRACT_ADDRESS as `0x${string}`,
            abi: CIPHER_HIRE_DEMO_ABI,
            functionName: "getTask",
            args: [BigInt(i)],
          }) as {
            id: bigint;
            creator: string;
            title: string;
            description: string;
            category: string;
            createdAt: bigint;
            status: number;
            bidCount: bigint;
            winner: string;
            winningBid: bigint;
          };

          const statuses: TaskStatus[] = [
            "Open", "Computing", "Completed", "Cancelled",
          ];

          loaded.push({
            id: Number(t.id),
            creator: t.creator,
            title: t.title,
            description: t.description,
            category: t.category as TaskCategory,
            createdAt: Number(t.createdAt),
            status: statuses[t.status] ?? "Open",
            bidCount: Number(t.bidCount),
            winner:
              t.winner !== "0x0000000000000000000000000000000000000000"
                ? t.winner
                : undefined,
            revealedWinningBid:
              t.winningBid > 0n ? t.winningBid : undefined,
          });
        } catch {
          // skip tasks that fail to load
        }
      }

      setTasks(loaded.reverse());
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setIsLoading(false);
    }
  }, [publicClient]);

  // ── Create Task — real transaction ───────────────────────────────────────
  const createTask = useCallback(
    async (
      title: string,
      description: string,
      category: TaskCategory,
      budget: bigint,
      _encrypted: { handles: Uint8Array[]; inputProof: Uint8Array }
    ) => {
      if (!walletClient || !publicClient) {
        throw new Error("Please connect your wallet first");
      }

      const { request } = await publicClient.simulateContract({
        address: DEMO_CONTRACT_ADDRESS as `0x${string}`,
        abi: CIPHER_HIRE_DEMO_ABI,
        functionName: "createTask",
        args: [title, description, category, budget],
        account: walletClient.account,
      });

      const hash = await walletClient.writeContract(request);
      console.log("createTask tx:", hash);

      await publicClient.waitForTransactionReceipt({ hash });
      await loadTasks();
    },
    [walletClient, publicClient, loadTasks]
  );

  // ── Submit Bid — real transaction ────────────────────────────────────────
  const submitBid = useCallback(
    async (
      taskId: number,
      amount: bigint,
      deliveryDays: number,
      _encrypted: { handles: Uint8Array[]; inputProof: Uint8Array }
    ) => {
      if (!walletClient || !publicClient) {
        throw new Error("Please connect your wallet first");
      }

      const { request } = await publicClient.simulateContract({
        address: DEMO_CONTRACT_ADDRESS as `0x${string}`,
        abi: CIPHER_HIRE_DEMO_ABI,
        functionName: "submitBid",
        args: [BigInt(taskId), amount, BigInt(deliveryDays)],
        account: walletClient.account,
      });

      const hash = await walletClient.writeContract(request);
      console.log("submitBid tx:", hash);

      await publicClient.waitForTransactionReceipt({ hash });
      await loadTasks();
    },
    [walletClient, publicClient, loadTasks]
  );

  // ── Run Matching — real transaction ──────────────────────────────────────
  const runMatching = useCallback(
    async (taskId: number) => {
      if (!walletClient || !publicClient) {
        throw new Error("Please connect your wallet first");
      }

      const { request } = await publicClient.simulateContract({
        address: DEMO_CONTRACT_ADDRESS as `0x${string}`,
        abi: CIPHER_HIRE_DEMO_ABI,
        functionName: "runMatching",
        args: [BigInt(taskId)],
        account: walletClient.account,
      });

      const hash = await walletClient.writeContract(request);
      console.log("runMatching tx:", hash);

      await publicClient.waitForTransactionReceipt({ hash });
      await loadTasks();
    },
    [walletClient, publicClient, loadTasks]
  );

  return { tasks, isLoading, createTask, submitBid, runMatching, loadTasks };
}