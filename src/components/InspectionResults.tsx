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

type InspectionResult = {
  position: string
  classification: string
  confidence: number | null
  needsReview: boolean
}

const mockResults: InspectionResult[] = [
  {
    position: '01',
    classification: 'Agrupamento de caixas térmicas',
    confidence: 96,
    needsReview: false,
  },
  {
    position: '02',
    classification: 'Volume não identificado',
    confidence: null,
    needsReview: true,
  },
  {
    position: '03',
    classification: 'Posição vazia',
    confidence: 94,
    needsReview: false,
  },
  {
    position: '04',
    classification: 'Não observável',
    confidence: null,
    needsReview: true,
  },
]

export function InspectionResults() {
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
        <Table aria-labelledby="inspection-results-title" sx={{ minWidth: 640 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.default' }}>
              <TableCell>Rua</TableCell>
              <TableCell>Classificação</TableCell>
              <TableCell>Confiança</TableCell>
              <TableCell>Revisão</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {mockResults.map((result) => (
              <TableRow key={result.position} hover>
                <TableCell component="th" scope="row">
                  {result.position}
                </TableCell>

                <TableCell>{result.classification}</TableCell>

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
                    color={result.needsReview ? 'warning' : 'default'}
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', p: 3 }}
      >
        Amostra demonstrativa de quatro posições. As classificações
        e os percentuais não foram gerados por um modelo.
      </Typography>
    </Paper>
  )
}