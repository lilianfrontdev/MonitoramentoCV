import type { InspectionJob } from "./InspectionService";

const API_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

export async function detectImage(
  file: File,
  streetId: string,
): Promise<{
  job: InspectionJob;
  imageUrl: string;
}> {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("street_id", streetId);

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
      console.error("Erro:", error);
    }

    throw new Error(message);
  }

  const job = (await response.json()) as InspectionJob;

  if (!job.image_base64 || !job.image_media_type) {
    throw new Error("A API não retornou a imagem processada.");
  }

  const imageUrl = `data:${job.image_media_type};base64,${job.image_base64}`;

  return {
    job,
    imageUrl,
  };
}
