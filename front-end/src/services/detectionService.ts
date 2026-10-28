const API_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

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

  const result = await response.blob();

  if (!result.type.startsWith("image/")) {
    throw new Error("A API não retornou uma imagem válida.");
  }

  return result;
}
