import { Box, Stack, Typography } from "@mui/material";
import logo from "../assets/logo_soprano.png";

export function Header() {
  return (
    <Box
      component="header"
      sx={{
        p: { xs: 3, md: 4 },
        bgcolor: "background.paper",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={2}
        sx={{
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", lg: "center" },
        }}
      >
        <Box>
          <Typography variant="overline" color="text.secondary">
            Centro de Distribuição Soprano
          </Typography>

          <Typography component="h1" variant="h2" color="primary">
            Visão Geral
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Acompanhe as identificações e a ocupação das posições.
          </Typography>
        </Box>
        <Box
          component="img"
          src={logo}
          alt="Soprano"
          sx={{
            width: { xs: 10, md: 200 },
            maxWidth: "100%",
            height: "auto",
            display: "block",
            flexShrink: 0,
          }}
        />
      </Stack>
    </Box>
  );
}
