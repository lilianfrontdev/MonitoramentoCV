import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getInspection,
  startInspection,
  type InspectionJob,
} from "../services/InspectionService";

export const INSPECTIONS_QUERY_KEY = ["inspections"] as const;

const STORAGE_KEY = "cd-inspections";

export type StreetInspection = {
  streetId: string;
  job: InspectionJob;
  createdAt: number;
};

function readStoredInspections(): StreetInspection[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) return [];

    const parsed: unknown = JSON.parse(stored);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is StreetInspection =>
        typeof item?.streetId === "string" &&
        typeof item?.createdAt === "number" &&
        typeof item?.job?.job_id === "string" &&
        item.job.status === "completed",
    );
  } catch {
    return [];
  }
}

export function useInspection(jobId: string | undefined) {
  return useQuery({
    queryKey: ["inspection", jobId],
    queryFn: () => getInspection(jobId!),
    enabled: Boolean(jobId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;

      return status === "completed" || status === "failed" ? false : 1000;
    },
  });
}

export function useInspections() {
  const query = useQuery<StreetInspection[]>({
    queryKey: INSPECTIONS_QUERY_KEY,
    queryFn: readStoredInspections,
    initialData: readStoredInspections,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (query.data === undefined) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(query.data));
    } catch (error) {
      console.error(
        "Não foi possível salvar as inspeções no navegador:",
        error,
      );
    }
  }, [query.data]);

  return query;
}

export function useStartInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: startInspection,
    onSuccess: (job) => {
      queryClient.setQueryData(["inspection", job.job_id], job);
    },
  });
}
