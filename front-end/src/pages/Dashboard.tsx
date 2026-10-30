// Monta a tela principal de monitoramento, unindo filtros, inspeção, mapa e tabela.

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Box,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { InspectionPreview } from "../components/InspectionPreview";
import { InspectionResults } from "../components/InspectionResults";
import { PositionMap } from "../components/PositionMap";

import type { BoxClass, InspectionResult } from "../types/inspections";

import {
  mapInspectionResults,
  type InspectionJob,
} from "../services/InspectionService";

import {
  INSPECTIONS_QUERY_KEY,
  useInspections,
  type StreetInspection,
} from "../hooks/useInspection";

const CLASS_LABELS: Record<BoxClass, string> = {
  "caixa-preta": "Caixa preta",
  "caixa-verde": "Caixa verde",
  "caixa-azul": "Caixa azul",
  "caixa-cinza": "Caixa cinza",
  "caixa-vermelha": "Caixa vermelha",
  "caixa-fechada": "Caixa fechada",
};

export function Dashboard() {
  const queryClient = useQueryClient();
  const { data: inspections = [] } = useInspections();

  const [selectedStreet, setSelectedStreet] = useState("all");

  // Substitui o resultado anterior da rua pelo job recém-concluído.
  function handleInspectionCompleted(job: InspectionJob) {
    if (job.status !== "completed") return;

    const current =
      queryClient.getQueryData<StreetInspection[]>(INSPECTIONS_QUERY_KEY) ?? [];

    const streetId = job.street_id;

    const newInspection: StreetInspection = {
      streetId,
      job,
      createdAt: Date.now(),
    };

    const inspectionsWithoutStreet = current.filter(
      (inspection) => inspection.streetId !== streetId,
    );

    queryClient.setQueryData<StreetInspection[]>(INSPECTIONS_QUERY_KEY, [
      ...inspectionsWithoutStreet,
      newInspection,
    ]);

    setSelectedStreet(streetId);
  }

  // Filtra as inspeções exibidas no mapa e na tabela.
  const visibleInspections = useMemo(
    () =>
      selectedStreet === "all"
        ? inspections
        : inspections.filter(
            (inspection) => inspection.streetId === selectedStreet,
          ),
    [inspections, selectedStreet],
  );

  // Converte as caixas da API no modelo usado pelo mapa e pela tabela.
  const results: InspectionResult[] = useMemo(
    () =>
      visibleInspections.flatMap(({ job, streetId }) =>
        mapInspectionResults(job, streetId).map((result) => ({
          ...result,
          classification:
            CLASS_LABELS[result.classification as BoxClass] ??
            result.classification,
        })),
      ),
    [visibleInspections],
  );

  // Define a quantidade de posições renderizadas para cada rua.
  const mapStreets = useMemo(
    () =>
      visibleInspections.map(({ streetId }) => ({
        id: streetId,
        capacity: Math.max(
          1,
          results.filter((result) => result.street === streetId).length,
        ),
      })),
    [visibleInspections, results],
  );

  const totalBoxes = results.length;
  // Remove ruas repetidas do seletor do dashboard.
  const streetIds = inspections
    .map((inspection) => inspection.streetId)
    .filter((streetId, index, streets) => streets.indexOf(streetId) === index);

  return (
    <Stack spacing={3}>
      {/* Renderiza o filtro de rua e os totais da visualização atual. */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: 2,
        }}
      >
        <TextField
          select
          label="Rua"
          size="small"
          value={selectedStreet}
          onChange={(event) => setSelectedStreet(event.target.value)}
          sx={{ width: { xs: "100%", sm: 280 } }}
        >
          <MenuItem value="all">Todas as ruas</MenuItem>

          {streetIds.map((streetId) => (
            <MenuItem key={streetId} value={streetId}>
              Rua {streetId}
            </MenuItem>
          ))}
        </TextField>

        <Typography variant="body2" color="text.secondary">
          {inspections.length} ruas cadastradas · {totalBoxes} caixas rastreadas
          na visualização
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            xl: "minmax(0, 1.2fr) minmax(0, 1fr)",
          },
          gap: 3,
          alignItems: "start",
        }}
      >
        <InspectionPreview onInspectionCompleted={handleInspectionCompleted} />

        <PositionMap results={results} streets={mapStreets} />
      </Box>

      {/* Informa quando a seleção atual não possui caixas rastreadas. */}
      {inspections.length > 0 && results.length === 0 && (
        <Alert severity="warning">
          Não há caixas rastreadas na seleção atual. Isso não significa que o
          local esteja vazio.
        </Alert>
      )}

      <InspectionResults results={results} />
    </Stack>
  );
}
