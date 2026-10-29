import type { BoxClass, InspectionResult } from "../types/inspections";

const API_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

export type JobStatus = "queued" | "processing" | "completed" | "failed";

export type TrackedBox = {
  id: number;
  order: number;
  class: BoxClass;
  confidence: number;
  first_frame: number;
  last_frame: number;
  detection_count: number;
};

export type TrackingSummary = {
  total: number;
  "caixa-preta": number;
  "caixa-verde": number;
  "caixa-azul": number;
  "caixa-cinza": number;
  "caixa-vermelha": number;
  "caixa-fechada": number;
  classes_nao_reconhecidas?: Record<string, number>;
};

export type InspectionJob = {
  job_id: string;
  street_id: string;
  filename: string;
  status: JobStatus;
  stage: string;
  progress: number;
  frames_processed: number;
  total_frames: number;
  error: string | null;
  tracked_boxes: TrackedBox[];
  tracking_summary: TrackingSummary;
  video_url: string | null;
  download_url: string | null;
  image_base64?: string;
  image_media_type?: string;
};

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return data.detail ?? "Não foi possível processar a solicitação.";
  } catch {
    return "Não foi possível processar a solicitação.";
  }
}

export async function startInspection({
  file,
  streetId,
}: {
  file: File;
  streetId: string;
}): Promise<{ job_id: string; status: JobStatus }> {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("street_id", streetId);

  const response = await fetch(`${API_URL}/videos`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

export async function getInspection(jobId: string): Promise<InspectionJob> {
  const response = await fetch(`${API_URL}/jobs/${jobId}`);

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

export function getInspectionVideoUrl(job: InspectionJob): string | null {
  return job.video_url
    ? new URL(job.video_url, `${API_URL}/`).toString()
    : null;
}

export function getInspectionDownloadUrl(job: InspectionJob): string | null {
  return job.download_url
    ? new URL(job.download_url, `${API_URL}/`).toString()
    : null;
}

export function mapInspectionResults(
  job: InspectionJob,
  streetId = "A",
): InspectionResult[] {
  return [...(job.tracked_boxes ?? [])]
    .sort((a, b) => a.order - b.order)
    .map((box) => ({
      id: box.id,
      position: `${streetId}-${String(box.order).padStart(2, "0")}`,
      street: streetId,
      status: "thermal",
      classification: box.class,
      confidence: box.confidence,
      needsReview: box.class === "caixa-fechada",
      firstFrame: box.first_frame,
      lastFrame: box.last_frame,
      detectionCount: box.detection_count,
      provisionalPosition: true,
    }));
}

export async function detectImage(file: File): Promise<Blob> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/images`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let message = "Não foi possível processar a imagem.";

    try {
      const data = await response.json();
      message = data.detail ?? message;
    } catch (error: unknown) {
      console.error("Erro: ", error);
    }

    throw new Error(message);
  }

  const blob = await response.blob();

  if (!blob.type.startsWith("image/")) {
    throw new Error("A API não retornou uma imagem válida.");
  }

  return blob;
}
