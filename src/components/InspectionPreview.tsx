import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { Alert, Box, Button, Paper, Stack, Typography } from "@mui/material";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";

export function InspectionPreview() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    if (
      !["image/jpeg", "image/png", "image/webp"].includes(selectedFile.type)
    ) {
      setError("Selecione uma imagem nos formatos JPG, PNG ou WebP.");
      return;
    }

    setError("");
    setFile(selectedFile);
  }

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
          }}
        >
          <Box>
            <Typography component="h2" variant="h6">
              Evidências da inspeção
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Selecione uma imagem do centro de distribuição.
            </Typography>
          </Box>

          <Button
            component="label"
            variant="contained"
            startIcon={<UploadFileOutlinedIcon />}
          >
            Selecionar imagem
            <Box
              component="input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              sx={{
                position: "absolute",
                width: 1,
                height: 1,
                padding: 0,
                overflow: "hidden",
                clipPath: "inset(50%)",
                whiteSpace: "nowrap",
              }}
            />
          </Button>
        </Stack>

        {error && <Alert severity="error">{error}</Alert>}

        {previewUrl ? (
          <Box>
            <Box
              component="img"
              src={previewUrl}
              alt="Prévia da imagem selecionada do centro de distribuição"
              sx={{
                display: "block",
                width: "100%",
                maxHeight: 480,
                objectFit: "contain",
                bgcolor: "background.default",
                borderRadius: 1,
              }}
            />

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{
                mt: 2,
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "center" },
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ overflowWrap: "anywhere" }}
              >
                {file?.name}
              </Typography>

              <Button
                onClick={() => {
                  setFile(null);
                  setError("");
                }}
              >
                Remover imagem
              </Button>
            </Stack>
          </Box>
        ) : (
          <Box
            sx={{
              py: 8,
              px: 3,
              textAlign: "center",
              bgcolor: "background.default",
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 1,
            }}
          >
            <Typography color="text.secondary">
              Nenhuma imagem selecionada
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Formatos aceitos: JPG, PNG e WebP
            </Typography>
          </Box>
        )}
      </Stack>
    </Paper>
  );
}
