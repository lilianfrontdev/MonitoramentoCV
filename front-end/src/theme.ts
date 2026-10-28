import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    primary: {
      main: '#004B78',
    },
    secondary: {
      main: '#0077AF',
    },
    success: {
      main: '#5FAFAC',
      contrastText: '#163332',
    },
    warning: {
      main: '#EAB618',
      contrastText: '#3F3E3E',
    },
    error: {
      main: '#9E1045',
    },
    background: {
      default: '#F4F6F8',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#3F3E3E',
      secondary: '#64748B',
    },
    divider: '#DCE3E9',
  },
  typography: {
    fontFamily: 'Arial, Helvetica, sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
    },
  },
})