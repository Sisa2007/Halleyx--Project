import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import App from './App.jsx'
import './styles/global.css'
import { WorkflowProvider } from './context/WorkflowContext.jsx'
import ErrorBoundary from './ErrorBoundary'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary:    { main: '#7E3AF2', light: '#A78BFA', dark: '#5145CD', contrastText: '#F1F0FF' },
    secondary:  { main: '#1A56DB', light: '#818CF8', dark: '#1E40AF', contrastText: '#F1F0FF' },
    error:      { main: '#EF4444', light: '#FCA5A5', dark: '#DC2626' },
    warning:    { main: '#F59E0B', light: '#FDE68A', dark: '#D97706' },
    success:    { main: '#22C55E', light: '#86EFAC', dark: '#16A34A' },
    info:       { main: '#06B6D4', light: '#67E8F9', dark: '#0891B2' },
    background: { default: '#0A0A14', paper: '#13122A' },
    text:       { primary: '#F1F0FF', secondary: '#A5B4FC', disabled: '#4B4C7A' },
    divider:    'rgba(126,58,242,0.14)',
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
    h1: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, letterSpacing: '-0.015em' },
    h4: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, letterSpacing: '-0.01em' },
    h5: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 500 },
    button: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 600, letterSpacing: '0.01em' },
    body1: { lineHeight: 1.65, fontSize: '0.95rem' },
    body2: { lineHeight: 1.6,  fontSize: '0.875rem' },
  },
  components: {
    MuiCssBaseline: { styleOverrides: { body: { background: '#0A0A14', scrollbarWidth: 'thin', scrollbarColor: '#1E1C3A #0A0A14' } } },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 10, transition: 'all 0.2s ease', fontSize: '0.85rem' },
        contained: {
          background: 'linear-gradient(135deg, #7E3AF2 0%, #5145CD 100%)',
          boxShadow: '0 4px 18px rgba(126,58,242,0.35)',
          '&:hover': { background: 'linear-gradient(135deg, #9F67FF 0%, #7E3AF2 100%)', boxShadow: '0 6px 24px rgba(126,58,242,0.50)', transform: 'translateY(-1px)' },
        },
        outlined: {
          borderColor: 'rgba(126,58,242,0.4)', color: '#A78BFA',
          '&:hover': { borderColor: '#7E3AF2', background: 'rgba(126,58,242,0.08)', boxShadow: '0 0 16px rgba(126,58,242,0.18)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: '#13122A', border: '1px solid rgba(126,58,242,0.14)', borderRadius: 16,
          boxShadow: 'none', transition: 'border-color 0.25s, box-shadow 0.25s',
          '&:hover': { borderColor: 'rgba(126,58,242,0.28)', boxShadow: '0 8px 36px rgba(126,58,242,0.12)' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { background: '#13122A', border: '1px solid rgba(126,58,242,0.14)', borderRadius: 16, boxShadow: 'none' },
      },
    },
    MuiDrawer: { styleOverrides: { paper: { background: '#0F0E1E', borderRight: '1px solid rgba(126,58,242,0.10)' } } },
    MuiAppBar: {
      styleOverrides: {
        root: { background: 'rgba(10,10,20,0.88)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(126,58,242,0.10)', boxShadow: 'none' },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: '1px solid rgba(126,58,242,0.07)', padding: '12px 16px', fontSize: '0.87rem' },
        head: { background: 'rgba(10,10,20,0.5)', color: '#6366F1', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.07em', textTransform: 'uppercase' },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.03em', borderRadius: 8 } },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            background: 'rgba(30,28,58,0.5)',
            '& fieldset': { borderColor: 'rgba(126,58,242,0.22)' },
            '&:hover fieldset': { borderColor: 'rgba(126,58,242,0.45)' },
            '&.Mui-focused fieldset': { borderColor: '#7E3AF2', borderWidth: '1.5px' },
          },
          '& .MuiInputLabel-root': { fontSize: '0.85rem', fontWeight: 500 },
          '& .MuiInputLabel-root.Mui-focused': { color: '#A78BFA' },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: { root: { borderRadius: 9, transition: 'all 0.18s', '&:hover': { background: 'rgba(126,58,242,0.12)' } } },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { background: '#1E1C3A', border: '1px solid rgba(126,58,242,0.2)', fontSize: '0.8rem', borderRadius: 8, padding: '6px 11px' },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(145deg, #13122A 0%, #0F0E1E 100%)',
          border: '1px solid rgba(126,58,242,0.22)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(126,58,242,0.12)',
          borderRadius: 20,
        },
      },
    },
    MuiMenu: {
      styleOverrides: { paper: { background: '#1E1C3A', border: '1px solid rgba(126,58,242,0.18)', boxShadow: '0 16px 44px rgba(0,0,0,0.6)' } },
    },
    MuiSelect: {
      styleOverrides: { root: { background: 'rgba(30,28,58,0.5)' } },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 6, background: 'rgba(126,58,242,0.10)' },
        bar: { background: 'linear-gradient(90deg, #7E3AF2, #1A56DB, #06B6D4)', borderRadius: 6 },
      },
    },
    MuiAlert: {
      styleOverrides: { root: { borderRadius: 12, fontSize: '0.9rem', fontWeight: 500 } },
    },
    MuiSnackbar: {
      styleOverrides: { root: { '& .MuiPaper-root': { borderRadius: 14 } } },
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ErrorBoundary>
          <WorkflowProvider>
            <App />
          </WorkflowProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
