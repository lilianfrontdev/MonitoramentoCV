// Exibe em tabela as caixas identificadas na inspeção e suas posições no mapa.

import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import type { InspectionResult } from "../types/inspections";

type InspectionResultsProps = {
  // Resultados normalizados que serão apresentados na tabela.
  results: InspectionResult[];
};

export function InspectionResults({ results }: InspectionResultsProps) {
  // Renderiza a tabela de resultados e a mensagem para listas vazias.
  return (
    <Paper variant="outlined" sx={{ overflow: "hidden", borderRadius: 1 }}>
      <Typography
        id="inspection-results-title"
        component="h2"
        variant="h6"
        sx={{ p: { xs: 2, sm: 3 }, fontWeight: 600 }}
      >
        Resultados da inspeção
      </Typography>

      <TableContainer>
        <Table
          aria-labelledby="inspection-results-title"
          sx={{ minWidth: 600 }}
        >
          <TableHead>
            <TableRow sx={{ bgcolor: "background.default" }}>
              <TableCell>Posição</TableCell>
              <TableCell>Localização</TableCell>
              <TableCell>Classificação</TableCell>
            </TableRow>
          </TableHead>

          {/* Exibe os resultados normalizados da inspeção em formato de tabela. */}
          <TableBody>
            {results.map((result) => (
              <TableRow key={`${result.street}-${result.id}`} hover>
                <TableCell component="th" scope="row">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {result.position || "Não definida"}
                  </Typography>
                </TableCell>

                <TableCell>
                  Rua {result.street}
                  {result.provisionalPosition && (
                    <Typography
                      component="span"
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block" }}
                    >
                      Posição provisória
                    </Typography>
                  )}
                </TableCell>

                <TableCell>{result.classification}</TableCell>
              </TableRow>
            ))}

            {results.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  Nenhuma caixa rastreada nesta inspeção.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", p: { xs: 2, sm: 3 } }}
      >
        As posições são sequenciais e provisórias, baseadas na ordem de
        identificação das caixas. Elas não representam endereços físicos
        confirmados do estoque.
      </Typography>
    </Paper>
  );
}
