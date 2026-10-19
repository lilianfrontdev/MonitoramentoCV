import { useState } from 'react'
import {
  Alert,
  Box,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { mockResults, warehouseStreets } from '../data/mockInspections'
import { StatCard } from '../components/StatCard'
import { InspectionPreview } from '../components/InspectionPreview'
import { InspectionResults } from '../components/InspectionResults'

export function Dashboard() {
  const [selectedStreet, setSelectedStreet] = useState('all')

  const filteredResults = mockResults.filter(
    (result) =>
      selectedStreet === 'all' ||
      result.street === selectedStreet,
  )

  const thermalCount = filteredResults.filter(
    (result) => result.status === 'thermal',
  ).length

  const unknownCount = filteredResults.filter(
    (result) => result.status === 'unknown',
  ).length

  const emptyCount = filteredResults.filter(
    (result) => result.status === 'empty',
  ).length

  const observableCount = filteredResults.filter(
    (result) => result.status !== 'not_observable',
  ).length

  const occupiedCount = thermalCount + unknownCount

  const occupancy =
    observableCount > 0
      ? `${Math.round((occupiedCount / observableCount) * 100)}%`
      : '—'

  const totalCapacity = warehouseStreets.reduce(
    (total, street) => total + street.capacity,
    0,
  )

  const monitoredStreets = new Set(
    mockResults.map((result) => result.street),
  ).size

  const selectedCapacity =
    selectedStreet === 'all'
      ? totalCapacity
      : warehouseStreets.find(
          (street) => street.id === selectedStreet,
        )?.capacity ?? 0

  const hasResults = filteredResults.length > 0

  const indicators = [
    {
      title: 'Agrupamentos de caixas térmicas',
      value: hasResults ? String(thermalCount) : '—',
      description: 'Identificados na área selecionada',
    },
    {
      title: 'Volumes não identificados',
      value: hasResults ? String(unknownCount) : '—',
      description: 'Aguardando conferência visual',
    },
    {
      title: 'Posições vazias',
      value: hasResults ? String(emptyCount) : '—',
      description: 'Posições visíveis sem volumes',
    },
    {
      title: 'Ocupação observada',
      value: occupancy,
      description: hasResults
        ? `${occupiedCount} ocupadas entre ${observableCount} observáveis`
        : 'Sem inspeção para esta rua',
    },
  ]

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
        }}
      >
        <TextField
          select
          label="Rua"
          size="small"
          value={selectedStreet}
          onChange={(event) => setSelectedStreet(event.target.value)}
          sx={{ width: { xs: '100%', sm: 220 } }}
        >
          <MenuItem value="all">Todas as ruas</MenuItem>

          {warehouseStreets.map((street) => (
            <MenuItem key={street.id} value={street.id}>
              Rua {street.id}
            </MenuItem>
          ))}
        </TextField>

        <Typography variant="body2" color="text.secondary">
          CD completo: {totalCapacity} posições cadastradas
          {' · '}
          {monitoredStreets} de {warehouseStreets.length} ruas monitoradas
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            xl: 'repeat(4, minmax(0, 1fr))',
          },
          gap: 3,
        }}
      >
        {indicators.map((indicator) => (
          <StatCard key={indicator.title} {...indicator} />
        ))}
      </Box>

      <Typography variant="body2" color="text.secondary">
        Área selecionada: {selectedCapacity} posições cadastradas
        {' · '}
        {filteredResults.length} inspecionadas
        {' · '}
        {observableCount} observáveis
      </Typography>

      {!hasResults && (
        <Alert severity="warning">
          Esta rua ainda não possui resultados de inspeção.
          Sua ocupação é desconhecida.
        </Alert>
      )}

      <InspectionPreview />

      <InspectionResults results={filteredResults} />
    </Stack>
  )
}