import React, { useEffect, useState } from 'react';
import {
  Typography, Box, Button, Card, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, InputAdornment, LinearProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import EditIcon from '@mui/icons-material/Edit';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import RuleIcon from '@mui/icons-material/Rule';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { workflowAPI } from '../services/workflowAPI';

const fade = (d=0)=>({initial:{opacity:0,y:14}, animate:{opacity:1,y:0}, transition:{delay:d, duration:0.38}});

const Btn = ({title, icon, hover='#A78BFA', hbg='rgba(126,58,242,0.12)', onClick}) => (
  <Tooltip title={title} arrow>
    <IconButton size="small" onClick={onClick} sx={{
      width:30, height:30, borderRadius:'7px', color:'#4B4C7A',
      border:'1px solid transparent', transition:'all 0.16s',
      '&:hover':{color:hover, borderColor:`${hover}40`, background:hbg},
    }}>{icon}</IconButton>
  </Tooltip>
);

export default function WorkflowList() {
  const nav = useNavigate();
  const [wfs, setWfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [del, setDel] = useState({open:false, wf:null});

  const fetch = async () => {
    try { setLoading(true); const d = await workflowAPI.getAllWorkflows(); setWfs(d.workflows||[]); }
    catch(e){ console.error(e); } finally { setLoading(false); }
  };
  useEffect(()=>{ fetch(); },[]);

  const filtered = wfs.filter(w=>(w.name||'').toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async () => {
    if(!del.wf) return;
    try { await workflowAPI.deleteWorkflow(del.wf.id); setDel({open:false,wf:null}); fetch(); }
    catch(e){ console.error(e); }
  };

  return (
    <Box sx={{p:{xs:2,md:3.5}, maxWidth:1300, mx:'auto', position:'relative', zIndex:1}}>
      <motion.div {...fade(0)}>
        <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', mb:4, flexWrap:'wrap', gap:2}}>
          <Box>
            <Box sx={{display:'flex', alignItems:'center', gap:1.5, mb:0.5}}>
              <Box sx={{p:1, borderRadius:'10px', background:'rgba(126,58,242,0.12)', border:'1px solid rgba(126,58,242,0.22)', display:'flex'}}>
                <AccountTreeIcon sx={{fontSize:20, color:'#A78BFA'}}/>
              </Box>
              <Typography sx={{fontFamily:'"Space Grotesk",sans-serif', fontWeight:800, fontSize:{xs:'1.5rem',md:'1.9rem'}, letterSpacing:'-0.02em',
                background:'linear-gradient(135deg, #F1F0FF, #A78BFA, #818CF8)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text'}}>
                Workflows
              </Typography>
            </Box>
            <Typography sx={{fontSize:'0.85rem', color:'#4B4C7A'}}>{wfs.length} pipeline{wfs.length!==1?'s':''} configured</Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon sx={{fontSize:16}}/>} onClick={()=>nav('/workflows/create')}
            sx={{fontSize:'0.82rem', fontWeight:600, px:2.5, py:1, borderRadius:'10px', boxShadow:'0 4px 18px rgba(126,58,242,0.35)'}}>
            New Workflow
          </Button>
        </Box>
      </motion.div>

      <motion.div {...fade(0.08)}>
        <TextField placeholder="Search workflows…" value={search} onChange={e=>setSearch(e.target.value)} size="small"
          InputProps={{startAdornment:<InputAdornment position="start"><SearchIcon sx={{fontSize:16,color:'#4B4C7A'}}/></InputAdornment>,
            sx:{fontSize:'0.9rem','& fieldset':{borderColor:'rgba(126,58,242,0.16)'},'&:hover fieldset':{borderColor:'rgba(126,58,242,0.36)'},'&.Mui-focused fieldset':{borderColor:'#7E3AF2 !important'}}}}
          sx={{width:{xs:'100%',sm:340}, mb:2.5,'& input':{color:'#F1F0FF','&::placeholder':{color:'#4B4C7A',opacity:1}}}}/>
      </motion.div>

      {loading && <LinearProgress sx={{mb:2, borderRadius:4}}/>}

      <motion.div {...fade(0.14)}>
        <Card sx={{borderRadius:'18px', overflow:'hidden'}}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {['Workflow','Version','Status','Actions'].map(h=>(
                    <TableCell key={h} align={h==='Actions'?'right':'left'} sx={{py:1.5, px:2.5}}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <AnimatePresence>
                  {!loading && filtered.length===0 ? (
                    <TableRow><TableCell colSpan={4} align="center" sx={{py:8, borderBottom:0}}>
                      <AccountTreeIcon sx={{fontSize:48,color:'#2D2B52',mb:1.5,display:'block',mx:'auto'}}/>
                      <Typography sx={{fontSize:'0.9rem',color:'#4B4C7A',fontWeight:600,mb:0.5}}>{search?'No matches':'No workflows yet'}</Typography>
                      <Typography sx={{fontSize:'0.8rem',color:'#2D2B52',fontStyle:'italic'}}>{search?'Try different terms':'Create your first automation pipeline'}</Typography>
                    </TableCell></TableRow>
                  ) : filtered.map((wf,idx)=>{
                    const active = wf.is_active||wf.status==='Active';
                    return (
                      <motion.tr key={wf.id} initial={{opacity:0,y:7}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{delay:idx*0.035}} style={{display:'table-row'}}>
                        <TableCell sx={{px:2.5, borderBottom:'1px solid rgba(126,58,242,0.06)'}}>
                          <Box sx={{display:'flex', alignItems:'center', gap:1.5}}>
                            <Box sx={{width:32, height:32, borderRadius:'9px', background:'linear-gradient(135deg, rgba(126,58,242,0.15), rgba(26,86,219,0.08))', border:'1px solid rgba(126,58,242,0.18)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                              <AccountTreeIcon sx={{fontSize:15, color:'#7E3AF2'}}/>
                            </Box>
                            <Typography sx={{fontWeight:600, fontSize:'0.85rem', color:'#F1F0FF'}}>{wf.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{borderBottom:'1px solid rgba(126,58,242,0.06)'}}><Typography sx={{fontFamily:'monospace', fontSize:'0.78rem', color:'#6366F1'}}>v{wf.version}</Typography></TableCell>
                        <TableCell sx={{borderBottom:'1px solid rgba(126,58,242,0.06)'}}>
                          <Box sx={{display:'inline-flex', alignItems:'center', gap:0.6, px:1.1, py:0.35, borderRadius:'20px',
                            background: active?'rgba(34,197,94,0.10)':'rgba(126,58,242,0.06)',
                            border: active?'1px solid rgba(34,197,94,0.22)':'1px solid rgba(126,58,242,0.14)',
                          }}>
                            <Box sx={{width:5,height:5,borderRadius:'50%', background:active?'#22C55E':'#4B4C7A', boxShadow:active?'0 0 5px rgba(34,197,94,0.7)':'none', animation:active?'pulse-dot 2s infinite':'none'}}/>
                            <Typography sx={{fontSize:'0.65rem',fontWeight:700,letterSpacing:'0.04em',color:active?'#22C55E':'#4B4C7A'}}>{active?'Active':'Inactive'}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{px:2.5, borderBottom:'1px solid rgba(126,58,242,0.06)'}}>
                          <Box sx={{display:'flex', justifyContent:'flex-end', gap:0.5}}>
                            <Btn title="Edit"    icon={<EditIcon sx={{fontSize:14}}/>}        onClick={()=>nav(`/workflows/${wf.id}/edit`)}/>
                            <Btn title="Steps"   icon={<AccountTreeIcon sx={{fontSize:14}}/>}  onClick={()=>nav(`/workflows/${wf.id}/steps`)}/>
                            <Btn title="Rules"   icon={<RuleIcon sx={{fontSize:14}}/>}         onClick={()=>nav(`/workflows/${wf.id}/rules`)}/>
                            <Btn title="Execute" icon={<PlayArrowIcon sx={{fontSize:14}}/>} hover="#22C55E" hbg="rgba(34,197,94,0.10)" onClick={()=>nav(`/workflows/${wf.id}/execute`)}/>
                            <Btn title="Delete"  icon={<DeleteIcon sx={{fontSize:14}}/>}   hover="#EF4444" hbg="rgba(239,68,68,0.10)"  onClick={()=>setDel({open:true,wf})}/>
                          </Box>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </motion.div>

      <Dialog open={del.open} onClose={()=>setDel({open:false,wf:null})} maxWidth="xs" fullWidth>
        <DialogTitle sx={{fontFamily:'"Space Grotesk",sans-serif', fontWeight:700, fontSize:'0.98rem', color:'#F1F0FF', pt:3, px:3}}>Delete Workflow?</DialogTitle>
        <DialogContent sx={{px:3, pb:1}}>
          <Typography sx={{fontSize:'0.9rem', color:'#A5B4FC', lineHeight:1.6}}>
            Permanently delete <Box component="span" sx={{color:'#F1F0FF', fontWeight:600}}>"{del.wf?.name}"</Box>? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{px:3, pb:3, gap:1}}>
          <Button onClick={()=>setDel({open:false,wf:null})} sx={{fontSize:'0.8rem', color:'#4B4C7A','&:hover':{color:'#A78BFA'}}}>Cancel</Button>
          <Button onClick={handleDelete} sx={{fontSize:'0.8rem',px:2.5,py:0.9,borderRadius:'9px',background:'rgba(239,68,68,0.12)',border:'1px solid rgba(239,68,68,0.28)',color:'#EF4444','&:hover':{background:'rgba(239,68,68,0.2)'}}}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
