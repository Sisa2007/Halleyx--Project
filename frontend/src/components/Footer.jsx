import React from 'react';
import { Box, Typography } from '@mui/material';
import HexagonIcon from '@mui/icons-material/Hexagon';

export default function Footer() {
  return (
    <Box component="footer" sx={{
      py:1.5, px:3, borderTop:'1px solid rgba(126,58,242,0.08)',
      display:'flex', justifyContent:'space-between', alignItems:'center',
      background:'rgba(10,10,20,0.75)', backdropFilter:'blur(12px)',
      flexShrink:0, flexWrap:'wrap', gap:1, position:'relative',
    }}>
      <Box sx={{position:'absolute', top:0, left:'8%', right:'8%', height:'1px',
        background:'linear-gradient(90deg, transparent, rgba(126,58,242,0.3), rgba(26,86,219,0.3), transparent)'}}/>
      <Box sx={{display:'flex', alignItems:'center', gap:1}}>
        <HexagonIcon sx={{fontSize:11, color:'#7E3AF2', opacity:0.6}}/>
        <Typography sx={{fontSize:'0.65rem', color:'#4B4C7A', letterSpacing:'0.07em', fontFamily:'"Space Grotesk",sans-serif'}}>
          Hally Platform · Challenge II · 2026
        </Typography>
      </Box>
      <Box sx={{display:'flex', alignItems:'center', gap:2}}>
        <Box sx={{display:'flex', alignItems:'center', gap:0.75}}>
          <Box sx={{width:5, height:5, borderRadius:'50%', background:'#22C55E', boxShadow:'0 0 6px rgba(34,197,94,0.7)', animation:'pulse-dot 2s infinite'}}/>
          <Typography sx={{fontSize:'0.62rem', color:'#4B4C7A', letterSpacing:'0.07em', fontFamily:'"Space Grotesk",sans-serif'}}>All Systems Go</Typography>
        </Box>
        <Typography sx={{fontSize:'0.6rem', color:'#2D2B52', fontFamily:'"Space Grotesk",sans-serif'}}>© {new Date().getFullYear()} halleyx</Typography>
      </Box>
    </Box>
  );
}
