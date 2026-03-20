import React, { useState, useEffect } from 'react';
import { Typography, Box, Grid, Card, CardContent, Button, LinearProgress } from '@mui/material';
import { motion } from 'framer-motion';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GridViewIcon from '@mui/icons-material/GridView';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { workflowAPI } from '../services/workflowAPI';
import ThreeDAnalytics from '../components/ThreeDAnalytics';
import { useNavigate } from 'react-router-dom';

const fade = (d=0) => ({ initial:{opacity:0,y:18}, animate:{opacity:1,y:0}, transition:{delay:d, duration:0.42, ease:[0.25,0.46,0.45,0.94]} });

const STATS = (s) => [
  { title:'Active Workflows',       value:s.totalWorkflows,             color:'#7E3AF2', bg:'rgba(126,58,242,0.08)', border:'rgba(126,58,242,0.22)', icon:<AutorenewIcon sx={{fontSize:20}}/>,            change:'+12%', up:true },
  { title:'Successful Executions',  value:(s.successfulExecutions||0).toLocaleString(), color:'#22C55E', bg:'rgba(34,197,94,0.08)', border:'rgba(34,197,94,0.22)', icon:<CheckCircleOutlineIcon sx={{fontSize:20}}/>,  change:'+8%',  up:true },
  { title:'Failed Executions',      value:s.failedExecutions||0,        color:'#EF4444', bg:'rgba(239,68,68,0.08)',  border:'rgba(239,68,68,0.22)',  icon:<ErrorOutlineIcon sx={{fontSize:20}}/>,             change:'-3%',  up:false },
  { title:'Success Rate',
    value: (s.successfulExecutions+s.failedExecutions)>0
      ? Math.round(s.successfulExecutions/(s.successfulExecutions+s.failedExecutions)*100)+'%' : '—',
    color:'#1A56DB', bg:'rgba(26,86,219,0.08)', border:'rgba(26,86,219,0.22)', icon:<TrendingUpIcon sx={{fontSize:20}}/>, change:'+5%', up:true },
];

const TooltipBox = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null;
  return (
    <Box sx={{background:'#1E1C3A', border:'1px solid rgba(126,58,242,0.22)', borderRadius:'10px', p:1.5}}>
      <Typography sx={{fontSize:'0.7rem', color:'#4B4C7A', mb:0.5}}>{label}</Typography>
      {payload.map((p,i)=><Typography key={i} sx={{fontSize:'0.82rem', color:p.color, fontWeight:600}}>{p.name}: {p.value}</Typography>)}
    </Box>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats]     = useState({totalWorkflows:0, successfulExecutions:0, failedExecutions:0});
  const [analytics, setAnalytics] = useState({executionHistory:[]});
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try {
      const [s,a] = await Promise.all([workflowAPI.getStats(), workflowAPI.getAnalytics()]);
      setStats(s); setAnalytics(a);
    } catch(e){ console.error(e); } finally { setLoading(false); }
  };
  useEffect(()=>{ fetch(); const iv=setInterval(fetch,10000); return ()=>clearInterval(iv); },[]);

  const chartData = analytics.executionHistory?.length>0 ? analytics.executionHistory
    : Array.from({length:7},(_,i)=>({name:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i], success:Math.floor(Math.random()*40)+10, failed:Math.floor(Math.random()*8)}));

  const cards = STATS(stats);

  return (
    <Box sx={{p:{xs:2,md:3.5}, maxWidth:1400, mx:'auto', position:'relative', zIndex:1}}>

      {/* Header */}
      <motion.div {...fade(0)}>
        <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', mb:4, flexWrap:'wrap', gap:2}}>
          <Box>
            <Typography sx={{
              fontFamily:'"Space Grotesk",sans-serif', fontWeight:800,
              fontSize:{xs:'1.6rem',md:'2.1rem'}, letterSpacing:'-0.025em',
              background:'linear-gradient(135deg, #F1F0FF 0%, #A78BFA 60%, #818CF8 100%)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
              lineHeight:1.15, mb:0.5,
            }}>
              Dashboard
            </Typography>
            <Typography sx={{fontSize:'0.88rem', color:'#4B4C7A'}}>Live automation overview · refreshes every 10s</Typography>
          </Box>
          <Button
            onClick={()=>navigate('/dash-builder')}
            variant="outlined"
            startIcon={<GridViewIcon sx={{fontSize:16}}/>}
            endIcon={<ArrowForwardIcon sx={{fontSize:14}}/>}
            sx={{
              fontSize:'0.8rem', fontWeight:600, px:2.5, py:1, borderRadius:'10px',
              borderColor:'rgba(126,58,242,0.35)', color:'#A78BFA',
              background:'rgba(126,58,242,0.06)',
              '&:hover':{borderColor:'#7E3AF2', background:'rgba(126,58,242,0.12)', boxShadow:'0 0 18px rgba(126,58,242,0.2)'},
            }}
          >
            Configure Dashboard
          </Button>
        </Box>
      </motion.div>

      {loading && <LinearProgress sx={{mb:3, borderRadius:4}}/>}

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{mb:3}}>
        {cards.map((c,i)=>(
          <Grid item xs={12} sm={6} lg={3} key={c.title}>
            <motion.div {...fade(i*0.07)} style={{height:'100%'}}>
              <Card sx={{
                height:'100%', border:`1px solid ${c.border}`, background:'#13122A',
                borderRadius:'18px', position:'relative', overflow:'hidden',
                transition:'box-shadow 0.25s, border-color 0.25s',
                '&:hover':{boxShadow:`0 8px 32px ${c.bg}`, borderColor:c.color},
                '&::before':{content:'""', position:'absolute', top:0, left:0, right:0, height:'2px',
                  background:`linear-gradient(90deg, transparent, ${c.color}, transparent)`,
                },
              }}>
                <CardContent sx={{p:3,'&:last-child':{pb:3}}}>
                  <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', mb:2.5}}>
                    <Box sx={{p:1.25, borderRadius:'10px', background:c.bg, border:`1px solid ${c.border}`, color:c.color, display:'flex'}}>
                      {c.icon}
                    </Box>
                    <Box sx={{
                      px:1, py:0.25, borderRadius:'20px',
                      background: c.up ? 'rgba(34,197,94,0.10)' : 'rgba(239,68,68,0.10)',
                      border: c.up ? '1px solid rgba(34,197,94,0.22)' : '1px solid rgba(239,68,68,0.22)',
                    }}>
                      <Typography sx={{fontSize:'0.62rem', fontWeight:700, color: c.up ? '#22C55E' : '#EF4444', letterSpacing:'0.04em'}}>{c.change}</Typography>
                    </Box>
                  </Box>
                  <Typography sx={{
                    fontFamily:'"Space Grotesk",sans-serif', fontWeight:800, fontSize:'2rem',
                    letterSpacing:'-0.03em', color:c.color, lineHeight:1, mb:0.75,
                  }}>{c.value}</Typography>
                  <Typography sx={{fontSize:'0.68rem', fontWeight:600, letterSpacing:'0.07em', color:'#4B4C7A', textTransform:'uppercase'}}>{c.title}</Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={2.5} sx={{mb:3}}>
        <Grid item xs={12} lg={8}>
          <motion.div {...fade(0.32)}>
            <Card sx={{borderRadius:'18px'}}>
              <CardContent sx={{p:3}}>
                <Typography sx={{fontFamily:'"Space Grotesk",sans-serif', fontWeight:700, fontSize:'0.95rem', color:'#F1F0FF', mb:0.4}}>Execution Trend</Typography>
                <Typography sx={{fontSize:'0.8rem', color:'#4B4C7A', mb:2.5}}>7-day success vs failure</Typography>
                <ResponsiveContainer width="100%" height={210}>
                  <AreaChart data={chartData} margin={{top:0,right:0,left:-20,bottom:0}}>
                    <defs>
                      <linearGradient id="gs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22C55E" stopOpacity={0.22}/>
                        <stop offset="100%" stopColor="#22C55E" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="gf" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#EF4444" stopOpacity={0.18}/>
                        <stop offset="100%" stopColor="#EF4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(126,58,242,0.07)" vertical={false}/>
                    <XAxis dataKey="name" tick={{fill:'#4B4C7A',fontSize:11}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fill:'#4B4C7A',fontSize:11}} axisLine={false} tickLine={false}/>
                    <Tooltip content={<TooltipBox/>}/>
                    <Area type="monotone" dataKey="success" stroke="#22C55E" strokeWidth={2} fill="url(#gs)" name="Success" dot={false}/>
                    <Area type="monotone" dataKey="failed"  stroke="#EF4444" strokeWidth={2} fill="url(#gf)" name="Failed"  dot={false}/>
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        <Grid item xs={12} lg={4}>
          <motion.div {...fade(0.38)} style={{height:'100%'}}>
            <Card sx={{borderRadius:'18px', height:'100%'}}>
              <CardContent sx={{p:3, height:'100%', display:'flex', flexDirection:'column'}}>
                <Typography sx={{fontFamily:'"Space Grotesk",sans-serif', fontWeight:700, fontSize:'0.95rem', color:'#F1F0FF', mb:0.4}}>Daily Volume</Typography>
                <Typography sx={{fontSize:'0.8rem', color:'#4B4C7A', mb:2.5}}>Runs per day</Typography>
                <Box sx={{flex:1}}>
                  <ResponsiveContainer width="100%" height={210}>
                    <BarChart data={chartData} margin={{top:0,right:0,left:-20,bottom:0}} barSize={9}>
                      <defs>
                        <linearGradient id="barG" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#7E3AF2"/>
                          <stop offset="100%" stopColor="#1A56DB"/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(126,58,242,0.07)" vertical={false}/>
                      <XAxis dataKey="name" tick={{fill:'#4B4C7A',fontSize:11}} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fill:'#4B4C7A',fontSize:11}} axisLine={false} tickLine={false}/>
                      <Tooltip content={<TooltipBox/>}/>
                      <Bar dataKey="success" name="Success" radius={[4,4,0,0]} fill="url(#barG)"/>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* 3D Analytics */}
      <motion.div {...fade(0.45)}>
        <Card sx={{borderRadius:'18px', position:'relative', overflow:'hidden',
          '&::before':{content:'""', position:'absolute', top:0, left:0, right:0, height:'2px',
            background:'linear-gradient(90deg, #7E3AF2, #1A56DB, #06B6D4, #7E3AF2)',
            backgroundSize:'200% auto', animation:'shimmer 3s linear infinite'}}}>
          <CardContent sx={{p:3}}>
            <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center', mb:2.5, flexWrap:'wrap', gap:2}}>
              <Box>
                <Typography sx={{fontFamily:'"Space Grotesk",sans-serif', fontWeight:700, fontSize:'0.95rem', color:'#F1F0FF', mb:0.4}}>Workflow Health Map</Typography>
                <Typography sx={{fontSize:'0.8rem', color:'#4B4C7A'}}>Real-time 3D isometric analysis</Typography>
              </Box>
              <Box sx={{display:'flex', gap:2}}>
                {[{l:'Completed',c:'#22C55E'},{l:'Failed',c:'#EF4444'},{l:'Pending',c:'#F59E0B'}].map(({l,c})=>(
                  <Box key={l} sx={{display:'flex', alignItems:'center', gap:0.75}}>
                    <Box sx={{width:6, height:6, borderRadius:'50%', background:c, boxShadow:`0 0 6px ${c}`}}/>
                    <Typography sx={{fontSize:'0.68rem', color:'#4B4C7A', fontWeight:500}}>{l}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
            <ThreeDAnalytics completed={stats.successfulExecutions} notCompleted={stats.failedExecutions} executed={stats.successfulExecutions+stats.failedExecutions}/>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}
