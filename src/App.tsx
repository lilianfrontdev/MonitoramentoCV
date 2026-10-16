import { Box, Chip, Container, Paper, Stack, Typography } from '@mui/material'

function App() {
  return (
    <Container maxWidth="lg">
      <Box component="main" sx={{ py: 6 }}>
        <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
            <Chip
              label="Monitoramento visual do CD"
              color="primary"
              variant="outlined"
              size="small"
            />

            <Typography variant="h1">CD Visão Computacional</Typography>

            <Typography color="text.secondary">
              Identificação de caixas térmicas e acompanhamento
              da ocupação do centro de distribuição.
            </Typography>
          </Stack>
        </Paper>
      </Box>
    </Container>
  )
}

export default App