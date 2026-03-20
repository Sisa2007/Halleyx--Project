import React, { useState, useEffect } from 'react';
import {
  Typography, Box, Button, Card, CardContent, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Select, FormControl,
  InputLabel, Snackbar, Alert, LinearProgress, IconButton, Chip
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TaskIcon from '@mui/icons-material/Task';
import ApprovalIcon from '@mui/icons-material/HowToReg';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { stepAPI } from '../services/stepAPI';

const stepTypes = ['task', 'approval', 'notification'];

const typeConfig = {
  task:         { color: '#7E3AF2', bg: 'rgba(126,58,242,0.1)', border: 'rgba(126,58,242,0.25)', icon: <TaskIcon sx={{ fontSize: 16 }} /> },
  approval:     { color: '#F5C842', bg: 'rgba(245,200,66,0.1)',  border: 'rgba(245,200,66,0.25)', icon: <ApprovalIcon sx={{ fontSize: 16 }} /> },
  notification: { color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', icon: <NotificationsIcon sx={{ fontSize: 16 }} /> },
};

export default function StepEditor() {
  const { id: workflowId } = useParams();
  const navigate = useNavigate();
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStep, setEditingStep] = useState(null);
  const [formData, setFormData] = useState({ name: '', step_type: 'task' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchSteps = async () => {
    try {
      const data = await stepAPI.getStepsByWorkflow(workflowId);
      setSteps(Array.isArray(data) ? data.filter(s => s && s.id) : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSteps(); }, [workflowId]);

  const openDialog = (step = null) => {
    setEditingStep(step);
    setFormData(step ? { name: step.name || '', step_type: step.step_type || 'task' } : { name: '', step_type: 'task' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const name = (formData.name || '').trim();
    if (!name) return;
    try {
      if (editingStep) await stepAPI.updateStep(workflowId, editingStep.id, { ...formData, name });
      else await stepAPI.createStep(workflowId, { ...formData, name });
      setDialogOpen(false);
      setSnackbar({ open: true, message: `Step ${editingStep ? 'updated' : 'created'} successfully!`, severity: 'success' });
      fetchSteps();
    } catch (e) {
      setSnackbar({ open: true, message: e.response?.data?.error || 'Failed to save step', severity: 'error' });
    }
  };

  const handleDelete = async (stepId) => {
    try {
      await stepAPI.deleteStep(workflowId, stepId);
      setSnackbar({ open: true, message: 'Step removed', severity: 'success' });
      fetchSteps();
    } catch (e) {
      setSnackbar({ open: true, message: e.response?.data?.error || 'Failed to delete', severity: 'error' });
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3.5 }, maxWidth: 820, mx: 'auto', position: 'relative', zIndex: 1 }}>
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate('/workflows')} sx={{
              border: '1px solid rgba(126,58,242,0.2)', borderRadius: '9px', color: '#4B4C7A',
              '&:hover': { borderColor: '#7E3AF2', color: '#A78BFA', background: 'rgba(126,58,242,0.1)' },
            }}>
              <ArrowBackIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <Box>
              <Typography variant="h4" sx={{
                fontFamily: '"Cinzel",serif', fontWeight: 700, fontSize: '1.5rem', letterSpacing: '0.05em',
                background: 'linear-gradient(135deg, #F1F0FF, #A78BFA)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                Workflow Steps
              </Typography>
              <Typography sx={{ fontFamily: '"Crimson Pro",serif', fontSize: '0.9rem', color: '#4B4C7A', fontStyle: 'italic' }}>
                {steps.length} step{steps.length !== 1 ? 's' : ''} configured
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon sx={{ fontSize: 16 }} />}
            onClick={() => openDialog()}
            sx={{
              fontFamily: '"Cinzel",serif', fontSize: '0.7rem', letterSpacing: '0.08em',
              px: 2.5, py: 1, borderRadius: '9px',
              background: 'linear-gradient(135deg, #7E3AF2, #5145CD)',
              '&:hover': { background: 'linear-gradient(135deg, #A78BFA, #7E3AF2)', transform: 'translateY(-1px)' },
            }}
          >
            Add Step
          </Button>
        </Box>
      </motion.div>

      {loading && <LinearProgress sx={{ mb: 3, borderRadius: 4 }} />}

      {!loading && steps.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <Box sx={{
            py: 8, textAlign: 'center',
            border: '1px dashed rgba(126,58,242,0.2)', borderRadius: '18px',
            background: 'rgba(126,58,242,0.03)',
          }}>
            <AccountTreeIcon sx={{ fontSize: 48, color: '#2D2B52', mb: 2 }} />
            <Typography sx={{ fontFamily: '"Cinzel",serif', fontSize: '0.9rem', color: '#4B4C7A', letterSpacing: '0.06em', mb: 0.75 }}>
              No Steps Defined
            </Typography>
            <Typography sx={{ fontFamily: '"Crimson Pro",serif', fontSize: '0.9rem', color: '#2D2B52', fontStyle: 'italic' }}>
              Add steps to build your workflow pipeline
            </Typography>
          </Box>
        </motion.div>
      ) : (
        <Box>
          <AnimatePresence>
            {steps.map((step, idx) => {
              const cfg = typeConfig[step.step_type] || typeConfig.task;
              return (
                <motion.div key={step.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ delay: idx * 0.06, duration: 0.35 }}
                >
                  <Card sx={{
                    mb: 2, borderRadius: '14px',
                    border: `1px solid ${cfg.border}`,
                    background: '#13122A',
                    '&:hover': { borderColor: cfg.color, boxShadow: `0 4px 20px ${cfg.bg}` },
                    transition: 'all 0.2s ease',
                    overflow: 'visible',
                    position: 'relative',
                  }}>
                    {/* Step number */}
                    <Box sx={{
                      position: 'absolute', left: -14, top: '50%', transform: 'translateY(-50%)',
                      width: 28, height: 28, borderRadius: '50%',
                      background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}99)`,
                      border: '2px solid #13122A',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: `0 0 12px ${cfg.bg}`,
                      zIndex: 2,
                    }}>
                      <Typography sx={{ fontFamily: '"Cinzel",serif', fontWeight: 900, fontSize: '0.65rem', color: '#0A0A14' }}>
                        {idx + 1}
                      </Typography>
                    </Box>

                    <CardContent sx={{ pl: 3.5, pr: 2.5, py: 2, '&:last-child': { pb: 2 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ color: cfg.color, display: 'flex', filter: `drop-shadow(0 0 6px ${cfg.bg})` }}>
                          {cfg.icon}
                        </Box>
                        <Box>
                          <Typography sx={{ fontFamily: '"Cinzel",serif', fontWeight: 600, fontSize: '0.82rem', color: '#F1F0FF', letterSpacing: '0.03em' }}>
                            {step.name}
                          </Typography>
                          <Box sx={{
                            display: 'inline-flex', alignItems: 'center', gap: 0.5,
                            mt: 0.3, px: 0.9, py: 0.2, borderRadius: '20px',
                            background: cfg.bg, border: `1px solid ${cfg.border}`,
                          }}>
                            <Typography sx={{ fontFamily: '"Cinzel",serif', fontSize: '0.6rem', color: cfg.color, letterSpacing: '0.08em' }}>
                              {step.step_type?.toUpperCase()}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                        <IconButton size="small" onClick={() => openDialog(step)} sx={{
                          color: '#4B4C7A', borderRadius: '7px', width: 28, height: 28,
                          '&:hover': { color: '#A78BFA', background: 'rgba(126,58,242,0.1)' },
                        }}>
                          <EditIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(step.id)} sx={{
                          color: '#4B4C7A', borderRadius: '7px', width: 28, height: 28,
                          '&:hover': { color: '#EF4444', background: 'rgba(239,68,68,0.1)' },
                        }}>
                          <DeleteIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                  {idx < steps.length - 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 0.5 }}>
                      <Box sx={{ width: '1px', height: 16, background: 'linear-gradient(180deg, rgba(126,58,242,0.4), rgba(245,200,66,0.3))' }} />
                    </Box>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </Box>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Cinzel",serif', fontWeight: 700, fontSize: '0.92rem', letterSpacing: '0.06em', color: '#F1F0FF', pt: 3, px: 3 }}>
          {editingStep ? 'Edit Step' : 'Add Step'}
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 1 }}>
          <TextField
            label="Step Name" value={formData.name} fullWidth
            onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
            sx={{ mb: 3, mt: 1 }} variant="outlined"
            inputProps={{ style: { fontFamily: '"Crimson Pro",serif', fontSize: '1rem', color: '#F1F0FF' } }}
          />
          <FormControl fullWidth variant="outlined">
            <InputLabel sx={{ fontFamily: '"Cinzel",serif', fontSize: '0.78rem' }}>Step Type</InputLabel>
            <Select
              value={formData.step_type} label="Step Type"
              onChange={e => setFormData(p => ({ ...p, step_type: e.target.value }))}
              sx={{ fontFamily: '"Crimson Pro",serif', color: '#F1F0FF' }}
            >
              {stepTypes.map(t => (
                <MenuItem key={t} value={t} sx={{ fontFamily: '"Crimson Pro",serif' }}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ fontFamily: '"Cinzel",serif', fontSize: '0.68rem', letterSpacing: '0.06em', color: '#4B4C7A' }}>Cancel</Button>
          <Button onClick={handleSave} disabled={!formData.name.trim()} sx={{
            fontFamily: '"Cinzel",serif', fontSize: '0.7rem', letterSpacing: '0.07em',
            px: 2.5, py: 0.9, borderRadius: '8px',
            background: 'linear-gradient(135deg, #7E3AF2, #5145CD)',
            color: '#F1F0FF',
            '&:hover': { background: 'linear-gradient(135deg, #A78BFA, #7E3AF2)' },
            '&:disabled': { opacity: 0.4 },
          }}>
            {editingStep ? 'Update Step' : 'Add Step'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} sx={{ width: '100%', borderRadius: '10px', fontFamily: '"Crimson Pro",serif' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
