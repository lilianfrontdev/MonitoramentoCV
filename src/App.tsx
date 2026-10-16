import { Paper, Stack, Typography } from '@mui/material'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import { DashboardLayout } from './layouts/DashboardLayout'

function App() {
  return (
    <DashboardLayout>
      <Paper variant="outlined" sx={{ p: 4 }}>
        <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
          <Inventory2OutlinedIcon
            color="primary"
            sx={{ fontSize: 36 }}
          />

          <Typography component="h2" variant="h6">
            Nenhum dado encontrado
          </Typography>

          <Typography color="text.secondary">
            Os indicadores serão exibidos quando houver resultados
            de uma inspeção.
          </Typography>
        </Stack>
      </Paper>
    </DashboardLayout>
  )
}

export default App