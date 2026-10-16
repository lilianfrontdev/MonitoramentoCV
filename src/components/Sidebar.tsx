import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";

export function Sidebar() {
  return (
    <Box
      component="aside"
      sx={{
        width: { xs: "100%", md: 240 },
        minHeight: { md: "100vh" },
        position: { md: "sticky" },
        top: 0,
        alignSelf: "flex-start",
        display: "flex",
        flexDirection: "column",
        bgcolor: "primary.main",
        color: "primary.contrastText",
        p: 3,
      }}
    >
      <Typography component="div" sx={{ fontSize: 32, fontWeight: 700 }}>
        Dashboard 
      </Typography>

      <Typography variant="caption" sx={{ mt: 0.5, mb: 4 }}>
        Monitoramento por Visão Computacional
      </Typography>

      <Box component="nav" aria-label="Navegação principal">
        <List disablePadding>
          <ListItemButton
            component="a"
            href="/"
            selected
            aria-current="page"
            sx={{
              borderRadius: 1,
              "&.Mui-selected": {
                bgcolor: "rgba(255, 255, 255, 0.14)",
              },
              "&.Mui-selected:hover": {
                bgcolor: "rgba(255, 255, 255, 0.22)",
              },
            }}
          >
            <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}>
              <DashboardOutlinedIcon />
            </ListItemIcon>

            <ListItemText primary="Visão geral" />
          </ListItemButton>
        </List>
      </Box>

      <Box
        sx={{
          display: { xs: "none", md: "block" },
          mt: "auto",
          pt: 4,
        }}
      ></Box>
    </Box>
  );
}
