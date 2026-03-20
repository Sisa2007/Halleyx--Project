import React, { useEffect, useState } from 'react';
import { Typography, Box, Card, CardContent, LinearProgress, IconButton, Chip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import RefreshIcon from '@mui/icons-material/Refresh';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { executionAPI } from '../services/executionAPI';

const ST = {
  completed:{ c:'#22C55E', bg:'rgba(34,197,94,0.08)', border:'rgba(34,197,94,0.2)', icon:<CheckCircleIcon sx={{fontSize:14}}/>, label:'Completed' },
  failed:   { c:'#EF4444', bg:'rgba(239,68,68,0.08)', border:'rgba(239,68,68,0.2)', icon:<ErrorIcon sx={{fontSize:14}}/>, label:'Failed' },
  running:  { c:'#F59E0B', bg:'rgba(245,158,11,0.08)',border:'rgba(245,158,11,0.2)',icon:<WarningIcon sx={{fontSize:14}}/>,label:'Running' },
};

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = async (isR=false) => {
    if(isR) setRefreshing(true); else setLoading(true);
    try {
      const d = await executionAPI.getExecutionLogs();
      setLogs(Array.isArray(d)?d:d?.executions||d?.logs||[]);
    } catch(e){ console.error(e); } finally { setLoading(false); setRefreshing(false); }
  };
  useEffect(()=>{ fetch(); const iv=setInterval(()=>fetch(true),15000); return()=>clearInterval(iv); },[]);

  const getS = (log)=>{ const s=(log.status||log.result||'').toLowerCase(); return s==='completed'||s==='success'?'completed':s==='failed'||s==='error'?'failed':'running'; };

  return (
    <Box sx={{p:{xs:2,md:3.5}, maxWidth:1100, mx:'auto', position:'relative', zIndex:1}}>
      <motion.div initial={{opacity:0,y:-14}} animate={{opacity:1,y:0}}>
        <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', mb:4, flexWrap:'wrap', gap:2}}>
          <Box>
            <Box sx={{display:'flex', alignItems:'center', gap:1.5, mb:0.5}}>
              <Box sx={{p:1, borderRadius:'10px', background:'rgba(26,86,219,0.12)', border:'1px solid rgba(26,86,219,0.22)', display:'flex'}}>
                <ListAltIcon sx={{fontSize:20, color:'#818CF8'}}/>
              </Box>
              <Typography sx={{fontFamily:'"Space Grotesk",sans-serif', fontWeight:800, fontSize:{xs:'1.5rem',md:'1.9rem'}, letterSpacing:'-0.02em',
                background:'linear-gradient(135deg, #F1F0FF, #818CF8, #A78BFA)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text'}}>
                Execution Logs
              </Typography>
            </Box>
            <Typography sx={{fontSize:'0.85rem', color:'#4B4C7A'}}>{logs.length} record{logs.length!==1?'s':''} · refreshes every 15s</Typography>
          </Box>
          <IconButton onClick={()=>fetch(true)} disabled={refreshing} sx={{
            border:'1px solid rgba(126,58,242,0.18)', borderRadius:'10px', color:'#4B4C7A', width:40, height:40,
            '&:hover':{borderColor:'#7E3AF2', color:'#A78BFA', background:'rgba(126,58,242,0.09)'},
          }}>
            <RefreshIcon sx={{fontSize:18, animation:refreshing?'spin 1s linear infinite':'none'}}/>
          </IconButton>
        </Box>
      </motion.div>

      {(loading||refreshing) && <LinearProgress sx={{mb:3,borderRadius:4}}/>}

      {!loading && logs.length===0 ? (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.15}}>
          <Box sx={{py:10, textAlign:'center', border:'1px dashed rgba(126,58,242,0.15)', borderRadius:'18px'}}>
            <ListAltIcon sx={{fontSize:56,color:'#2D2B52',mb:2}}/>
            <Typography sx={{fontFamily:'"Space Grotesk",sans-serif', fontSize:'0.95rem', color:'#4B4C7A', fontWeight:700, mb:0.75}}>No Execution Records</Typography>
            <Typography sx={{fontSize:'0.85rem', color:'#2D2B52', fontStyle:'italic'}}>Execute a workflow to see logs appear here</Typography>
          </Box>
        </motion.div>
      ) : (
        <Box>
          <AnimatePresence>
            {logs.map((log,idx)=>{
              const s=getS(log); const cfg=ST[s];
              return (
                <motion.div key={log.id||idx} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{delay:idx*0.035,duration:0.3}}>
                  <Card sx={{mb:2, borderRadius:'14px', border:`1px solid ${cfg.border}`, background:'#13122A',
                    '&:hover':{borderColor:cfg.c, boxShadow:`0 4px 20px ${cfg.bg}`}, transition:'all 0.2s'}}>
                    <CardContent sx={{p:2.5,'&:last-child':{pb:2.5}}}>
                      <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:1.5}}>
                        <Box sx={{flex:1, minWidth:0}}>
                          <Box sx={{display:'flex', alignItems:'center', gap:1.5, mb:0.75}}>
                            <Box sx={{display:'inline-flex', alignItems:'center', gap:0.6, px:1, py:0.3, borderRadius:'20px', background:cfg.bg, border:`1px solid ${cfg.border}`, color:cfg.c, flexShrink:0}}>
                              {cfg.icon}
                              <Typography sx={{fontSize:'0.6rem',fontWeight:700,color:cfg.c,letterSpacing:'0.07em'}}>{cfg.label}</Typography>
                            </Box>
                            <Typography sx={{fontWeight:600,fontSize:'0.85rem',color:'#F1F0FF',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                              {log.workflow_name||log.Workflow?.name||`Execution #${log.id}`}
                            </Typography>
                          </Box>
                          {log.current_step && (
                            <Typography sx={{fontSize:'0.82rem', color:'#4B4C7A', mb:0.25}}>
                              Step: <Box component="span" sx={{color:'#A5B4FC'}}>{log.current_step}</Box>
                              {log.next_step&&log.next_step!=='FINISH'&&<> → <Box component="span" sx={{color:'#A78BFA'}}>{log.next_step}</Box></>}
                            </Typography>
                          )}
                          {log.error_message && <Typography sx={{fontFamily:'monospace',fontSize:'0.75rem',color:'#EF4444',mt:0.5}}>{log.error_message}</Typography>}
                        </Box>
                        <Box sx={{textAlign:'right', flexShrink:0}}>
                          <Typography sx={{fontFamily:'monospace',fontSize:'0.68rem',color:'#4B4C7A'}}>ID: {String(log.id).slice(0,8)}…</Typography>
                          {(log.createdAt||log.created_at)&&<Typography sx={{fontSize:'0.75rem',color:'#4B4C7A',mt:0.2}}>{new Date(log.createdAt||log.created_at).toLocaleString()}</Typography>}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </Box>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </Box>
  );
}
