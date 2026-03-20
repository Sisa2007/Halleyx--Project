import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Avatar, Badge, Menu, MenuItem, Divider, Button, Snackbar, Alert, Chip } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useNotifications } from '../context/NotificationContext';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import API from '../services/api';

const PAGE_META = {
  '/dashboard':    { title: 'Dashboard',        sub: 'Overview & analytics' },
  '/dash-builder': { title: 'Dashboard Builder', sub: 'Configure your widgets' },
  '/orders':       { title: 'Customer Orders',   sub: 'Manage order records' },
  '/workflows':    { title: 'Workflows',         sub: 'Automation pipelines' },
  '/logs':         { title: 'Execution Logs',    sub: 'Runtime history' },
};

export default function Navbar() {
  const { notifications, unreadCount, markAsRead, clearAll, latestNotification, clearLatest } = useNotifications();
  const [anchor, setAnchor] = useState(null);
  const [apiOk, setApiOk] = useState(null);
  const location = useLocation();

  const meta = Object.entries(PAGE_META).find(([k]) => location.pathname.startsWith(k))?.[1] || { title: 'Hally', sub: '' };

  useEffect(() => {
    const check = async () => { try { await API.get('/health'); setApiOk(true); } catch { setApiOk(false); } };
    check();
    const iv = setInterval(check, 30000);
    return () => clearInterval(iv);
  }, []);

  const getIcon = (t) => {
    if (t === 'error')   return <ErrorOutlineIcon sx={{fontSize:13, color:'#EF4444'}}/>;
    if (t === 'warning') return <WarningAmberIcon sx={{fontSize:13, color:'#F59E0B'}}/>;
    return <CheckCircleOutlineIcon sx={{fontSize:13, color:'#22C55E'}}/>;
  };

  return (
    <>
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{minHeight:'64px !important', px:3, gap:2}}>

          {/* Page title */}
          <motion.div key={location.pathname} initial={{opacity:0,y:-7}} animate={{opacity:1,y:0}} transition={{duration:0.28}}>
            <Typography sx={{
              fontFamily:'"Space Grotesk",sans-serif', fontWeight:700, fontSize:'1.02rem',
              letterSpacing:'-0.01em', color:'#F1F0FF', lineHeight:1.1,
            }}>{meta.title}</Typography>
            {meta.sub && <Typography sx={{fontSize:'0.68rem', color:'#4B4C7A', mt:0.1}}>{meta.sub}</Typography>}
          </motion.div>

          <Box sx={{flexGrow:1}}/>

          {/* API status chip */}
          {apiOk !== null && (
            <Box sx={{
              display:'flex', alignItems:'center', gap:0.75,
              px:1.5, py:0.5, borderRadius:'20px',
              border:`1px solid ${apiOk ? 'rgba(34,197,94,0.22)' : 'rgba(239,68,68,0.22)'}`,
              background: apiOk ? 'rgba(34,197,94,0.07)' : 'rgba(239,68,68,0.07)',
            }}>
              <FiberManualRecordIcon sx={{
                fontSize:7, color: apiOk ? '#22C55E' : '#EF4444',
                filter:`drop-shadow(0 0 4px ${apiOk ? 'rgba(34,197,94,0.8)' : 'rgba(239,68,68,0.8)'})`,
                animation: apiOk ? 'pulse-dot 2s infinite' : 'none',
              }}/>
              <Typography sx={{fontSize:'0.65rem', fontWeight:600, color: apiOk ? '#22C55E' : '#EF4444', letterSpacing:'0.05em'}}>
                {apiOk ? 'API Online' : 'API Offline'}
              </Typography>
            </Box>
          )}

          {/* Notifications */}
          <IconButton onClick={e=>setAnchor(e.currentTarget)} sx={{
            border:'1px solid rgba(126,58,242,0.14)', borderRadius:'10px', width:38, height:38, color:'#4B4C7A',
            '&:hover':{color:'#A78BFA', borderColor:'rgba(126,58,242,0.35)', background:'rgba(126,58,242,0.09)'},
          }}>
            <Badge badgeContent={unreadCount} sx={{'& .MuiBadge-badge':{
              background:'linear-gradient(135deg, #7E3AF2, #1A56DB)',
              color:'#fff', fontSize:'0.58rem', fontWeight:800, minWidth:15, height:15,
            }}}>
              <NotificationsIcon sx={{fontSize:18}}/>
            </Badge>
          </IconButton>

          {/* Avatar */}
          <motion.div whileHover={{scale:1.05}}>
            <Avatar sx={{
              width:36, height:36, fontSize:'0.78rem', fontWeight:700,
              background:'linear-gradient(135deg, #7E3AF2, #1A56DB)',
              border:'2px solid rgba(126,58,242,0.35)',
              boxShadow:'0 0 14px rgba(126,58,242,0.4)', cursor:'pointer',
            }}>HA</Avatar>
          </motion.div>
        </Toolbar>
      </AppBar>

      {/* Notification Panel */}
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={()=>setAnchor(null)}
        PaperProps={{sx:{width:340, maxHeight:420, mt:1}}}>
        <Box sx={{px:2.5, py:2, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <Typography sx={{fontFamily:'"Space Grotesk",sans-serif', fontWeight:700, fontSize:'0.88rem', color:'#F1F0FF'}}>
            Notifications
            {unreadCount > 0 && (
              <Box component="span" sx={{ml:1.5, px:0.8, py:0.15, background:'rgba(126,58,242,0.18)', border:'1px solid rgba(126,58,242,0.3)', borderRadius:'20px', fontSize:'0.62rem', color:'#A78BFA', fontWeight:800}}>{unreadCount}</Box>
            )}
          </Typography>
          {notifications.length > 0 && (
            <Button size="small" onClick={clearAll} sx={{fontSize:'0.68rem', color:'#4B4C7A', p:0, minWidth:0, '&:hover':{color:'#A78BFA'}}}>Clear all</Button>
          )}
        </Box>
        <Divider sx={{borderColor:'rgba(126,58,242,0.08)'}}/>
        {notifications.length === 0
          ? <Box sx={{py:5, textAlign:'center'}}><Typography sx={{fontSize:'0.85rem', color:'#4B4C7A', fontStyle:'italic'}}>No notifications yet</Typography></Box>
          : notifications.map(n => (
            <MenuItem key={n.id} onClick={()=>{markAsRead(n.id); setAnchor(null);}} sx={{
              px:2.5, py:1.5, gap:1.5,
              borderBottom:'1px solid rgba(126,58,242,0.05)',
              background: n.read ? 'transparent' : 'rgba(126,58,242,0.04)',
              '&:hover':{background:'rgba(126,58,242,0.07)'},
            }}>
              <Box sx={{flexShrink:0, mt:0.2}}>{getIcon(n.type)}</Box>
              <Box sx={{flex:1, overflow:'hidden'}}>
                <Typography sx={{fontSize:'0.78rem', fontWeight: n.read ? 500 : 700, color:'#F1F0FF', mb:0.2}}>{n.title}</Typography>
                <Typography sx={{fontSize:'0.72rem', color:'#4B4C7A'}}>{n.message}</Typography>
              </Box>
              <Typography sx={{fontSize:'0.62rem', color:'#4B4C7A', flexShrink:0}}>
                {new Date(n.timestamp).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
              </Typography>
            </MenuItem>
          ))
        }
      </Menu>

      {/* Toast */}
      <Snackbar open={Boolean(latestNotification)} autoHideDuration={4500} onClose={clearLatest} anchorOrigin={{vertical:'top', horizontal:'right'}} sx={{mt:9}}>
        <Alert onClose={clearLatest} severity={latestNotification?.type||'info'} variant="outlined" sx={{
          background:'#13122A', borderColor:'rgba(126,58,242,0.3)', color:'#F1F0FF',
          boxShadow:'0 8px 32px rgba(0,0,0,0.5)',
          '& .MuiAlert-icon':{color:'#A78BFA'},
        }}>
          <Typography sx={{fontWeight:700, fontSize:'0.82rem', mb:0.25}}>{latestNotification?.title}</Typography>
          <Typography sx={{fontSize:'0.8rem', color:'#A5B4FC'}}>{latestNotification?.message}</Typography>
        </Alert>
      </Snackbar>
    </>
  );
}
