import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

const resultCfg = {
  SUCCESS:  { color: '#10B981', icon: <CheckCircleIcon sx={{ fontSize: 16 }} /> },
  ENDPOINT: { color: '#10B981', icon: <CheckCircleIcon sx={{ fontSize: 16 }} /> },
  ERROR:    { color: '#EF4444', icon: <ErrorIcon sx={{ fontSize: 16 }} /> },
  NO_MATCH: { color: '#EF4444', icon: <ErrorIcon sx={{ fontSize: 16 }} /> },
  DEFAULT:  { color: '#F5C842', icon: <WarningIcon sx={{ fontSize: 16 }} /> },
  PENDING:  { color: '#7C6FAA', icon: <HourglassEmptyIcon sx={{ fontSize: 16 }} /> },
};

export default function ExecutionLog({ steps = [], executionId }) {
  if (!steps.length) return null;
  return (
    <Card sx={{ borderRadius: '18px', overflow: 'hidden' }}>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{
          px: 3, py: 2,
          borderBottom: '1px solid rgba(139,92,246,0.1)',
          background: 'rgba(13,10,26,0.4)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <Typography sx={{ fontFamily: '"Cinzel",serif', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.1em', color: '#A78BFA' }}>
            EXECUTION LOG
          </Typography>
          {executionId && (
            <Typography sx={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '0.68rem', color: '#4C4277' }}>
              ID: {String(executionId).slice(0, 8)}…
            </Typography>
          )}
        </Box>

        {steps.map((step, i) => {
          const key = (step.result || 'PENDING').toUpperCase();
          const cfg = resultCfg[key] || resultCfg.PENDING;
          let ruleLog = null;
          try { ruleLog = JSON.parse(step.rule_evaluated); } catch {}

          return (
            <Box key={i} sx={{
              px: 3, py: 2.5,
              borderBottom: i < steps.length - 1 ? '1px solid rgba(139,92,246,0.06)' : 'none',
              display: 'flex', gap: 2, alignItems: 'flex-start',
              transition: 'background 0.15s',
              '&:hover': { background: 'rgba(139,92,246,0.04)' },
            }}>
              {/* Step number + icon */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                <Box sx={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: `${cfg.color}18`, border: `1px solid ${cfg.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: cfg.color,
                }}>
                  {cfg.icon}
                </Box>
                {i < steps.length - 1 && (
                  <Box sx={{ width: '1px', height: 16, background: 'rgba(139,92,246,0.2)' }} />
                )}
              </Box>

              {/* Content */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5, flexWrap: 'wrap', gap: 1 }}>
                  <Typography sx={{ fontFamily: '"Cinzel",serif', fontWeight: 600, fontSize: '0.78rem', color: '#DDD6FE', letterSpacing: '0.03em' }}>
                    {step.step_name || `Step ${i + 1}`}
                  </Typography>
                  <Box sx={{ px: 0.9, py: 0.2, borderRadius: '20px', background: `${cfg.color}14`, border: `1px solid ${cfg.color}30` }}>
                    <Typography sx={{ fontFamily: '"Cinzel",serif', fontSize: '0.58rem', fontWeight: 700, color: cfg.color, letterSpacing: '0.08em' }}>
                      {step.result || 'RUNNING'}
                    </Typography>
                  </Box>
                </Box>

                {step.error_message && (
                  <Typography sx={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '0.75rem', color: '#EF4444', mb: 0.5 }}>
                    {step.error_message}
                  </Typography>
                )}

                {ruleLog?.evaluated_rules && (
                  <Box sx={{ mt: 1 }}>
                    {ruleLog.evaluated_rules.map((r, j) => (
                      <Box key={j} sx={{
                        display: 'flex', alignItems: 'center', gap: 1, mb: 0.4,
                        p: 0.75, borderRadius: '6px',
                        background: r.result ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.04)',
                        border: r.result ? '1px solid rgba(16,185,129,0.12)' : '1px solid rgba(239,68,68,0.08)',
                      }}>
                        <Box sx={{ width: 5, height: 5, borderRadius: '50%', background: r.result ? '#10B981' : '#EF4444', flexShrink: 0 }} />
                        <Typography sx={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '0.72rem', color: r.result ? '#6EE7B7' : '#FCA5A5', flex: 1, wordBreak: 'break-all' }}>
                          {r.rule}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          );
        })}
      </CardContent>
    </Card>
  );
}
