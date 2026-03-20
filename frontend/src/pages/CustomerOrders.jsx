import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, Grid, IconButton,
  Tooltip, Chip, LinearProgress, InputAdornment, Snackbar, Alert, Menu
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

/* ─── Constants ─────────────────────────────────────────────────── */
const COUNTRIES  = ['United States','Canada','Australia','Singapore','Hong Kong'];
const PRODUCTS   = ['Fiber Internet 300 Mbps','5G Unlimited Mobile Plan','Fiber Internet 1 Gbps','Business Internet 500 Mbps','VoIP Corporate Package'];
const STATUSES   = ['Pending','In progress','Completed'];
const CREATORS   = ['Mr. Michael Harris','Mr. Ryan Cooper','Ms. Olivia Carter','Mr. Lucas Martin'];

const EMPTY = {
  firstName:'', lastName:'', email:'', phone:'', street:'', city:'', state:'', postal:'', country:'',
  product:'', quantity:1, unitPrice:'', status:'Pending', createdBy:'',
};

const statusColor = { Pending:{ c:'#F59E0B', bg:'rgba(245,158,11,0.10)', border:'rgba(245,158,11,0.25)' }, 'In progress':{ c:'#1A56DB', bg:'rgba(26,86,219,0.10)', border:'rgba(26,86,219,0.25)' }, Completed:{ c:'#22C55E', bg:'rgba(34,197,94,0.10)', border:'rgba(34,197,94,0.25)' } };

const LS_KEY = 'hally_orders';
const load  = () => { try { return JSON.parse(localStorage.getItem(LS_KEY)||'[]'); } catch { return []; } };
const save  = (d) => { try { localStorage.setItem(LS_KEY, JSON.stringify(d)); } catch {} };

const fade = (d=0)=>({initial:{opacity:0,y:14}, animate:{opacity:1,y:0}, transition:{delay:d, duration:0.38}});

export default function CustomerOrders() {
  const [orders,  setOrders]  = useState(load);
  const [search,  setSearch]  = useState('');
  const [dlgOpen, setDlgOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form,    setForm]    = useState(EMPTY);
  const [errors,  setErrors]  = useState({});
  const [delDlg,  setDelDlg]  = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuRow,    setMenuRow]    = useState(null);
  const [snack,   setSnack]   = useState({open:false, msg:'', sev:'success'});

  useEffect(()=>{ save(orders); }, [orders]);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setErrors({}); setDlgOpen(true); };
  const openEdit   = (o) => { setEditing(o); setForm({...o}); setErrors({}); setDlgOpen(true); };

  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const totalAmount = () => {
    const q = Number(form.quantity)||0;
    const p = Number(form.unitPrice)||0;
    return (q*p).toFixed(2);
  };

  const validate = () => {
    const req = ['firstName','lastName','email','phone','street','city','state','postal','country','product','unitPrice','status','createdBy'];
    const e = {};
    req.forEach(k=>{ if(!(form[k]||'').toString().trim()) e[k]='Please fill the field'; });
    if(form.quantity<1) e.quantity='Cannot be less than 1';
    setErrors(e);
    return Object.keys(e).length===0;
  };

  const handleSubmit = () => {
    if(!validate()) return;
    const rec = { ...form, totalAmount: totalAmount(), id: editing?.id || Date.now().toString(), createdAt: editing?.createdAt || new Date().toISOString() };
    setOrders(p => editing ? p.map(o=>o.id===editing.id ? rec : o) : [rec,...p]);
    setDlgOpen(false);
    setSnack({open:true, msg: editing ? 'Order updated successfully' : 'Order created successfully', sev:'success'});
  };

  const handleDelete = () => {
    setOrders(p=>p.filter(o=>o.id!==delDlg.id));
    setDelDlg(null);
    setSnack({open:true, msg:'Order deleted', sev:'success'});
  };

  const filtered = orders.filter(o =>
    `${o.firstName} ${o.lastName} ${o.email} ${o.product} ${o.status}`.toLowerCase().includes(search.toLowerCase())
  );

  const Field = ({label, name, type='text', multiline=false, rows=1, prefix, readOnly=false, ...rest}) => (
    <TextField
      label={label} value={form[name]||''} fullWidth variant="outlined" size="small"
      type={type} multiline={multiline} rows={rows}
      error={!!errors[name]} helperText={errors[name]||''}
      onChange={readOnly ? undefined : e=>{ set(name, type==='number'?Math.max(1,Number(e.target.value)):e.target.value); setErrors(p=>({...p,[name]:''})); }}
      inputProps={{ readOnly, style:{fontSize:'0.9rem'} }}
      InputProps={{ startAdornment: prefix ? <InputAdornment position="start"><Typography sx={{color:'#4B4C7A',fontSize:'0.9rem'}}>{prefix}</Typography></InputAdornment> : null }}
      sx={{'& .MuiFormHelperText-root':{mt:0.25,fontSize:'0.7rem',color:'#EF4444'}, ...(readOnly&&{opacity:0.7})}}
      {...rest}
    />
  );

  const DDField = ({label,name,options}) => (
    <FormControl fullWidth size="small" error={!!errors[name]}>
      <InputLabel sx={{fontSize:'0.85rem'}}>{label}</InputLabel>
      <Select label={label} value={form[name]||''} onChange={e=>{set(name,e.target.value);setErrors(p=>({...p,[name]:''}));}}>
        {options.map(o=><MenuItem key={o} value={o} sx={{fontSize:'0.9rem'}}>{o}</MenuItem>)}
      </Select>
      {errors[name] && <Typography sx={{fontSize:'0.7rem',color:'#EF4444',mt:0.25,px:1.75}}>{errors[name]}</Typography>}
    </FormControl>
  );

  const SectionLabel = ({children}) => (
    <Box sx={{display:'flex', alignItems:'center', gap:1.5, mb:2, mt:1}}>
      <Box sx={{flex:1, height:'1px', background:'linear-gradient(90deg, rgba(126,58,242,0.3), transparent)'}}/>
      <Typography sx={{fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.12em', color:'#7E3AF2', fontFamily:'"Space Grotesk",sans-serif', textTransform:'uppercase', whiteSpace:'nowrap'}}>
        {children}
      </Typography>
      <Box sx={{flex:1, height:'1px', background:'linear-gradient(270deg, rgba(26,86,219,0.3), transparent)'}}/>
    </Box>
  );

  return (
    <Box sx={{p:{xs:2,md:3.5}, maxWidth:1400, mx:'auto', position:'relative', zIndex:1}}>

      {/* Header */}
      <motion.div {...fade(0)}>
        <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', mb:4, flexWrap:'wrap', gap:2}}>
          <Box>
            <Box sx={{display:'flex', alignItems:'center', gap:1.5, mb:0.5}}>
              <Box sx={{p:1, borderRadius:'10px', background:'linear-gradient(135deg, rgba(126,58,242,0.2),rgba(26,86,219,0.1))', border:'1px solid rgba(126,58,242,0.25)', display:'flex'}}>
                <ShoppingCartIcon sx={{fontSize:20, color:'#A78BFA'}}/>
              </Box>
              <Typography sx={{fontFamily:'"Space Grotesk",sans-serif', fontWeight:800, fontSize:{xs:'1.5rem',md:'1.9rem'}, letterSpacing:'-0.02em',
                background:'linear-gradient(135deg, #F1F0FF, #A78BFA, #818CF8)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text'}}>
                Customer Orders
              </Typography>
            </Box>
            <Typography sx={{fontSize:'0.85rem', color:'#4B4C7A'}}>{orders.length} order{orders.length!==1?'s':''} · stored locally</Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon sx={{fontSize:16}}/>} onClick={openCreate}
            sx={{fontSize:'0.82rem', fontWeight:600, px:2.5, py:1, borderRadius:'10px', boxShadow:'0 4px 18px rgba(126,58,242,0.35)'}}>
            Create Order
          </Button>
        </Box>
      </motion.div>

      {/* Search */}
      <motion.div {...fade(0.08)}>
        <TextField placeholder="Search orders…" value={search} onChange={e=>setSearch(e.target.value)} size="small"
          InputProps={{startAdornment:<InputAdornment position="start"><SearchIcon sx={{fontSize:16,color:'#4B4C7A'}}/></InputAdornment>,
            sx:{fontSize:'0.9rem','& fieldset':{borderColor:'rgba(126,58,242,0.18)'},'&:hover fieldset':{borderColor:'rgba(126,58,242,0.38)'},'&.Mui-focused fieldset':{borderColor:'#7E3AF2 !important'}}}}
          sx={{width:{xs:'100%',sm:340}, mb:2.5,'& input':{color:'#F1F0FF','&::placeholder':{color:'#4B4C7A',opacity:1}}}}/>
      </motion.div>

      {/* Table */}
      <motion.div {...fade(0.14)}>
        <Card sx={{borderRadius:'18px', overflow:'hidden'}}>
          {orders.length===0 && !search ? (
            <Box sx={{py:10, textAlign:'center'}}>
              <ShoppingCartIcon sx={{fontSize:52, color:'#2D2B52', mb:2}}/>
              <Typography sx={{fontFamily:'"Space Grotesk",sans-serif', fontSize:'0.95rem', fontWeight:700, color:'#4B4C7A', mb:0.75}}>No orders yet</Typography>
              <Typography sx={{fontSize:'0.85rem', color:'#4B4C7A', fontStyle:'italic', mb:2.5}}>Click "Create Order" to add the first customer order</Typography>
              <Button variant="outlined" startIcon={<AddIcon sx={{fontSize:15}}/>} onClick={openCreate} sx={{fontSize:'0.8rem', borderRadius:'9px'}}>Create Order</Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {['Customer','Email','Product','Qty','Unit Price','Total','Status','Created By','Date',''].map(h=>(
                      <TableCell key={h} align={h===''?'center':'left'} sx={{py:1.5, px:2, whiteSpace:'nowrap'}}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <AnimatePresence>
                    {filtered.length===0 ? (
                      <TableRow>
                        <TableCell colSpan={10} align="center" sx={{py:6, borderBottom:0}}>
                          <Typography sx={{fontSize:'0.88rem', color:'#4B4C7A', fontStyle:'italic'}}>No orders match your search</Typography>
                        </TableCell>
                      </TableRow>
                    ) : filtered.map((o,idx)=>{
                      const sc = statusColor[o.status]||statusColor.Pending;
                      return (
                        <motion.tr key={o.id} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{delay:idx*0.03}} style={{display:'table-row'}}>
                          <TableCell sx={{px:2, borderBottom:'1px solid rgba(126,58,242,0.06)'}}>
                            <Typography sx={{fontWeight:600, fontSize:'0.85rem', color:'#F1F0FF'}}>{o.firstName} {o.lastName}</Typography>
                            <Typography sx={{fontSize:'0.72rem', color:'#4B4C7A'}}>{o.phone}</Typography>
                          </TableCell>
                          <TableCell sx={{px:2, borderBottom:'1px solid rgba(126,58,242,0.06)'}}><Typography sx={{fontSize:'0.82rem', color:'#A5B4FC'}}>{o.email}</Typography></TableCell>
                          <TableCell sx={{px:2, borderBottom:'1px solid rgba(126,58,242,0.06)'}}><Typography sx={{fontSize:'0.82rem', color:'#F1F0FF', maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{o.product}</Typography></TableCell>
                          <TableCell sx={{px:2, borderBottom:'1px solid rgba(126,58,242,0.06)'}}><Typography sx={{fontSize:'0.82rem', color:'#F1F0FF', fontWeight:600}}>{o.quantity}</Typography></TableCell>
                          <TableCell sx={{px:2, borderBottom:'1px solid rgba(126,58,242,0.06)'}}><Typography sx={{fontSize:'0.82rem', color:'#F1F0FF'}}>${Number(o.unitPrice).toFixed(2)}</Typography></TableCell>
                          <TableCell sx={{px:2, borderBottom:'1px solid rgba(126,58,242,0.06)'}}><Typography sx={{fontSize:'0.85rem', fontWeight:700, color:'#A78BFA'}}>${Number(o.totalAmount).toFixed(2)}</Typography></TableCell>
                          <TableCell sx={{px:2, borderBottom:'1px solid rgba(126,58,242,0.06)'}}>
                            <Box sx={{display:'inline-flex', alignItems:'center', gap:0.6, px:1.1, py:0.35, borderRadius:'20px', background:sc.bg, border:`1px solid ${sc.border}`}}>
                              <Box sx={{width:5, height:5, borderRadius:'50%', background:sc.c, boxShadow:`0 0 5px ${sc.c}`}}/>
                              <Typography sx={{fontSize:'0.65rem', fontWeight:700, color:sc.c, letterSpacing:'0.04em'}}>{o.status}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{px:2, borderBottom:'1px solid rgba(126,58,242,0.06)'}}><Typography sx={{fontSize:'0.78rem', color:'#6366F1'}}>{o.createdBy}</Typography></TableCell>
                          <TableCell sx={{px:2, borderBottom:'1px solid rgba(126,58,242,0.06)'}}><Typography sx={{fontSize:'0.72rem', color:'#4B4C7A'}}>{new Date(o.createdAt).toLocaleDateString()}</Typography></TableCell>
                          <TableCell align="center" sx={{px:1, borderBottom:'1px solid rgba(126,58,242,0.06)'}}>
                            <IconButton size="small" onClick={e=>{setMenuAnchor(e.currentTarget);setMenuRow(o);}} sx={{color:'#4B4C7A','&:hover':{color:'#A78BFA'}}}>
                              <MoreVertIcon sx={{fontSize:16}}/>
                            </IconButton>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      </motion.div>

      {/* Context Menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={()=>setMenuAnchor(null)}>
        <MenuItem onClick={()=>{openEdit(menuRow); setMenuAnchor(null);}} sx={{gap:1.5, fontSize:'0.85rem', color:'#F1F0FF', px:2, py:1}}>
          <EditIcon sx={{fontSize:15, color:'#A78BFA'}}/> Edit
        </MenuItem>
        <MenuItem onClick={()=>{setDelDlg(menuRow); setMenuAnchor(null);}} sx={{gap:1.5, fontSize:'0.85rem', color:'#EF4444', px:2, py:1}}>
          <DeleteIcon sx={{fontSize:15}}/> Delete
        </MenuItem>
      </Menu>

      {/* Create / Edit Dialog */}
      <Dialog open={dlgOpen} onClose={()=>setDlgOpen(false)} maxWidth="md" fullWidth scroll="paper">
        <DialogTitle sx={{px:3, pt:3, pb:1.5}}>
          <Typography sx={{fontFamily:'"Space Grotesk",sans-serif', fontWeight:700, fontSize:'1.05rem', color:'#F1F0FF'}}>
            {editing ? 'Edit Order' : 'Create Order'}
          </Typography>
          <Typography sx={{fontSize:'0.8rem', color:'#4B4C7A', mt:0.3}}>
            {editing ? 'Update customer order details' : 'Fill in the details to create a new customer order'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{px:3, pb:1}}>

          <SectionLabel>Customer Information</SectionLabel>
          <Grid container spacing={2} sx={{mb:2}}>
            <Grid item xs={12} sm={6}><Field label="First Name *" name="firstName"/></Grid>
            <Grid item xs={12} sm={6}><Field label="Last Name *" name="lastName"/></Grid>
            <Grid item xs={12} sm={6}><Field label="Email ID *" name="email" type="email"/></Grid>
            <Grid item xs={12} sm={6}><Field label="Phone Number *" name="phone"/></Grid>
            <Grid item xs={12}><Field label="Street Address *" name="street"/></Grid>
            <Grid item xs={12} sm={4}><Field label="City *" name="city"/></Grid>
            <Grid item xs={12} sm={4}><Field label="State / Province *" name="state"/></Grid>
            <Grid item xs={12} sm={4}><Field label="Postal Code *" name="postal"/></Grid>
            <Grid item xs={12}><DDField label="Country *" name="country" options={COUNTRIES}/></Grid>
          </Grid>

          <SectionLabel>Order Information</SectionLabel>
          <Grid container spacing={2}>
            <Grid item xs={12}><DDField label="Choose Product *" name="product" options={PRODUCTS}/></Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Quantity *" value={form.quantity} type="number" size="small" fullWidth
                error={!!errors.quantity} helperText={errors.quantity||''}
                onChange={e=>{ const v=Math.max(1,Number(e.target.value)); set('quantity',v); setErrors(p=>({...p,quantity:''})); }}
                inputProps={{min:1, style:{fontSize:'0.9rem'}}}/>
            </Grid>
            <Grid item xs={12} sm={4}><Field label="Unit Price *" name="unitPrice" type="number" prefix="$"/></Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Total Amount" value={`$${totalAmount()}`} size="small" fullWidth readOnly
                InputProps={{readOnly:true, sx:{background:'rgba(126,58,242,0.05)', fontWeight:700}}} inputProps={{style:{fontSize:'0.9rem', color:'#A78BFA'}}}/>
            </Grid>
            <Grid item xs={12} sm={6}><DDField label="Status *" name="status" options={STATUSES}/></Grid>
            <Grid item xs={12} sm={6}><DDField label="Created By *" name="createdBy" options={CREATORS}/></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{px:3, pb:3, gap:1, pt:2}}>
          <Button onClick={()=>setDlgOpen(false)} sx={{fontSize:'0.82rem', color:'#4B4C7A','&:hover':{color:'#A78BFA'}}}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" sx={{fontSize:'0.82rem', px:3, py:0.9, borderRadius:'9px'}}>
            {editing ? 'Update Order' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={Boolean(delDlg)} onClose={()=>setDelDlg(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{px:3, pt:3, pb:1}}>
          <Typography sx={{fontFamily:'"Space Grotesk",sans-serif', fontWeight:700, fontSize:'1rem', color:'#F1F0FF'}}>Delete Order?</Typography>
        </DialogTitle>
        <DialogContent sx={{px:3}}>
          <Typography sx={{fontSize:'0.9rem', color:'#A5B4FC', lineHeight:1.6}}>
            Are you sure you want to delete the order for{' '}
            <Box component="span" sx={{color:'#F1F0FF', fontWeight:600}}>{delDlg?.firstName} {delDlg?.lastName}</Box>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{px:3, pb:3, gap:1}}>
          <Button onClick={()=>setDelDlg(null)} sx={{fontSize:'0.82rem', color:'#4B4C7A','&:hover':{color:'#A78BFA'}}}>Cancel</Button>
          <Button onClick={handleDelete} sx={{fontSize:'0.82rem', px:2.5, py:0.9, borderRadius:'9px',
            background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.28)', color:'#EF4444',
            '&:hover':{background:'rgba(239,68,68,0.2)'}}}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={()=>setSnack(p=>({...p,open:false}))} anchorOrigin={{vertical:'bottom',horizontal:'center'}}>
        <Alert severity={snack.sev} sx={{width:'100%', borderRadius:'12px', fontWeight:600}}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
