// Centraliza as chamadas da API usadas para iniciar e consultar inspeções de vídeo.

import type { BoxClass, InspectionResult } from "../types/inspections";

const API_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

// Estados possíveis da tarefa de processamento do vídeo.
export type JobStatus = "queued" | "processing" | "completed" | "failed";

// Representa uma caixa acompanhada ao longo dos frames do vídeo.
export type TrackedBox = {
  id: number;
  order: number;
  class: BoxClass;
  confidence: number;
  first_frame: number;
  last_frame: number;
  detection_count: number;
};

// Agrupa a quantidade total de caixas por classificação.
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

// Representa o job retornado pela API durante e após o processamento.
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

// Extrai a mensagem de erro retornada pela API.
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

  // Envia o vídeo e a rua selecionada para a API.
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
  // Consulta o status e os resultados de um job existente.
  const response = await fetch(`${API_URL}/jobs/${jobId}`);

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

export function getInspectionDownloadUrl(job: InspectionJob): string | null {
  // Converte o caminho do vídeo processado em uma URL de download.
  return job.download_url
    ? new URL(job.download_url, `${API_URL}/`).toString()
    : null;
}

export function mapInspectionResults(
  job: InspectionJob,
  streetId = "A",
): InspectionResult[] {
  // Converte as caixas retornadas pela API em posições provisórias do mapa.
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
