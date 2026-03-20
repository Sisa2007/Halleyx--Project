import React, { useState } from 'react';
import {
  Typography, Box, TextField, Button, Card, CardContent, Grid, LinearProgress, Alert, IconButton
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import BoltIcon from '@mui/icons-material/Bolt';
import ExecutionLog from '../components/ExecutionLog';
import { executionAPI } from '../services/executionAPI';
import { useNotifications } from '../context/NotificationContext';

const resultConfig = {
  SUCCESS:  { color: '#10B981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)', icon: <CheckCircleIcon sx={{ fontSize: 16 }} /> },
  ENDPOINT: { color: '#10B981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)', icon: <CheckCircleIcon sx={{ fontSize: 16 }} /> },
  ERROR:    { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)',  icon: <ErrorIcon sx={{ fontSize: 16 }} /> },
  NO_MATCH: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)',  icon: <ErrorIcon sx={{ fontSize: 16 }} /> },
  DEFAULT:  { color: '#F5C842', bg: 'rgba(245,200,66,0.08)', border: 'rgba(245,200,66,0.25)', icon: <WarningIcon sx={{ fontSize: 16 }} /> },
};

export default function ExecutionPage() {
  const { id: workflowId } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  const [inputs, setInputs] = useState({ amount: '', country: '', priority: '' });
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [progressSteps, setProgressSteps] = useState([]);
  const [error, setError] = useState(null);

  const handleRun = async () => {
    setExecuting(true);
    setError(null);
    setProgressSteps([]);
    setExecutionResult(null);
    try {
      const result = await executionAPI.runWorkflow(workflowId, inputs);
      setExecutionResult(result);
      const steps = result.steps || result.logs || [];

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        await new Promise(r => setTimeout(r, 750));
        setProgressSteps(prev => [...prev, step]);
        const ruleLog = (() => { try { return JSON.parse(step.rule_evaluated); } catch { return null; } })();
        const destStepName = ruleLog?.next_step_name || null;
        const rulesSummary = ruleLog?.evaluated_rules
          ? ruleLog.evaluated_rules.map(r => `"${r.rule}" → ${r.result}`).join(' | ')
          : step.rule_evaluated;

        if (step.result === 'ERROR' || step.error_message) {
          addNotification({ title: 'Execution Error', message: `Step "${step.step_name}" — ${step.error_message || 'Unknown error'}`, type: 'error' });
        } else if (step.result === 'NO_MATCH') {
          addNotification({ title: 'No Rule Matched', message: `Step "${step.step_name}" — Execution halted`, type: 'error' });
        } else if (step.result === 'ENDPOINT') {
          addNotification({ title: 'Workflow Complete', message: `Step "${step.step_name}" — Execution finished`, type: 'success' });
        } else if (step.result === 'DEFAULT') {
          addNotification({ title: destStepName || 'Default Path', message: `Rules evaluated in "${step.step_name}": ${rulesSummary}`, type: 'warning' });
        } else {
          addNotification({ title: destStepName || step.step_name, message: `Conditions met in "${step.step_name}"`, type: 'success' });
        }
      }
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Execution failed');
    } finally {
      setExecuting(false);
    }
  };

  const completed = progressSteps.length > 0 && progressSteps[progressSteps.length - 1]?.status === 'completed';

  return (
    <Box sx={{ p: { xs: 2, md: 3.5 }, maxWidth: 920, mx: 'auto', position: 'relative', zIndex: 1 }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <IconButton onClick={() => navigate('/workflows')} sx={{
            border: '1px solid rgba(126,58,242,0.2)', borderRadius: '9px', color: '#4B4C7A',
            '&:hover': { borderColor: '#7E3AF2', color: '#A78BFA', background: 'rgba(126,58,242,0.1)' },
          }}>
            <ArrowBackIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <BoltIcon sx={{ fontSize: 22, color: '#F5C842', filter: 'drop-shadow(0 0 8px rgba(245,200,66,0.7))' }} />
              <Typography variant="h3" sx={{
                fontFamily: '"Cinzel",serif', fontWeight: 900, fontSize: { xs: '1.4rem', md: '1.8rem' },
                letterSpacing: '0.06em',
                background: 'linear-gradient(135deg, #FDE68A, #F5C842, #D4A017)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                Execute Workflow
              </Typography>
            </Box>
            <Typography sx={{ fontFamily: '"Crimson Pro",serif', fontSize: '0.9rem', color: '#4B4C7A', fontStyle: 'italic' }}>
              Provide inputs and trigger the royal automation
            </Typography>
          </Box>
        </Box>
      </motion.div>

      {/* Inputs card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.45 }}>
        <Card sx={{ borderRadius: '20px', mb: 3 }}>
          <CardContent sx={{ p: 3.5 }}>
            <Typography sx={{ fontFamily: '"Cinzel",serif', fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.1em', color: '#4B4C7A', mb: 2.5 }}>
              WORKFLOW INPUTS
            </Typography>
            <Grid container spacing={3}>
              {[
                { label: 'Amount', name: 'amount', type: 'number', placeholder: 'e.g. 150' },
                { label: 'Country', name: 'country', type: 'text', placeholder: 'e.g. US' },
                { label: 'Priority', name: 'priority', type: 'text', placeholder: 'e.g. High' },
              ].map(({ label, name, type, placeholder }) => (
                <Grid item xs={12} sm={4} key={name}>
                  <TextField
                    label={label} name={name} type={type} value={inputs[name]}
                    onChange={e => setInputs(p => ({ ...p, [name]: e.target.value }))}
                    fullWidth variant="outlined" placeholder={placeholder}
                    inputProps={{ style: { fontFamily: '"Crimson Pro",serif', fontSize: '1rem', color: '#F1F0FF' } }}
                  />
                </Grid>
              ))}
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={executing ? null : <PlayArrowIcon sx={{ fontSize: 18 }} />}
                  onClick={handleRun} disabled={executing}
                  sx={{
                    fontFamily: '"Cinzel",serif', fontSize: '0.75rem', letterSpacing: '0.1em',
                    px: 4, py: 1.25, borderRadius: '10px',
                    background: executing
                      ? 'rgba(126,58,242,0.3)'
                      : 'linear-gradient(135deg, #7E3AF2, #5145CD)',
                    boxShadow: executing ? 'none' : '0 4px 20px rgba(126,58,242,0.4)',
                    '&:hover': { background: 'linear-gradient(135deg, #A78BFA, #7E3AF2)', boxShadow: '0 6px 28px rgba(126,58,242,0.55)', transform: 'translateY(-1px)' },
                    '&:disabled': { opacity: 0.7, cursor: 'not-allowed' },
                  }}
                >
                  {executing ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }} />
                      Executing…
                    </Box>
                  ) : 'Run Workflow'}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>

      {/* Execution progress bar */}
      <AnimatePresence>
        {executing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Box sx={{ mb: 3 }}>
              <LinearProgress sx={{ borderRadius: 4, height: 6 }} />
            </Box>
          </motion.div>
        )}

        {error && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Box sx={{ mb: 3, p: 2.5, borderRadius: '14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <ErrorIcon sx={{ color: '#EF4444', fontSize: 20 }} />
              <Typography sx={{ fontFamily: '"Crimson Pro",serif', color: '#FCA5A5', fontSize: '0.95rem' }}>{error}</Typography>
            </Box>
          </motion.div>
        )}

        {completed && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Box sx={{ mb: 3, p: 2.5, borderRadius: '14px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CheckCircleIcon sx={{ color: '#10B981', fontSize: 20 }} />
              <Typography sx={{ fontFamily: '"Crimson Pro",serif', color: '#6EE7B7', fontSize: '0.95rem' }}>
                Workflow executed successfully — the kingdom's decree is fulfilled.
              </Typography>
            </Box>
          </motion.div>
        )}

        {progressSteps.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <ExecutionLog steps={progressSteps} executionId={executionResult?.id} />
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Box>
  );
}
