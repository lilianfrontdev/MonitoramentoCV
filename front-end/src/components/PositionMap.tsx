import { useState } from "react";
import { Box, ButtonBase, Paper, Stack, Typography } from "@mui/material";

import type { InspectionResult, PositionStatus } from "../types/inspections";

type PositionMapProps = {
  results: InspectionResult[];
  streets: {
    id: string;
    capacity: number;
  }[];
};

type MapStatus = PositionStatus | "not_inspected";

const statusConfig: Record<
  MapStatus,
  {
    label: string;
    background: string;
    color: string;
    border: string;
  }
> = {
  thermal: {
    label: "Caixa térmica detectada",
    background: "#D5EEE7",
    color: "#245D50",
    border: "1px solid transparent",
  },
  unknown: {
    label: "Não identificado",
    background: "#FFF0D7",
    color: "#805A17",
    border: "1px solid transparent",
  },
  empty: {
    label: "Posição vazia",
    background: "#EDF2F5",
    color: "#526675",
    border: "1px dashed #BBCBD6",
  },
  not_observable: {
    label: "Não observável",
    background:
      "repeating-linear-gradient(45deg, #E2E8ED, #E2E8ED 4px, #F5F7F9 4px, #F5F7F9 8px)",
    color: "#526675",
    border: "1px solid transparent",
  },
  not_inspected: {
    label: "Sem caixa atribuída",
    background: "#FFFFFF",
    color: "#64748B",
    border: "1px dotted #94A3B8",
  },
};

export function PositionMap({ results, streets }: PositionMapProps) {
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);

  const streetData = streets.map((street) => {
    const streetResults = results.filter(
      (result) => result.street === street.id,
    );

    const capacity = Math.max(street.capacity, streetResults.length);

    return {
      ...street,
      capacity,
      results: streetResults,
    };
  });

  const columnCount = Math.max(
    1,
    ...streetData.map((street) => street.capacity),
  );

  const positions = streetData.flatMap((street) =>
    Array.from({ length: street.capacity }, (_, index) => {
      const result = street.results[index];
      const position = `${street.id}-${String(index + 1).padStart(2, "0")}`;

      return {
        position,
        street: street.id,
        result,
        status: result?.status ?? ("not_inspected" as const),
      };
    }),
  );

  const selected = positions.find(
    (position) => position.position === selectedPosition,
  );

  const gridColumns = `28px repeat(${columnCount}, minmax(58px, 1fr))`;

  return (
    <Paper variant="outlined" sx={{ p: 3, minWidth: 0 }}>
      <Stack spacing={3}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Typography component="h2" variant="h6">
            Mapa de posições
          </Typography>

          <Typography variant="caption" color="text.secondary">
            {results.length} caixas detectadas · posições provisórias
          </Typography>
        </Box>

        {streetData.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Nenhuma rua selecionada para exibição.
          </Typography>
        ) : (
          <Box sx={{ overflowX: "auto", pb: 1 }}>
            <Box
              sx={{
                minWidth: 28 + columnCount * 66,
                display: "grid",
                gap: 1,
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: gridColumns,
                  gap: 1,
                }}
              >
                <Box />

                {Array.from({ length: columnCount }, (_, index) => (
                  <Typography
                    key={index}
                    variant="caption"
                    color="text.secondary"
                    sx={{ textAlign: "center" }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </Typography>
                ))}
              </Box>

              {streetData.map((street) => (
                <Box
                  key={street.id}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: gridColumns,
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ textAlign: "center" }}
                  >
                    {street.id}
                  </Typography>

                  {positions
                    .filter((position) => position.street === street.id)
                    .map((position) => {
                      const config = statusConfig[position.status];
                      const isSelected = selectedPosition === position.position;

                      return (
                        <ButtonBase
                          key={position.position}
                          aria-label={`${position.position}: ${config.label}`}
                          aria-pressed={isSelected}
                          onClick={() => setSelectedPosition(position.position)}
                          sx={{
                            minHeight: 42,
                            px: 0.5,
                            borderRadius: 1,
                            border: config.border,
                            background: config.background,
                            color: config.color,
                            fontSize: 11,
                            boxShadow: isSelected
                              ? "inset 0 0 0 2px #004B78"
                              : "none",
                            "&:hover": {
                              filter: "brightness(0.96)",
                            },
                            "&.Mui-focusVisible": {
                              outline: "3px solid",
                              outlineColor: "primary.main",
                              outlineOffset: 2,
                            },
                          }}
                        >
                          {position.result
                            ? `${position.result.classification}`
                            : "—"}
                        </ButtonBase>
                      );
                    })}
                </Box>
              ))}
            </Box>
          </Box>
        )}

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          {Object.entries(statusConfig)
            .filter(
              ([status]) => status !== "empty" && status !== "not_observable",
            )
            .map(([status, config]) => (
              <Box
                key={status}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                }}
              >
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: 0.5,
                    background: config.background,
                    border: "1px solid #CBD5E1",
                  }}
                />

                <Typography variant="caption" color="text.secondary">
                  {config.label}
                </Typography>
              </Box>
            ))}
        </Box>

        <Box
          role="status"
          aria-live="polite"
          sx={{
            p: 2,
            minHeight: 64,
            bgcolor: "background.default",
            borderRadius: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {selected
              ? `${selected.position} · ${selected.result.classification} · ${(
                  (selected.result.confidence ?? 0) * 100
                ).toFixed(1)}% de confiança`
              : "Nenhuma caixa atribuída"}
          </Typography>
        </Box>

        <Typography variant="caption" color="text.secondary">
          As posições representam a sequência de identificação do rastreador,
          não endereços físicos confirmados. Células sem caixas atribuídas não
          representam espaços vazios confirmados pelo modelo.
        </Typography>
      </Stack>
    </Paper>
  );
}
