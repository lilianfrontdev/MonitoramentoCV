import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import {
  Alert,
  Box,
  Button,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import { detectImage } from "../services/detectionService";
import {
  getInspectionDownloadUrl,
  type InspectionJob,
} from "../services/InspectionService";
import { useInspection, useStartInspection } from "../hooks/useInspection";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/quicktime"];

type AnalysisStatus = "idle" | "processing" | "completed" | "failed";

type InspectionPreviewProps = {
  onInspectionCompleted?: (job: InspectionJob) => void;
};

export function InspectionPreview({
  onInspectionCompleted,
}: InspectionPreviewProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [liveFrameUrl, setLiveFrameUrl] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const notifiedJobRef = useRef<string | null>(null);

  const startInspectionMutation = useStartInspection();
  const inspectionQuery = useInspection(jobId ?? undefined);
  const inspection = inspectionQuery.data;

  const isVideo = file ? ACCEPTED_VIDEO_TYPES.includes(file.type) : false;

  const isProcessing = status === "processing";

  useEffect(() => {
    if (!file) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!resultUrl?.startsWith("blob:")) return;

    return () => URL.revokeObjectURL(resultUrl);
  }, [resultUrl]);

  useEffect(() => {
    if (!inspection || inspection.job_id !== jobId) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgress(inspection.progress ?? 0);

    if (inspection.status === "completed") {
      setStatus("completed");
      setProgress(100);
      setResultUrl(getInspectionDownloadUrl(inspection));

      if (notifiedJobRef.current !== inspection.job_id) {
        notifiedJobRef.current = inspection.job_id;
        onInspectionCompleted?.(inspection);
      }

      return;
    }

    if (inspection.status === "failed") {
      setStatus("failed");
      setError(inspection.error || "O processamento do vídeo falhou.");
      return;
    }

    setStatus("processing");
  }, [inspection, jobId, onInspectionCompleted]);

  useEffect(() => {
    if (!jobId || status !== "processing") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLiveFrameUrl(null);
      return;
    }

    const apiUrl = (
      import.meta.env.VITE_API_URL ?? "http://localhost:8000"
    ).replace(/\/+$/, "");

    const wsUrl = `${apiUrl.replace(/^http/, "ws")}/ws/jobs/${jobId}`;
    const socket = new WebSocket(wsUrl);

    socket.binaryType = "blob";

    socket.onmessage = (event: MessageEvent<Blob>) => {
      const frameUrl = URL.createObjectURL(event.data);

      setLiveFrameUrl((previousUrl) => {
        if (previousUrl) {
          URL.revokeObjectURL(previousUrl);
        }

        return frameUrl;
      });
    };

    socket.onerror = () => {
      console.error("Erro na conexão WebSocket das detecções.");
    };

    return () => {
      socket.close();
    };
  }, [jobId, status]);

  useEffect(() => {
    return () => {
      if (liveFrameUrl) {
        URL.revokeObjectURL(liveFrameUrl);
      }
    };
  }, [liveFrameUrl]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];
    event.target.value = "";

    if (!selectedFile) return;

    const accepted = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES];

    if (!accepted.includes(selectedFile.type)) {
      setError(
        "Selecione uma imagem JPG, PNG ou WebP, ou um vídeo MP4 ou MOV.",
      );
      return;
    }

    setFile(selectedFile);
    setResultUrl(null);
    setJobId(null);
    setProgress(0);
    setStatus("idle");
    setError("");
    notifiedJobRef.current = null;
  }

  async function handleAnalyze() {
    if (!file || isProcessing) return;

    setError("");
    setResultUrl(null);
    setProgress(0);
    setStatus("processing");

    try {
      if (isVideo) {
        notifiedJobRef.current = null;

        const job = await startInspectionMutation.mutateAsync(file);

        setJobId(job.job_id);
        setProgress(0);
      } else {
        const result = await detectImage(file);

        setResultUrl(URL.createObjectURL(result));
        setProgress(100);
        setStatus("completed");
      }
    } catch (err) {
      setStatus("failed");
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível analisar o arquivo.",
      );
    }
  }

  function handleRemove() {
    if (isProcessing) return;

    setFile(null);
    setResultUrl(null);
    setJobId(null);
    setStatus("idle");
    setProgress(0);
    setError("");
    setLiveFrameUrl(null);
    notifiedJobRef.current = null;
  }

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Evidências da inspeção
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Selecione uma imagem ou vídeo do centro de distribuição para
            identificar as caixas térmicas.
          </Typography>
        </Box>

        <Stack
          spacing={1}
          useFlexGap
          sx={{ flexDirection: "row", flexWrap: "wrap" }}
        >
          <Button
            variant="outlined"
            startIcon={<UploadFileOutlinedIcon />}
            onClick={() => inputRef.current?.click()}
            disabled={isProcessing}
          >
            Selecionar arquivo
          </Button>

          <input
            ref={inputRef}
            hidden
            type="file"
            accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
            onChange={handleFileChange}
          />

          {file && (
            <Button
              color="inherit"
              startIcon={<DeleteOutlineOutlinedIcon />}
              onClick={handleRemove}
              disabled={isProcessing}
            >
              Remover arquivo
            </Button>
          )}
        </Stack>

        {error && (
          <Alert severity="error" onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {inspectionQuery.isError && jobId && status === "processing" && (
          <Alert severity="warning">
            Não foi possível atualizar o progresso. Tentando novamente...
          </Alert>
        )}

        {previewUrl && file ? (
          <Stack spacing={2}>
            <Box
              sx={{
                width: "100%",
                maxHeight: 480,
                overflow: "hidden",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                bgcolor: "background.default",
                borderRadius: 1,
              }}
            >
              {isVideo ? (
                <Box
                  component="video"
                  src={previewUrl}
                  controls
                  playsInline
                  preload="metadata"
                  sx={{
                    display: "block",
                    width: "100%",
                    maxHeight: 480,
                    objectFit: "contain",
                  }}
                />
              ) : (
                <Box
                  component="img"
                  src={previewUrl}
                  alt="Prévia do arquivo selecionado"
                  sx={{
                    display: "block",
                    width: "100%",
                    maxHeight: 480,
                    objectFit: "contain",
                  }}
                />
              )}
            </Box>

            <Typography variant="body2" color="text.secondary">
              {file.name}
            </Typography>

            {status === "processing" && (
              <Stack spacing={1}>
                <Stack
                  sx={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {isVideo ? "Analisando vídeo..." : "Analisando imagem..."}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {isVideo && !jobId ? "Enviando" : `${progress}%`}
                  </Typography>
                </Stack>

                <LinearProgress
                  variant={isVideo && !jobId ? "indeterminate" : "determinate"}
                  value={progress}
                />

                <Typography variant="caption" color="text.secondary">
                  {isVideo
                    ? "O processamento acontece em segundo plano. Você pode acompanhar o progresso aqui."
                    : "Aguarde enquanto o modelo identifica as caixas."}
                </Typography>
              </Stack>
            )}

            {status === "completed" && resultUrl && (
              <Alert severity="success">
                Análise concluída. O resultado está disponível abaixo.
              </Alert>
            )}

            {status === "completed" && !resultUrl && isVideo && (
              <Alert severity="warning">
                A análise foi concluída, mas o endereço do vídeo processado não
                foi disponibilizado pela API.
              </Alert>
            )}

            {status === "failed" && (
              <Alert severity="error">
                Não foi possível concluir a análise. Você pode tentar novamente.
              </Alert>
            )}

            {status !== "completed" && (
              <Button
                variant="contained"
                startIcon={<PlayArrowOutlinedIcon />}
                onClick={handleAnalyze}
                disabled={isProcessing || startInspectionMutation.isPending}
              >
                {status === "failed" ? "Tentar novamente" : "Analisar arquivo"}
              </Button>
            )}

            {status === "completed" && resultUrl && (
              <Stack spacing={2}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Resultado da análise
                </Typography>

                {isVideo ? (
                  <Button
                    variant="contained"
                    startIcon={<DownloadOutlinedIcon />}
                    component="a"
                    href={resultUrl}
                    download={`${file.name.replace(/\.[^.]+$/, "")}_detectado.mp4`}
                  >
                    Baixar vídeo processado
                  </Button>
                ) : (
                  <>
                    <Box
                      component="img"
                      src={resultUrl}
                      alt="Imagem com as detecções realizadas pelo modelo"
                      sx={{
                        display: "block",
                        width: "100%",
                        maxHeight: 480,
                        objectFit: "contain",
                        bgcolor: "background.default",
                        borderRadius: 1,
                      }}
                    />

                    <Button
                      variant="contained"
                      startIcon={<DownloadOutlinedIcon />}
                      component="a"
                      href={resultUrl}
                      download={`${file.name.replace(/\.[^.]+$/, "")}_detectado.jpg`}
                    >
                      Baixar imagem processada
                    </Button>
                  </>
                )}
              </Stack>
            )}
          </Stack>
        ) : (
          <Box
            sx={{
              minHeight: 200,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 1,
              p: 3,
              textAlign: "center",
            }}
          >
            <UploadFileOutlinedIcon
              sx={{ fontSize: 40, color: "text.secondary" }}
            />

            <Typography sx={{ fontWeight: 600 }}>
              Nenhum arquivo selecionado
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Formatos aceitos: JPG, PNG, WebP, MP4 e MOV.
            </Typography>
          </Box>
        )}

        {isVideo && status === "processing" && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Detecção em tempo real
            </Typography>

            <Paper
              variant="outlined"
              sx={{
                p: 1,
                overflow: "hidden",
                borderRadius: 2,
              }}
            >
              {liveFrameUrl ? (
                <Box
                  component="img"
                  src={liveFrameUrl}
                  alt="Frame do vídeo com as detecções"
                  sx={{
                    display: "block",
                    width: "100%",
                    maxHeight: 520,
                    objectFit: "contain",
                  }}
                />
              ) : (
                <Box
                  sx={{
                    minHeight: 200,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography color="text.secondary">
                    Aguardando os primeiros frames...
                  </Typography>
                </Box>
              )}
            </Paper>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Os frames são atualizados conforme o modelo processa o vídeo.
            </Typography>
          </Box>
        )}
      </Stack>
    </Paper>
  );
}
