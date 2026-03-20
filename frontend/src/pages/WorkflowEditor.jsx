import React, { useState, useEffect } from 'react';
import {
  Typography, Box, TextField, Button, Card, CardContent, Grid,
  IconButton, MenuItem, Select, FormControl, InputLabel, Divider, CircularProgress
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { workflowAPI } from '../services/workflowAPI';

export default function WorkflowEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({ name: '', version: '1.0', inputSchema: [] });
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEditing) return;
    workflowAPI.getWorkflow(id)
      .then(data => {
        setFormData({ name: data.name || '', version: data.version || '1.0', inputSchema: data.inputSchema || [] });
      })
      .catch(() => setError('Failed to load workflow'))
      .finally(() => setLoading(false));
  }, [id, isEditing]);

  const handleSave = async () => {
    if (!formData.name.trim()) return;
    setSaving(true);
    setError('');
    try {
      if (isEditing) await workflowAPI.updateWorkflow(id, formData);
      else await workflowAPI.createWorkflow(formData);
      navigate('/workflows');
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to save workflow');
    } finally {
      setSaving(false);
    }
  };

  const addField = () => setFormData(p => ({ ...p, inputSchema: [...p.inputSchema, { name: '', type: 'string' }] }));
  const removeField = (i) => setFormData(p => ({ ...p, inputSchema: p.inputSchema.filter((_, x) => x !== i) }));
  const updateField = (i, key, val) => {
    const s = [...formData.inputSchema];
    s[i][key] = val;
    setFormData(p => ({ ...p, inputSchema: s }));
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
      <CircularProgress sx={{ color: '#7E3AF2' }} />
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3.5 }, maxWidth: 820, mx: 'auto', position: 'relative', zIndex: 1 }}>
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
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
              {isEditing ? 'Edit Workflow' : 'Create Workflow'}
            </Typography>
            <Typography sx={{ fontFamily: '"Crimson Pro",serif', fontSize: '0.92rem', color: '#4B4C7A', fontStyle: 'italic' }}>
              {isEditing ? 'Refine your automation blueprint' : 'Define a new royal automation process'}
            </Typography>
          </Box>
        </Box>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.45 }}>
        <Card sx={{ mt: 3, borderRadius: '20px', overflow: 'visible' }}>
          <CardContent sx={{ p: 4 }}>
            {error && (
              <Box sx={{ mb: 3, p: 2, borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <Typography sx={{ fontFamily: '"Crimson Pro",serif', color: '#EF4444', fontSize: '0.9rem' }}>{error}</Typography>
              </Box>
            )}

            <Grid container spacing={3}>
              <Grid item xs={12} sm={8}>
                <TextField
                  label="Workflow Name"
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  fullWidth required variant="outlined"
                  inputProps={{ style: { fontFamily: '"Crimson Pro",serif', fontSize: '1rem', color: '#F1F0FF' } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Version"
                  value={formData.version}
                  onChange={e => setFormData(p => ({ ...p, version: e.target.value }))}
                  fullWidth variant="outlined"
                  inputProps={{ style: { fontFamily: '"JetBrains Mono",monospace', fontSize: '0.9rem', color: '#A5B4FC' } }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent, rgba(126,58,242,0.3), rgba(245,200,66,0.2), transparent)',
                  my: 1,
                }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, mt: 1.5 }}>
                  <Typography sx={{ fontFamily: '"Cinzel",serif', fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.1em', color: '#A78BFA' }}>
                    INPUT SCHEMA
                  </Typography>
                  <Button
                    startIcon={<AddCircleOutlineIcon sx={{ fontSize: 15 }} />}
                    onClick={addField} size="small" variant="outlined"
                    sx={{
                      fontFamily: '"Cinzel",serif', fontSize: '0.65rem', letterSpacing: '0.06em',
                      borderColor: 'rgba(245,200,66,0.3)', color: '#F5C842',
                      '&:hover': { borderColor: '#F5C842', background: 'rgba(245,200,66,0.08)' },
                    }}
                  >
                    Add Field
                  </Button>
                </Box>

                <AnimatePresence>
                  {formData.inputSchema.length === 0 ? (
                    <Box sx={{ py: 3, textAlign: 'center', border: '1px dashed rgba(126,58,242,0.2)', borderRadius: '12px' }}>
                      <Typography sx={{ fontFamily: '"Crimson Pro",serif', color: '#4B4C7A', fontStyle: 'italic', fontSize: '0.92rem' }}>
                        No input fields defined. Add fields to define the workflow's data schema.
                      </Typography>
                    </Box>
                  ) : (
                    formData.inputSchema.map((field, i) => (
                      <motion.div key={i}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <Grid container spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
                          <Grid item xs={6}>
                            <TextField
                              label="Field Name" value={field.name} size="small" fullWidth
                              onChange={e => updateField(i, 'name', e.target.value)}
                              placeholder="e.g., amount"
                              inputProps={{ style: { fontFamily: '"JetBrains Mono",monospace', fontSize: '0.85rem', color: '#F1F0FF' } }}
                            />
                          </Grid>
                          <Grid item xs={5}>
                            <FormControl fullWidth size="small">
                              <InputLabel sx={{ fontFamily: '"Cinzel",serif', fontSize: '0.75rem' }}>Type</InputLabel>
                              <Select
                                value={field.type} label="Type"
                                onChange={e => updateField(i, 'type', e.target.value)}
                                sx={{ fontFamily: '"Crimson Pro",serif', color: '#F1F0FF' }}
                              >
                                {['string', 'number', 'boolean'].map(t => (
                                  <MenuItem key={t} value={t} sx={{ fontFamily: '"Crimson Pro",serif' }}>
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={1}>
                            <IconButton onClick={() => removeField(i)} size="small" sx={{
                              color: '#4B4C7A', '&:hover': { color: '#EF4444', background: 'rgba(239,68,68,0.1)' },
                            }}>
                              <DeleteIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </Grid>

              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 1 }}>
                <Button onClick={() => navigate('/workflows')} sx={{
                  fontFamily: '"Cinzel",serif', fontSize: '0.7rem', letterSpacing: '0.06em',
                  color: '#4B4C7A', '&:hover': { color: '#A78BFA' },
                }}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon sx={{ fontSize: 16 }} />}
                  onClick={handleSave}
                  disabled={!formData.name.trim() || saving}
                  sx={{
                    fontFamily: '"Cinzel",serif', fontSize: '0.72rem', letterSpacing: '0.08em',
                    px: 3, py: 1, borderRadius: '9px',
                    background: 'linear-gradient(135deg, #7E3AF2, #5145CD)',
                    '&:hover': { background: 'linear-gradient(135deg, #A78BFA, #7E3AF2)', transform: 'translateY(-1px)' },
                    '&:disabled': { opacity: 0.5 },
                  }}
                >
                  {saving ? 'Saving…' : isEditing ? 'Update Workflow' : 'Create Workflow'}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}
