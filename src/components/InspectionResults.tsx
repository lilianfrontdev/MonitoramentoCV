import {
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import type { InspectionResult } from '../types/inspections'

type InspectionResultsProps = {
  results: InspectionResult[]
}

export function InspectionResults({
  results,
}: InspectionResultsProps) {
  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
      <Typography
        id="inspection-results-title"
        component="h2"
        variant="h6"
        sx={{ p: 3 }}
      >
        Resultados da inspeção
      </Typography>

      <TableContainer>
        <Table
          aria-labelledby="inspection-results-title"
          sx={{ minWidth: 640 }}
        >
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.default' }}>
              <TableCell>Posição</TableCell>
              <TableCell>Classificação</TableCell>
              <TableCell>Confiança</TableCell>
              <TableCell>Revisão</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {results.map((result) => (
              <TableRow key={result.position} hover>
                <TableCell component="th" scope="row">
                  {result.position}
                </TableCell>

                <TableCell>
                  {result.classification}
                </TableCell>

                <TableCell>
                  {result.confidence === null
                    ? 'Não disponível'
                    : `${result.confidence}%`}
                </TableCell>

                <TableCell>
                  <Chip
                    label={
                      result.needsReview
                        ? 'Revisão necessária'
                        : 'Sem pendências'
                    }
                    color={
                      result.needsReview ? 'warning' : 'success'
                    }
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}

            {results.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  align="center"
                  sx={{ py: 4 }}
                >
                  Nenhuma inspeção disponível para esta rua.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', p: 3 }}
      >
        Resultados demonstrativos da área selecionada.
        Nenhuma classificação foi gerada pelo modelo.
      </Typography>
    </Paper>
  )
}