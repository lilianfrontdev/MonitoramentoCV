import { Alert, Box, Stack, Typography } from "@mui/material";
import { StatCard } from "../components/StatCard";
import { InspectionPreview } from "../components/InspectionPreview";
import { InspectionResults } from "../components/InspectionResults";

const mockIndicators = [
  {
    title: "Agrupamentos de caixas térmicas",
    value: "14",
    description: "Agrupamentos identificados na inspeção",
  },
  {
    title: "Volumes não identificados",
    value: "4",
    description: "Aguardando conferência visual",
  },
  {
    title: "Posições vazias",
    value: "4",
    description: "Posições visíveis sem volumes",
  },
  {
    title: "Ocupação observada",
    value: "82%",
    description: "18 ocupadas entre 22 observáveis",
  },
];

export function Dashboard() {
  return (
    <Stack spacing={3}>
      <Alert severity="info">
        Dados demonstrativos. Nenhuma inspeção real foi processada.
      </Alert>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            xl: "repeat(4, minmax(0, 1fr))",
          },
          gap: 3,
        }}
      >
        {mockIndicators.map((indicator) => (
          <StatCard
            key={indicator.title}
            title={indicator.title}
            value={indicator.value}
            description={indicator.description}
          />
        ))}
      </Box>

      <InspectionPreview />
      <InspectionResults />
      
      <Typography color="text.secondary" sx={{ mt: 1 }}>
        Esta área exibirá a imagem analisada e as marcações dos objetos
        detectados.
      </Typography>
    </Stack>
  );
}
