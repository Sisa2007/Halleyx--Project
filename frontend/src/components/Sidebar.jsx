import React, { useState } from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Typography, IconButton, Tooltip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import GridViewIcon from '@mui/icons-material/GridView';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MenuIcon from '@mui/icons-material/Menu';
import HexagonIcon from '@mui/icons-material/Hexagon';

const EXPANDED = 244;
const COLLAPSED = 66;

const NAV = [
  { text: 'Dashboard',      icon: <DashboardIcon sx={{fontSize:18}}/>,    path: '/dashboard',       badge: null },
  { text: 'Dash Builder',   icon: <GridViewIcon sx={{fontSize:18}}/>,      path: '/dash-builder',    badge: 'NEW' },
  { text: 'Customer Orders',icon: <ShoppingCartIcon sx={{fontSize:18}}/>,  path: '/orders',          badge: null },
  { text: 'Workflows',      icon: <AccountTreeIcon sx={{fontSize:18}}/>,   path: '/workflows',       badge: null },
  { text: 'Exec Logs',      icon: <ListAltIcon sx={{fontSize:18}}/>,       path: '/logs',            badge: null },
];

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <Box component="aside" sx={{
      width: open ? EXPANDED : COLLAPSED, flexShrink: 0, height: '100vh',
      display: 'flex', flexDirection: 'column',
      background: '#0F0E1E',
      borderRight: '1px solid rgba(126,58,242,0.10)',
      transition: 'width 0.26s cubic-bezier(0.4,0,0.2,1)',
      overflow: 'hidden', position: 'relative', zIndex: 20,
    }}>

      {/* Subtle gradient overlay */}
      <Box sx={{
        position:'absolute', top:0, left:0, right:0, height:200, pointerEvents:'none',
        background:'radial-gradient(ellipse 120% 60% at 50% 0%, rgba(126,58,242,0.08) 0%, transparent 70%)',
      }}/>

      {/* Brand */}
      <Box sx={{
        height:66, display:'flex', alignItems:'center',
        justifyContent: open ? 'space-between' : 'center',
        px: open ? 2.5 : 1,
        borderBottom: '1px solid rgba(126,58,242,0.08)',
        flexShrink: 0, position:'relative', zIndex:1,
      }}>
        <AnimatePresence>
          {open && (
            <motion.div initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-10}} transition={{duration:0.18}}>
              <Box sx={{display:'flex',alignItems:'center',gap:1.25}}>
                <Box sx={{
                  width:32, height:32, borderRadius:'9px',
                  background:'linear-gradient(135deg, #7E3AF2, #1A56DB)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  boxShadow:'0 4px 14px rgba(126,58,242,0.5)',
                }}>
                  <HexagonIcon sx={{fontSize:18, color:'#fff'}}/>
                </Box>
                <Box>
                  <Typography sx={{
                    fontFamily:'"Space Grotesk",sans-serif', fontWeight:700, fontSize:'0.98rem',
                    background:'linear-gradient(135deg, #A78BFA 0%, #818CF8 50%, #38BDF8 100%)',
                    WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
                    letterSpacing:'-0.01em', lineHeight:1.1,
                  }}>HALLY</Typography>
                  <Typography sx={{fontSize:'0.58rem', color:'#4B4C7A', letterSpacing:'0.12em', textTransform:'uppercase', lineHeight:1}}>
                    Platform
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
        {!open && (
          <Box sx={{
            width:32, height:32, borderRadius:'9px',
            background:'linear-gradient(135deg, #7E3AF2, #1A56DB)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 4px 14px rgba(126,58,242,0.5)',
          }}>
            <HexagonIcon sx={{fontSize:18, color:'#fff'}}/>
          </Box>
        )}
        <IconButton onClick={()=>setOpen(!open)} size="small" sx={{
          color:'#4B4C7A', borderRadius:'8px', width:28, height:28,
          border:'1px solid rgba(126,58,242,0.12)',
          '&:hover':{color:'#A78BFA', borderColor:'rgba(126,58,242,0.35)', background:'rgba(126,58,242,0.08)'},
        }}>
          {open ? <ChevronLeftIcon sx={{fontSize:15}}/> : <MenuIcon sx={{fontSize:15}}/>}
        </IconButton>
      </Box>

      {/* Section label */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.15,delay:0.05}}>
            <Typography sx={{
              fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.15em', color:'#4B4C7A',
              px:2.5, pt:2.5, pb:1, textTransform:'uppercase', fontFamily:'"Space Grotesk",sans-serif',
            }}>Navigation</Typography>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav Items */}
      <List sx={{px:1, flexGrow:1, pt: open ? 0 : 2}}>
        {NAV.map((item, idx) => {
          const active = isActive(item.path);
          const btn = (
            <motion.div key={item.text} initial={{opacity:0,x:-12}} animate={{opacity:1,x:0}} transition={{delay:idx*0.05, duration:0.25}}>
              <ListItem button onClick={()=>navigate(item.path)} sx={{
                mb:0.5, borderRadius:'10px',
                justifyContent: open ? 'initial' : 'center',
                px: open ? 1.5 : 0, py:0.9, minHeight:42, position:'relative',
                background: active
                  ? 'linear-gradient(135deg, rgba(126,58,242,0.20) 0%, rgba(26,86,219,0.10) 100%)'
                  : 'transparent',
                border: active ? '1px solid rgba(126,58,242,0.28)' : '1px solid transparent',
                transition:'all 0.18s ease',
                '&:hover': {
                  background: active
                    ? 'linear-gradient(135deg, rgba(126,58,242,0.25) 0%, rgba(26,86,219,0.14) 100%)'
                    : 'rgba(126,58,242,0.06)',
                  border:'1px solid rgba(126,58,242,0.18)',
                },
              }}>
                {active && (
                  <Box sx={{
                    position:'absolute', left:0, top:'22%', bottom:'22%',
                    width:3, borderRadius:'0 3px 3px 0',
                    background:'linear-gradient(180deg, #7E3AF2, #1A56DB)',
                    boxShadow:'0 0 10px rgba(126,58,242,0.6)',
                  }}/>
                )}
                <ListItemIcon sx={{
                  minWidth:0, mr: open ? 1.5 : 'auto',
                  color: active ? '#A78BFA' : '#4B4C7A',
                  justifyContent:'center', transition:'color 0.18s',
                  filter: active ? 'drop-shadow(0 0 5px rgba(167,139,250,0.5))' : 'none',
                }}>{item.icon}</ListItemIcon>
                <AnimatePresence>
                  {open && (
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.14}} style={{overflow:'hidden', flex:1, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                      <ListItemText primary={item.text} sx={{m:0, whiteSpace:'nowrap'}}
                        primaryTypographyProps={{
                          fontFamily:'"Plus Jakarta Sans",sans-serif',
                          fontWeight: active ? 700 : 500, fontSize:'0.82rem',
                          color: active ? '#EDE9FE' : '#6366F1',
                        }}/>
                      {item.badge && (
                        <Box sx={{
                          px:0.8, py:0.1, borderRadius:'6px', fontSize:'0.55rem', fontWeight:800, letterSpacing:'0.05em',
                          background:'linear-gradient(135deg, #7E3AF2, #1A56DB)',
                          color:'#fff', lineHeight:1.5, ml:0.5,
                        }}>{item.badge}</Box>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </ListItem>
            </motion.div>
          );
          return open ? btn : <Tooltip key={item.text} title={item.text} placement="right" arrow>{btn}</Tooltip>;
        })}
      </List>

      {/* Bottom version */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <Box sx={{px:2.5, py:2, borderTop:'1px solid rgba(126,58,242,0.07)'}}>
              <Box sx={{
                display:'flex', alignItems:'center', gap:1,
                p:1.25, borderRadius:'10px',
                background:'linear-gradient(135deg, rgba(126,58,242,0.08), rgba(26,86,219,0.05))',
                border:'1px solid rgba(126,58,242,0.12)',
              }}>
                <Box sx={{width:6, height:6, borderRadius:'50%', background:'#22C55E', boxShadow:'0 0 6px rgba(34,197,94,0.7)', animation:'pulse-dot 2s infinite'}}/>
                <Typography sx={{fontSize:'0.65rem', color:'#4B4C7A', fontFamily:'"Space Grotesk",sans-serif', letterSpacing:'0.06em'}}>
                  API Connected
                </Typography>
              </Box>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
