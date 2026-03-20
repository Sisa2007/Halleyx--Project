import React, { useState, useEffect } from 'react';
import {
  Typography, Box, Button, Card, CardContent, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Snackbar, Alert, LinearProgress, IconButton
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RuleIcon from '@mui/icons-material/Rule';
import { ruleAPI } from '../services/ruleAPI';

export default function RuleEditor() {
  const { id: workflowId } = useParams();
  const navigate = useNavigate();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({ condition: '', priority: 1, nextStep: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchRules = async () => {
    try {
      const data = await ruleAPI.getRulesByWorkflow(workflowId);
      setRules(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRules(); }, [workflowId]);

  const openDialog = (rule = null) => {
    setEditingRule(rule);
    setFormData(rule ? { condition: rule.condition, priority: rule.priority, nextStep: rule.nextStep || '' } : { condition: '', priority: (rules.length + 1), nextStep: '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!(formData.condition || '').trim()) return;
    try {
      if (editingRule) await ruleAPI.updateRule(workflowId, editingRule.id, formData);
      else await ruleAPI.createRule(workflowId, formData);
      setDialogOpen(false);
      setSnackbar({ open: true, message: `Rule ${editingRule ? 'updated' : 'created'} successfully!`, severity: 'success' });
      fetchRules();
    } catch (e) {
      setSnackbar({ open: true, message: e.response?.data?.error || 'Failed to save rule', severity: 'error' });
    }
  };

  const handleDelete = async (ruleId) => {
    try {
      await ruleAPI.deleteRule(workflowId, ruleId);
      setSnackbar({ open: true, message: 'Rule removed', severity: 'success' });
      fetchRules();
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to delete', severity: 'error' });
    }
  };

  const priorityColor = (p) => p === 1 ? '#F5C842' : p === 2 ? '#A78BFA' : '#4B4C7A';

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
                background: 'linear-gradient(135deg, #FDE68A, #F5C842)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                Workflow Rules
              </Typography>
              <Typography sx={{ fontFamily: '"Crimson Pro",serif', fontSize: '0.9rem', color: '#4B4C7A', fontStyle: 'italic' }}>
                {rules.length} rule{rules.length !== 1 ? 's' : ''} governing the pipeline
              </Typography>
            </Box>
          </Box>
          <Button variant="contained" startIcon={<AddIcon sx={{ fontSize: 16 }} />} onClick={() => openDialog()}
            sx={{
              fontFamily: '"Cinzel",serif', fontSize: '0.7rem', letterSpacing: '0.08em',
              px: 2.5, py: 1, borderRadius: '9px',
              background: 'linear-gradient(135deg, #F5C842, #D4A017)', color: '#0A0A14',
              boxShadow: '0 4px 20px rgba(245,200,66,0.3)',
              '&:hover': { background: 'linear-gradient(135deg, #FDE68A, #F5C842)', boxShadow: '0 6px 28px rgba(245,200,66,0.45)', transform: 'translateY(-1px)' },
            }}>
            Add Rule
          </Button>
        </Box>
      </motion.div>

      {loading && <LinearProgress sx={{ mb: 3, borderRadius: 4 }} />}

      {!loading && rules.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <Box sx={{ py: 8, textAlign: 'center', border: '1px dashed rgba(245,200,66,0.2)', borderRadius: '18px', background: 'rgba(245,200,66,0.02)' }}>
            <RuleIcon sx={{ fontSize: 48, color: '#2D2B52', mb: 2 }} />
            <Typography sx={{ fontFamily: '"Cinzel",serif', fontSize: '0.9rem', color: '#4B4C7A', letterSpacing: '0.06em', mb: 0.75 }}>
              No Rules Defined
            </Typography>
            <Typography sx={{ fontFamily: '"Crimson Pro",serif', fontSize: '0.9rem', color: '#2D2B52', fontStyle: 'italic' }}>
              Rules govern how workflow steps branch and transition
            </Typography>
          </Box>
        </motion.div>
      ) : (
        <AnimatePresence>
          {[...rules].sort((a, b) => a.priority - b.priority).map((rule, idx) => (
            <motion.div key={rule.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: idx * 0.06, duration: 0.35 }}
            >
              <Card sx={{
                mb: 2, borderRadius: '14px',
                border: '1px solid rgba(245,200,66,0.15)',
                background: '#13122A',
                '&:hover': { borderColor: 'rgba(245,200,66,0.35)', boxShadow: '0 4px 20px rgba(245,200,66,0.08)' },
                transition: 'all 0.2s ease',
              }}>
                <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{
                        px: 1, py: 0.3, borderRadius: '20px',
                        background: `${priorityColor(rule.priority)}18`,
                        border: `1px solid ${priorityColor(rule.priority)}35`,
                      }}>
                        <Typography sx={{ fontFamily: '"Cinzel",serif', fontSize: '0.6rem', fontWeight: 700, color: priorityColor(rule.priority), letterSpacing: '0.08em' }}>
                          PRIORITY {rule.priority}
                        </Typography>
                      </Box>
                      {rule.nextStep && (
                        <Typography sx={{ fontFamily: '"Crimson Pro",serif', fontSize: '0.82rem', color: '#4B4C7A' }}>
                          → <Box component="span" sx={{ color: '#A78BFA' }}>{rule.nextStep}</Box>
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton size="small" onClick={() => openDialog(rule)} sx={{
                        color: '#4B4C7A', borderRadius: '7px', width: 28, height: 28,
                        '&:hover': { color: '#A78BFA', background: 'rgba(126,58,242,0.1)' },
                      }}>
                        <EditIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(rule.id)} sx={{
                        color: '#4B4C7A', borderRadius: '7px', width: 28, height: 28,
                        '&:hover': { color: '#EF4444', background: 'rgba(239,68,68,0.1)' },
                      }}>
                        <DeleteIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                  </Box>
                  <Box sx={{
                    p: 1.5, borderRadius: '9px',
                    background: 'rgba(13,10,26,0.5)',
                    border: '1px solid rgba(126,58,242,0.1)',
                    fontFamily: '"JetBrains Mono",monospace',
                    fontSize: '0.8rem',
                    color: '#A5B4FC',
                    lineHeight: 1.6,
                    wordBreak: 'break-all',
                  }}>
                    {rule.condition}
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Cinzel",serif', fontWeight: 700, fontSize: '0.92rem', letterSpacing: '0.06em', color: '#F1F0FF', pt: 3, px: 3 }}>
          {editingRule ? 'Edit Rule' : 'Add Rule'}
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 1 }}>
          <TextField
            label="Condition" value={formData.condition} fullWidth multiline rows={3} sx={{ mb: 2.5, mt: 1 }}
            onChange={e => setFormData(p => ({ ...p, condition: e.target.value }))}
            placeholder='e.g., data.amount > 100 && data.country == "US"'
            inputProps={{ style: { fontFamily: '"JetBrains Mono",monospace', fontSize: '0.85rem', color: '#A5B4FC' } }}
          />
          <TextField
            label="Priority" type="number" value={formData.priority} fullWidth sx={{ mb: 2.5 }}
            onChange={e => setFormData(p => ({ ...p, priority: Number(e.target.value) }))}
            inputProps={{ min: 1, style: { fontFamily: '"Crimson Pro",serif', color: '#F1F0FF' } }}
          />
          <TextField
            label="Next Step (name)" value={formData.nextStep} fullWidth
            onChange={e => setFormData(p => ({ ...p, nextStep: e.target.value }))}
            placeholder="e.g., Manager Approval"
            inputProps={{ style: { fontFamily: '"Crimson Pro",serif', fontSize: '0.95rem', color: '#F1F0FF' } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ fontFamily: '"Cinzel",serif', fontSize: '0.68rem', letterSpacing: '0.06em', color: '#4B4C7A' }}>Cancel</Button>
          <Button onClick={handleSave} disabled={!(formData.condition || '').trim()} sx={{
            fontFamily: '"Cinzel",serif', fontSize: '0.7rem', letterSpacing: '0.07em',
            px: 2.5, py: 0.9, borderRadius: '8px',
            background: 'linear-gradient(135deg, #F5C842, #D4A017)', color: '#0A0A14',
            '&:hover': { background: 'linear-gradient(135deg, #FDE68A, #F5C842)' },
            '&:disabled': { opacity: 0.4 },
          }}>
            {editingRule ? 'Update Rule' : 'Add Rule'}
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
