import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Grid, IconButton, Tooltip,
  Drawer, TextField, Select, MenuItem, FormControl, InputLabel, Checkbox,
  FormControlLabel, Divider, Chip, Snackbar, Alert, InputAdornment
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import AreaChartIcon from '@mui/icons-material/Addchart';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import TableChartIcon from '@mui/icons-material/TableChart';
import SpeedIcon from '@mui/icons-material/Speed';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import SaveIcon from '@mui/icons-material/Save';
import GridViewIcon from '@mui/icons-material/GridView';
import CloseIcon from '@mui/icons-material/Close';
import PreviewIcon from '@mui/icons-material/Preview';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Legend } from 'recharts';

/* ──── Widget Catalog ────────────────────────────────────────────── */
const CATALOG = [
  { category:'Charts',   items:[
    { type:'bar',     label:'Bar Chart',     icon:<BarChartIcon/>,    w:5, h:5 },
    { type:'line',    label:'Line Chart',    icon:<ShowChartIcon/>,   w:5, h:5 },
    { type:'pie',     label:'Pie Chart',     icon:<PieChartIcon/>,    w:4, h:4 },
    { type:'area',    label:'Area Chart',    icon:<AreaChartIcon/>,   w:5, h:5 },
    { type:'scatter', label:'Scatter Plot',  icon:<ScatterPlotIcon/>, w:5, h:5 },
  ]},
  { category:'Tables',  items:[{ type:'table', label:'Table',     icon:<TableChartIcon/>, w:4, h:4 }] },
  { category:'KPIs',    items:[{ type:'kpi',   label:'KPI Value', icon:<SpeedIcon/>,      w:2, h:2 }] },
];

const DATE_FILTERS = ['All time','Today','Last 7 Days','Last 30 Days','Last 90 Days'];
const CHART_AXES   = ['Product','Quantity','Unit price','Total amount','Status','Created by','Duration'];
const PIE_DATA_OPTS= ['Product','Quantity','Unit price','Total amount','Status','Created by'];
const METRICS      = ['Customer ID','Customer name','Email id','Address','Order date','Product','Created by','Status','Total amount','Unit price','Quantity'];
const AGGREGATIONS = ['Sum','Average','Count'];
const DATA_FORMATS = ['Number','Currency'];
const TABLE_COLS   = ['Customer ID','Customer name','Email id','Phone number','Address','Order ID','Order date','Product','Quantity','Unit price','Total amount','Status','Created by'];
const SORT_OPTS    = ['Ascending','Descending','Order date'];
const PAGE_SIZES   = ['5','10','15'];
const CHART_COLORS = ['#7E3AF2','#1A56DB','#22C55E','#EF4444','#F59E0B','#06B6D4','#EC4899'];
const LS_DASH      = 'hally_dashboard';

/* Demo chart data */
const DEMO_BAR = [{name:'Jan',v:40},{name:'Feb',v:65},{name:'Mar',v:48},{name:'Apr',v:72},{name:'May',v:55}];
const DEMO_PIE = [{name:'Fiber 300',value:35},{name:'5G Mobile',value:25},{name:'Fiber 1G',value:20},{name:'Business',value:12},{name:'VoIP',value:8}];
const PIE_CLR  = ['#7E3AF2','#1A56DB','#22C55E','#F59E0B','#EF4444'];

const uid = () => Math.random().toString(36).slice(2,10);

const defaultCfg = (type, label, w, h) => ({
  id: uid(), type, label, w, h, row: null,
  title:'Untitled', description:'',
  // chart
  xAxis:'Product', yAxis:'Total amount', chartColor:'#7E3AF2', showDataLabel:false,
  pieData:'Product', showLegend:true,
  // kpi
  metric:'Total amount', aggregation:'Sum', dataFormat:'Number', decimalPrecision:0,
  // table
  columns:['Customer name','Product','Total amount','Status'], sortBy:'', pagination:'10', applyFilter:false,
  filters:[],
  // table styling
  fontSize:14, headerBg:'#54bd95',
});

/* ──── Widget Preview (mini render) ─────────────────────────────── */
function WidgetPreview({ cfg }) {
  if (cfg.type==='kpi') return (
    <Box sx={{textAlign:'center',py:1}}>
      <Typography sx={{fontSize:'2.2rem',fontWeight:800,color:CHART_COLORS[0],fontFamily:'"Space Grotesk",sans-serif',lineHeight:1}}>
        {cfg.dataFormat==='Currency'?'$':''}1,284
      </Typography>
      <Typography sx={{fontSize:'0.7rem',color:'#4B4C7A',mt:0.5}}>{cfg.metric} · {cfg.aggregation}</Typography>
    </Box>
  );
  if (cfg.type==='pie') return (
    <ResponsiveContainer width="100%" height={140}>
      <PieChart>
        <Pie data={DEMO_PIE} cx="50%" cy="50%" outerRadius={55} dataKey="value" label={cfg.showDataLabel}>
          {DEMO_PIE.map((_,i)=><Cell key={i} fill={PIE_CLR[i%PIE_CLR.length]}/>)}
        </Pie>
        {cfg.showLegend && <Legend iconSize={8} wrapperStyle={{fontSize:'0.68rem'}}/>}
        <RTooltip/>
      </PieChart>
    </ResponsiveContainer>
  );
  if (cfg.type==='table') return (
    <Box sx={{overflow:'auto', maxHeight:120}}>
      <table style={{width:'100%', borderCollapse:'collapse', fontSize:`${Math.min(cfg.fontSize,14)}px`}}>
        <thead>
          <tr>{cfg.columns.slice(0,4).map(c=><th key={c} style={{padding:'4px 8px', background:cfg.headerBg, color:'#fff', fontWeight:700, textAlign:'left', fontSize:'0.65rem'}}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {[0,1].map(r=><tr key={r}>{cfg.columns.slice(0,4).map(c=><td key={c} style={{padding:'4px 8px', borderBottom:'1px solid rgba(126,58,242,0.07)', color:'#A5B4FC', fontSize:'0.72rem'}}>—</td>)}</tr>)}
        </tbody>
      </table>
    </Box>
  );
  if (cfg.type==='scatter') return (
    <ResponsiveContainer width="100%" height={140}>
      <ScatterChart margin={{top:0,right:0,bottom:0,left:-20}}>
        <CartesianGrid stroke="rgba(126,58,242,0.07)" strokeDasharray="3 3"/>
        <XAxis type="number" dataKey="x" tick={{fill:'#4B4C7A',fontSize:10}} axisLine={false} tickLine={false}/>
        <YAxis type="number" dataKey="y" tick={{fill:'#4B4C7A',fontSize:10}} axisLine={false} tickLine={false}/>
        <RTooltip/>
        <Scatter data={[{x:10,y:30},{x:30,y:60},{x:50,y:40},{x:70,y:80},{x:90,y:55}]} fill={cfg.chartColor}/>
      </ScatterChart>
    </ResponsiveContainer>
  );
  if (cfg.type==='line' || cfg.type==='area') {
    const C = cfg.type==='area' ? AreaChart : LineChart;
    return (
      <ResponsiveContainer width="100%" height={140}>
        <C data={DEMO_BAR} margin={{top:0,right:0,bottom:0,left:-20}}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(126,58,242,0.07)" vertical={false}/>
          <XAxis dataKey="name" tick={{fill:'#4B4C7A',fontSize:10}} axisLine={false} tickLine={false}/>
          <YAxis tick={{fill:'#4B4C7A',fontSize:10}} axisLine={false} tickLine={false}/>
          <RTooltip/>
          {cfg.type==='area'
            ? <Area type="monotone" dataKey="v" stroke={cfg.chartColor} fill={cfg.chartColor+'30'} strokeWidth={2} label={cfg.showDataLabel?{fill:'#F1F0FF',fontSize:10}:false}/>
            : <Line  type="monotone" dataKey="v" stroke={cfg.chartColor} strokeWidth={2} dot={{r:3,fill:cfg.chartColor}} label={cfg.showDataLabel?{fill:'#F1F0FF',fontSize:10}:false}/>
          }
        </C>
      </ResponsiveContainer>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={140}>
      <BarChart data={DEMO_BAR} margin={{top:0,right:0,bottom:0,left:-20}} barSize={16}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(126,58,242,0.07)" vertical={false}/>
        <XAxis dataKey="name" tick={{fill:'#4B4C7A',fontSize:10}} axisLine={false} tickLine={false}/>
        <YAxis tick={{fill:'#4B4C7A',fontSize:10}} axisLine={false} tickLine={false}/>
        <RTooltip/>
        <Bar dataKey="v" fill={cfg.chartColor} radius={[4,4,0,0]} label={cfg.showDataLabel?{position:'top',fill:'#F1F0FF',fontSize:10}:false}/>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ──── Settings Panel ──────────────────────────────────────────── */
function SettingsPanel({ widget, onUpdate, onClose }) {
  const [cfg, setCfg] = useState({...widget});
  const set = (k,v) => setCfg(p=>({...p,[k]:v}));
  const save = () => { onUpdate(cfg); onClose(); };

  const isChart = ['bar','line','area','scatter'].includes(cfg.type);
  const isNumeric = (m) => ['Total amount','Unit price','Quantity'].includes(m);

  return (
    <Box sx={{display:'flex', flexDirection:'column', height:'100%'}}>
      {/* Header */}
      <Box sx={{px:2.5, py:2, borderBottom:'1px solid rgba(126,58,242,0.10)', display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(10,10,20,0.5)', flexShrink:0}}>
        <Box>
          <Typography sx={{fontFamily:'"Space Grotesk",sans-serif', fontWeight:700, fontSize:'0.9rem', color:'#F1F0FF'}}>Widget Settings</Typography>
          <Typography sx={{fontSize:'0.68rem', color:'#4B4C7A'}}>{cfg.label}</Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{color:'#4B4C7A','&:hover':{color:'#A78BFA'}}}>
          <CloseIcon sx={{fontSize:16}}/>
        </IconButton>
      </Box>

      {/* Body */}
      <Box sx={{flex:1, overflowY:'auto', px:2.5, py:2, display:'flex', flexDirection:'column', gap:2}}>

        {/* General */}
        <TextField label="Widget Title" value={cfg.title} size="small" fullWidth onChange={e=>set('title',e.target.value)}/>
        <TextField label="Widget Type" value={cfg.label} size="small" fullWidth inputProps={{readOnly:true}} sx={{opacity:0.65}}/>
        <TextField label="Description" value={cfg.description} size="small" fullWidth multiline rows={2} onChange={e=>set('description',e.target.value)}/>

        <Divider sx={{borderColor:'rgba(126,58,242,0.10)'}}>
          <Typography sx={{fontSize:'0.65rem', color:'#7E3AF2', fontWeight:700, letterSpacing:'0.1em', px:1}}>WIDGET SIZE</Typography>
        </Divider>

        <Box sx={{display:'flex', gap:2}}>
          <TextField label="Width (Columns)" value={cfg.w} size="small" type="number" sx={{flex:1}}
            onChange={e=>set('w',Math.max(1,Number(e.target.value)))} inputProps={{min:1}}/>
          <TextField label="Height (Rows)" value={cfg.h} size="small" type="number" sx={{flex:1}}
            onChange={e=>set('h',Math.max(1,Number(e.target.value)))} inputProps={{min:1}}/>
        </Box>

        <Divider sx={{borderColor:'rgba(126,58,242,0.10)'}}>
          <Typography sx={{fontSize:'0.65rem', color:'#7E3AF2', fontWeight:700, letterSpacing:'0.1em', px:1}}>DATA SETTINGS</Typography>
        </Divider>

        {/* KPI */}
        {cfg.type==='kpi' && (<>
          <FormControl size="small" fullWidth>
            <InputLabel>Select Metric</InputLabel>
            <Select label="Select Metric" value={cfg.metric} onChange={e=>set('metric',e.target.value)}>
              {METRICS.map(m=><MenuItem key={m} value={m}>{m}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel>Aggregation</InputLabel>
            <Select label="Aggregation" value={cfg.aggregation} disabled={!isNumeric(cfg.metric)} onChange={e=>set('aggregation',e.target.value)}>
              {AGGREGATIONS.map(a=><MenuItem key={a} value={a}>{a}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel>Data Format</InputLabel>
            <Select label="Data Format" value={cfg.dataFormat} onChange={e=>set('dataFormat',e.target.value)}>
              {DATA_FORMATS.map(d=><MenuItem key={d} value={d}>{d}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="Decimal Precision" value={cfg.decimalPrecision} size="small" type="number" fullWidth
            onChange={e=>set('decimalPrecision',Math.max(0,Number(e.target.value)))} inputProps={{min:0}}/>
        </>)}

        {/* Charts (bar/line/area/scatter) */}
        {isChart && (<>
          <FormControl size="small" fullWidth>
            <InputLabel>X-Axis Data</InputLabel>
            <Select label="X-Axis Data" value={cfg.xAxis} onChange={e=>set('xAxis',e.target.value)}>
              {CHART_AXES.map(a=><MenuItem key={a} value={a}>{a}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel>Y-Axis Data</InputLabel>
            <Select label="Y-Axis Data" value={cfg.yAxis} onChange={e=>set('yAxis',e.target.value)}>
              {CHART_AXES.map(a=><MenuItem key={a} value={a}>{a}</MenuItem>)}
            </Select>
          </FormControl>
          <Divider sx={{borderColor:'rgba(126,58,242,0.10)'}}>
            <Typography sx={{fontSize:'0.65rem', color:'#7E3AF2', fontWeight:700, letterSpacing:'0.1em', px:1}}>STYLING</Typography>
          </Divider>
          <Box>
            <Typography sx={{fontSize:'0.75rem', fontWeight:600, color:'#A5B4FC', mb:1}}>Chart Color</Typography>
            <Box sx={{display:'flex', gap:1, flexWrap:'wrap'}}>
              {CHART_COLORS.map(c=>(
                <Box key={c} onClick={()=>set('chartColor',c)} sx={{
                  width:26, height:26, borderRadius:'50%', background:c, cursor:'pointer',
                  border: cfg.chartColor===c ? '3px solid #fff' : '2px solid transparent',
                  boxShadow: cfg.chartColor===c ? `0 0 10px ${c}` : 'none',
                  transition:'all 0.15s',
                }}/>
              ))}
              <Box sx={{display:'flex', alignItems:'center', gap:1, mt:0.5}}>
                <input type="color" value={cfg.chartColor} onChange={e=>set('chartColor',e.target.value)}
                  style={{width:26,height:26,border:'none',background:'none',cursor:'pointer',borderRadius:'50%'}}/>
                <TextField value={cfg.chartColor} size="small" sx={{width:110,'& input':{fontSize:'0.8rem',fontFamily:'monospace'}}}
                  onChange={e=>{ if(/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) set('chartColor',e.target.value); }}/>
              </Box>
            </Box>
          </Box>
          <FormControlLabel control={<Checkbox checked={cfg.showDataLabel} size="small" onChange={e=>set('showDataLabel',e.target.checked)}
            sx={{'& .MuiSvgIcon-root':{color:'#7E3AF2'}}}/>} label={<Typography sx={{fontSize:'0.82rem'}}>Show Data Labels</Typography>}/>
        </>)}

        {/* Pie */}
        {cfg.type==='pie' && (<>
          <FormControl size="small" fullWidth>
            <InputLabel>Chart Data</InputLabel>
            <Select label="Chart Data" value={cfg.pieData} onChange={e=>set('pieData',e.target.value)}>
              {PIE_DATA_OPTS.map(a=><MenuItem key={a} value={a}>{a}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControlLabel control={<Checkbox checked={cfg.showLegend} size="small" onChange={e=>set('showLegend',e.target.checked)}
            sx={{'& .MuiSvgIcon-root':{color:'#7E3AF2'}}}/>} label={<Typography sx={{fontSize:'0.82rem'}}>Show Legend</Typography>}/>
        </>)}

        {/* Table */}
        {cfg.type==='table' && (<>
          <FormControl size="small" fullWidth>
            <InputLabel>Choose Columns</InputLabel>
            <Select label="Choose Columns" multiple value={cfg.columns}
              onChange={e=>set('columns',typeof e.target.value==='string'?e.target.value.split(','):e.target.value)}
              renderValue={sel=><Box sx={{display:'flex',flexWrap:'wrap',gap:0.5}}>{sel.map(v=><Chip key={v} label={v} size="small" sx={{fontSize:'0.65rem'}}/>)}</Box>}>
              {TABLE_COLS.map(c=><MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel>Sort By</InputLabel>
            <Select label="Sort By" value={cfg.sortBy} onChange={e=>set('sortBy',e.target.value)}>
              <MenuItem value="">None</MenuItem>
              {SORT_OPTS.map(s=><MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel>Pagination</InputLabel>
            <Select label="Pagination" value={cfg.pagination} onChange={e=>set('pagination',e.target.value)}>
              {PAGE_SIZES.map(p=><MenuItem key={p} value={p}>{p} rows</MenuItem>)}
            </Select>
          </FormControl>
          <FormControlLabel control={<Checkbox checked={cfg.applyFilter} size="small" onChange={e=>set('applyFilter',e.target.checked)}
            sx={{'& .MuiSvgIcon-root':{color:'#7E3AF2'}}}/>} label={<Typography sx={{fontSize:'0.82rem'}}>Apply Filter</Typography>}/>
          {cfg.applyFilter && (
            <Box sx={{p:1.5, borderRadius:'10px', background:'rgba(126,58,242,0.06)', border:'1px solid rgba(126,58,242,0.14)'}}>
              <Typography sx={{fontSize:'0.75rem', color:'#A5B4FC', mb:1}}>Filters active. Multiple filters can be added.</Typography>
              <Button size="small" variant="outlined" sx={{fontSize:'0.68rem', borderRadius:'7px'}}
                onClick={()=>set('filters',[...cfg.filters,{field:'',value:''}])}>+ Add Filter</Button>
              {cfg.filters.map((f,i)=>(
                <Box key={i} sx={{display:'flex', gap:1, mt:1, alignItems:'center'}}>
                  <FormControl size="small" sx={{flex:1}}>
                    <Select value={f.field} onChange={e=>{const fs=[...cfg.filters];fs[i].field=e.target.value;set('filters',fs);}}>
                      <MenuItem value="">Field</MenuItem>
                      {TABLE_COLS.map(c=><MenuItem key={c} value={c}>{c}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <TextField size="small" value={f.value} sx={{flex:1}}
                    onChange={e=>{const fs=[...cfg.filters];fs[i].value=e.target.value;set('filters',fs);}} placeholder="Value"/>
                  <IconButton size="small" onClick={()=>set('filters',cfg.filters.filter((_,x)=>x!==i))} sx={{color:'#EF4444'}}>
                    <CloseIcon sx={{fontSize:13}}/>
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
          <Divider sx={{borderColor:'rgba(126,58,242,0.10)'}}>
            <Typography sx={{fontSize:'0.65rem', color:'#7E3AF2', fontWeight:700, letterSpacing:'0.1em', px:1}}>STYLING</Typography>
          </Divider>
          <TextField label="Font Size (12–18)" value={cfg.fontSize} size="small" type="number" fullWidth
            onChange={e=>set('fontSize',Math.min(18,Math.max(12,Number(e.target.value))))} inputProps={{min:12,max:18}}/>
          <Box>
            <Typography sx={{fontSize:'0.75rem', fontWeight:600, color:'#A5B4FC', mb:1}}>Header Background</Typography>
            <Box sx={{display:'flex', alignItems:'center', gap:1.5}}>
              <input type="color" value={cfg.headerBg} onChange={e=>set('headerBg',e.target.value)}
                style={{width:32,height:32,border:'none',background:'none',cursor:'pointer',borderRadius:'8px'}}/>
              <TextField value={cfg.headerBg} size="small" sx={{width:120,'& input':{fontSize:'0.82rem',fontFamily:'monospace'}}}
                onChange={e=>{ if(/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) set('headerBg',e.target.value); }}/>
            </Box>
          </Box>
        </>)}
      </Box>

      {/* Footer */}
      <Box sx={{px:2.5, py:2, borderTop:'1px solid rgba(126,58,242,0.10)', display:'flex', gap:1, flexShrink:0}}>
        <Button onClick={onClose} sx={{flex:1, fontSize:'0.78rem', color:'#4B4C7A', border:'1px solid rgba(126,58,242,0.14)', borderRadius:'9px'}}>Cancel</Button>
        <Button onClick={save} variant="contained" sx={{flex:1, fontSize:'0.78rem', borderRadius:'9px'}}>Apply</Button>
      </Box>
    </Box>
  );
}

/* ──── Main Builder ────────────────────────────────────────────── */
export default function DashboardBuilder() {
  const [widgets, setWidgets] = useState(()=>{ try{return JSON.parse(localStorage.getItem(LS_DASH)||'[]');}catch{return [];} });
  const [dateFilter, setDateFilter] = useState('All time');
  const [activeSettings, setActiveSettings] = useState(null);
  const [draggingType, setDraggingType] = useState(null);
  const [draggingWidget, setDraggingWidget] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [snack, setSnack] = useState({open:false, msg:'', sev:'success'});
  const canvasRef = useRef(null);

  const save = () => {
    localStorage.setItem(LS_DASH, JSON.stringify(widgets));
    setSnack({open:true, msg:'Dashboard configuration saved!', sev:'success'});
  };

  const addWidget = useCallback((type, label, w, h) => {
    setWidgets(p=>[...p, defaultCfg(type, label, w, h)]);
  }, []);

  const removeWidget = (id) => {
    setWidgets(p=>p.filter(w=>w.id!==id));
    if(activeSettings===id) setActiveSettings(null);
  };

  const updateWidget = (cfg) => {
    setWidgets(p=>p.map(w=>w.id===cfg.id ? cfg : w));
  };

  /* Drag from catalog */
  const handleCatalogDrag = (type, label, w, h) => setDraggingType({type,label,w,h});

  const handleCanvasDrop = (e) => {
    e.preventDefault();
    if(draggingType) { addWidget(draggingType.type, draggingType.label, draggingType.w, draggingType.h); }
    setDraggingType(null); setDropTarget(null);
  };

  const activeWidget = widgets.find(w=>w.id===activeSettings);

  const iconFor = (type) => {
    const m = {bar:<BarChartIcon sx={{fontSize:14}}/>, line:<ShowChartIcon sx={{fontSize:14}}/>, pie:<PieChartIcon sx={{fontSize:14}}/>,
      area:<AreaChartIcon sx={{fontSize:14}}/>, scatter:<ScatterPlotIcon sx={{fontSize:14}}/>, table:<TableChartIcon sx={{fontSize:14}}/>, kpi:<SpeedIcon sx={{fontSize:14}}/>};
    return m[type]||null;
  };

  return (
    <Box sx={{display:'flex', height:'calc(100vh - 130px)', overflow:'hidden', position:'relative', zIndex:1}}>

      {/* Left Panel — Widget Catalog */}
      <Box sx={{
        width:220, flexShrink:0, background:'#0F0E1E', borderRight:'1px solid rgba(126,58,242,0.10)',
        display:'flex', flexDirection:'column', overflow:'hidden',
      }}>
        <Box sx={{px:2, py:2, borderBottom:'1px solid rgba(126,58,242,0.08)', flexShrink:0}}>
          <Typography sx={{fontFamily:'"Space Grotesk",sans-serif', fontWeight:700, fontSize:'0.82rem', color:'#F1F0FF', mb:0.3}}>Widget Library</Typography>
          <Typography sx={{fontSize:'0.68rem', color:'#4B4C7A'}}>Drag to canvas to add</Typography>
        </Box>
        <Box sx={{flex:1, overflowY:'auto', px:1.5, py:1.5}}>
          {CATALOG.map(cat=>(
            <Box key={cat.category} sx={{mb:2}}>
              <Typography sx={{fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.12em', color:'#4B4C7A', textTransform:'uppercase', mb:1, px:0.5}}>
                {cat.category}
              </Typography>
              {cat.items.map(item=>(
                <Box key={item.type}
                  draggable
                  onDragStart={()=>handleCatalogDrag(item.type,item.label,item.w,item.h)}
                  onDragEnd={()=>setDraggingType(null)}
                  onClick={()=>addWidget(item.type,item.label,item.w,item.h)}
                  sx={{
                    display:'flex', alignItems:'center', gap:1.25, px:1.5, py:1, mb:0.5,
                    borderRadius:'9px', cursor:'grab', border:'1px solid rgba(126,58,242,0.10)',
                    background:'rgba(126,58,242,0.04)', color:'#A5B4FC',
                    transition:'all 0.15s',
                    '&:hover':{background:'rgba(126,58,242,0.12)', borderColor:'rgba(126,58,242,0.28)', color:'#DDD6FE', transform:'translateX(2px)'},
                    '&:active':{cursor:'grabbing'},
                  }}
                >
                  <Box sx={{color:'#7E3AF2', display:'flex'}}>{React.cloneElement(item.icon,{sx:{fontSize:16}})}</Box>
                  <Typography sx={{fontSize:'0.78rem', fontWeight:500}}>{item.label}</Typography>
                  <DragIndicatorIcon sx={{fontSize:13, ml:'auto', opacity:0.4}}/>
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Canvas Area */}
      <Box sx={{flex:1, display:'flex', flexDirection:'column', overflow:'hidden', background:'#0A0A14'}}>

        {/* Toolbar */}
        <Box sx={{
          px:2.5, py:1.5, borderBottom:'1px solid rgba(126,58,242,0.08)',
          display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0,
          background:'rgba(10,10,20,0.7)', gap:2, flexWrap:'wrap',
        }}>
          <Box sx={{display:'flex', alignItems:'center', gap:2}}>
            <Box sx={{display:'flex', alignItems:'center', gap:1}}>
              <GridViewIcon sx={{fontSize:16, color:'#7E3AF2'}}/>
              <Typography sx={{fontFamily:'"Space Grotesk",sans-serif', fontWeight:700, fontSize:'0.88rem', color:'#F1F0FF'}}>Dashboard Canvas</Typography>
            </Box>
            <Box sx={{display:'flex', alignItems:'center', gap:1}}>
              <CalendarTodayIcon sx={{fontSize:13, color:'#4B4C7A'}}/>
              <Typography sx={{fontSize:'0.72rem', color:'#4B4C7A'}}>Show data for</Typography>
              <FormControl size="small" sx={{minWidth:130}}>
                <Select value={dateFilter} onChange={e=>setDateFilter(e.target.value)}
                  sx={{fontSize:'0.78rem', height:30, '& .MuiOutlinedInput-notchedOutline':{borderColor:'rgba(126,58,242,0.2)'}}}>
                  {DATE_FILTERS.map(d=><MenuItem key={d} value={d} sx={{fontSize:'0.8rem'}}>{d}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
          </Box>
          <Box sx={{display:'flex', gap:1.5}}>
            <Chip label={`${widgets.length} widget${widgets.length!==1?'s':''}`} size="small"
              sx={{fontSize:'0.68rem', fontWeight:600, background:'rgba(126,58,242,0.12)', color:'#A78BFA', border:'1px solid rgba(126,58,242,0.22)'}}/>
            <Button variant="contained" startIcon={<SaveIcon sx={{fontSize:15}}/>} onClick={save}
              sx={{fontSize:'0.78rem', px:2, py:0.75, borderRadius:'8px', height:32}}>
              Save Configuration
            </Button>
          </Box>
        </Box>

        {/* Grid Canvas */}
        <Box
          ref={canvasRef}
          onDragOver={e=>{ e.preventDefault(); setDropTarget('canvas'); }}
          onDragLeave={()=>setDropTarget(null)}
          onDrop={handleCanvasDrop}
          sx={{
            flex:1, overflowY:'auto', p:2.5,
            background: dropTarget==='canvas' ? 'rgba(126,58,242,0.04)' : 'transparent',
            transition:'background 0.15s',
            backgroundImage:'radial-gradient(rgba(126,58,242,0.06) 1px, transparent 1px)',
            backgroundSize:'24px 24px',
          }}
        >
          {widgets.length===0 ? (
            <Box sx={{
              height:'100%', minHeight:300, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              border:'2px dashed rgba(126,58,242,0.18)', borderRadius:'18px',
              background:'rgba(126,58,242,0.02)',
            }}>
              <GridViewIcon sx={{fontSize:56, color:'#2D2B52', mb:2}}/>
              <Typography sx={{fontFamily:'"Space Grotesk",sans-serif', fontWeight:700, fontSize:'1rem', color:'#4B4C7A', mb:0.75}}>
                Drop Widgets Here
              </Typography>
              <Typography sx={{fontSize:'0.85rem', color:'#2D2B52', fontStyle:'italic', mb:2.5}}>
                Drag widgets from the library or click them to add
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {widgets.map((w) => (
                <Grid item key={w.id}
                  xs={Math.min(w.w*3, 12)}
                  sm={Math.min(w.w*1.5, 12)}
                  md={Math.min(w.w, 12)}
                  lg={Math.min(w.w, 12)}
                >
                  <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.9}} layout>
                    <Box sx={{
                      position:'relative', background:'#13122A',
                      border:`1px solid ${activeSettings===w.id ? 'rgba(126,58,242,0.5)' : 'rgba(126,58,242,0.14)'}`,
                      borderRadius:'14px', overflow:'hidden', minHeight: w.h*60,
                      transition:'border-color 0.2s, box-shadow 0.2s',
                      '&:hover':{ borderColor:'rgba(126,58,242,0.32)', boxShadow:'0 4px 24px rgba(126,58,242,0.12)',
                        '& .widget-actions':{ opacity:1 } },
                    }}>
                      {/* Widget Header */}
                      <Box sx={{px:2, py:1.25, borderBottom:'1px solid rgba(126,58,242,0.07)', display:'flex', alignItems:'center', gap:1}}>
                        <Box sx={{color:'#7E3AF2', display:'flex', flexShrink:0}}>{iconFor(w.type)}</Box>
                        <Typography sx={{fontWeight:600, fontSize:'0.8rem', color:'#F1F0FF', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{w.title}</Typography>
                        {/* Action buttons */}
                        <Box className="widget-actions" sx={{display:'flex', gap:0.5, opacity:0, transition:'opacity 0.15s'}}>
                          <Tooltip title="Settings">
                            <IconButton size="small" onClick={()=>setActiveSettings(w.id)} sx={{
                              width:24, height:24, color:'#4B4C7A', borderRadius:'6px',
                              background: activeSettings===w.id ? 'rgba(126,58,242,0.2)' : 'transparent',
                              '&:hover':{color:'#A78BFA', background:'rgba(126,58,242,0.14)'},
                            }}>
                              <SettingsIcon sx={{fontSize:13}}/>
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Remove">
                            <IconButton size="small" onClick={()=>removeWidget(w.id)} sx={{
                              width:24, height:24, color:'#4B4C7A', borderRadius:'6px',
                              '&:hover':{color:'#EF4444', background:'rgba(239,68,68,0.10)'},
                            }}>
                              <DeleteOutlineIcon sx={{fontSize:13}}/>
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>

                      {/* Widget Body */}
                      <Box sx={{p:1.5}}>
                        {w.description && <Typography sx={{fontSize:'0.72rem', color:'#4B4C7A', mb:1, fontStyle:'italic'}}>{w.description}</Typography>}
                        <WidgetPreview cfg={w}/>
                      </Box>
                    </Box>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>

      {/* Right Settings Drawer */}
      <Drawer
        anchor="right"
        open={Boolean(activeWidget)}
        onClose={()=>setActiveSettings(null)}
        variant="persistent"
        PaperProps={{sx:{
          width:320, background:'#0F0E1E', border:'none',
          borderLeft:'1px solid rgba(126,58,242,0.12)',
          boxShadow:'-8px 0 32px rgba(0,0,0,0.4)',
        }}}
      >
        {activeWidget && (
          <SettingsPanel
            widget={activeWidget}
            onUpdate={updateWidget}
            onClose={()=>setActiveSettings(null)}
          />
        )}
      </Drawer>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={()=>setSnack(p=>({...p,open:false}))} anchorOrigin={{vertical:'bottom',horizontal:'center'}}>
        <Alert severity={snack.sev} sx={{width:'100%', borderRadius:'12px', fontWeight:600}}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
