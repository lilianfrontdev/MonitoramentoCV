import type { ReactNode } from "react";
import { Box } from "@mui/material";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";

type DashboardLayoutProps = {
  children: ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        minHeight: "100vh",
      }}
    >
      <Sidebar />

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Header />

        <Box component="main" sx={{ p: { xs: 3, md: 4 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
