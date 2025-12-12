'use client';
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Dish = { id:string; name:string; category:string; price:number; isVegetarian?:boolean; description?:string };
type CartItem = { id:string; name:string; price:number; qty:number };

const SAMPLE_DISHES: Dish[] = [
  { id:'d1', name:'Masala Dosa', category:'Breakfast', price:50, isVegetarian:true },
  { id:'d2', name:'Sambar Rice', category:'Spl. Rice', price:50, isVegetarian:true },
  { id:'d3', name:'South Indian Meals', category:'Lunch', price:120, isVegetarian:true }
];

const FALLBACK_GOOGLE_FORM = 'https://forms.gle/VxbMjDuGgqStyqGK6';
const FORM_URL = typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_GOOGLE_FORM_URL ? process.env.NEXT_PUBLIC_GOOGLE_FORM_URL : FALLBACK_GOOGLE_FORM;
const CART_KEY = 'sri-annapoorna-cart';

function readCartFromStorage(): CartItem[]{ try{ if(typeof window==='undefined') return []; const raw = localStorage.getItem(CART_KEY); if(!raw) return []; const parsed = JSON.parse(raw); if(!Array.isArray(parsed)) return []; return parsed; }catch(e){return [];} }
function writeCartToStorage(items:CartItem[]){ try{ if(typeof window==='undefined') return; localStorage.setItem(CART_KEY, JSON.stringify(items)); }catch(e){} }

export default function CustomerMenuPage(){ 
  const [view,setView]=useState<'home'|'menu'>('home');
  const [dishes]=useState<Dish[]>(SAMPLE_DISHES);
  const [query,setQuery]=useState('');
  const [categoryFilter,setCategoryFilter]=useState<string|null>(null);
  const [cartOpen,setCartOpen]=useState(false);
  const [cart,setCart]=useState<CartItem[]>([]);
  const [otpStep,setOtpStep]=useState<'idle'|'sent'|'verified'>('idle');
  const [sendingOtp,setSendingOtp]=useState(false);
  const [verifyingOtp,setVerifyingOtp]=useState(false);

  useEffect(()=>{ setCart(readCartFromStorage()); },[]);
  useEffect(()=>{ writeCartToStorage(cart); },[cart]);

  const visible = dishes.filter(d=>{ if(categoryFilter && d.category!==categoryFilter) return false; if(!query) return true; const q=query.toLowerCase(); return d.name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q); });

  function addToCart(d:Dish, qty=1){ if(qty<=0) return; setCart(prev=>{ const ex=prev.find(p=>p.id===d.id); if(ex) return prev.map(p=>p.id===d.id?{...p, qty:p.qty+qty}:p); return [...prev,{id:d.id,name:d.name,price:d.price,qty}]; }); setCartOpen(true); }
  function updateQty(id:string, qty:number){ const newQty=Math.max(0, Math.floor(qty)); setCart(prev=>prev.map(p=>p.id===id?{...p,qty:newQty}:p).filter(p=>p.qty>0)); }
  function clearCart(){ setCart([]); }
  const subtotal = cart.reduce((s,c)=>s+c.price*c.qty,0);

  async function sendOtp(phone:string){ setSendingOtp(true); try{ const res = await fetch('/api/otp/send', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ phone }) }); const data = await res.json(); if(res.ok) { setOtpStep('sent'); alert('OTP sent (server-side).'); } else { alert(data.error||'failed to send OTP'); } }catch(e){ alert('failed'); } finally{ setSendingOtp(false); } }

  async function verifyOtp(phone:string, otp:string){ setVerifyingOtp(true); try{ const res = await fetch('/api/otp/verify', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ phone, otp }) }); const data = await res.json(); if(res.ok){ setOtpStep('verified'); alert('Phone verified'); } else { alert(data.error||'failed'); } }catch(e){ alert('failed'); } finally{ setVerifyingOtp(false); } }

  async function placeOrder(name:string, phone:string, notes:string){ try{ const res = await fetch('/api/order', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ name, phone, notes, items: cart, total: subtotal }) }); const data = await res.json(); if(res.ok){ alert('Order placed: '+data.id); clearCart(); setCartOpen(false); setOtpStep('idle'); } else { alert(data.error||'failed'); } }catch(e){ alert('failed'); } }

  return (<div className='min-h-screen bg-[#fffaf0] text-stone-900'>
    <header className='border-b p-4 bg-white sticky top-0'><div className='max-w-6xl mx-auto flex justify-between items-center'>
      <div><div className='text-2xl font-bold text-[#F59E0B]'>Sri Annapoorna</div><div className='text-xs text-stone-600'>Authentic Andhra Cuisine</div></div>
      <nav className='flex items-center gap-3'><button onClick={()=>setView('home')} className='px-3 py-2 rounded'>Home</button><button onClick={()=>{setView('menu'); setCategoryFilter(null); setQuery('');}} className='px-3 py-2 rounded'>Menu</button><Button onClick={()=>setCartOpen(true)} variant='ghost'>Cart ({cart.reduce((a,b)=>a+b.qty,0)}) — ₹{subtotal}</Button></nav>
    </div></header>

    <main className='p-6 max-w-6xl mx-auto'>{ view==='home' ? (<section className='grid grid-cols-1 md:grid-cols-2 gap-8 py-16'><div><h1 className='text-4xl font-bold'>Sri Annapoorna</h1><p className='mt-4 text-lg text-stone-700'>Authentic Andhra flavours. Pickup & takeaway available.</p><div className='mt-6'><Button size='lg' onClick={()=>setView('menu')}>View Menu</Button> <Button variant='outline' asChild><a href={FORM_URL} target='_blank' rel='noreferrer'>Book a Table</a></Button></div></div><div className='space-y-6'><div className='p-6 bg-[#FFF7ED] rounded'>What we stand for<ul className='mt-2 text-sm'><li>Authentic Andhra flavours</li><li>Ingredients from Andhra</li><li>Pickup & Parking</li></ul></div><div className='p-6 bg-[#FFF7ED] rounded'>Find Us<p className='mt-2 text-sm'>Sri Annapoorna, #MVR SPACES, Royal Oak Building, Chikkaballapura</p><div className='mt-2'><a href='tel:+919900773326' className='block text-[#F59E0B]'>+91 9900773326</a></div></div></div></section>) : (<section className='grid grid-cols-1 md:grid-cols-[240px,1fr] gap-6'><aside><Card><CardHeader><h3>Search & Filters</h3></CardHeader><CardContent><Input value={query} onChange={(e:any)=>setQuery(e.target.value)} placeholder='Search' /><div className='mt-4'><Label>Categories</Label><div className='flex gap-2 mt-2'><button onClick={()=>setCategoryFilter(null)} className='px-3 py-1 rounded-full bg-[#FEEBC8]'>All</button><button onClick={()=>setCategoryFilter('Breakfast')} className='px-3 py-1 rounded-full'>Breakfast</button><button onClick={()=>setCategoryFilter('Lunch')} className='px-3 py-1 rounded-full'>Lunch</button></div></div></CardContent></Card></aside><div><div className='grid grid-cols-1 md:grid-cols-2 gap-4'>{visible.map(d=>(<article key={d.id} className='p-4 bg-white rounded shadow transform transition hover:scale-105 hover:-translate-y-1'><div className='flex justify-between'><div><h3 className='font-semibold'>{d.name}</h3><div className='text-sm text-[#F59E0B]'>{d.category}</div></div><div className='text-right'><div className='font-medium'>₹{d.price}</div><div className='mt-2'><Button size='sm' onClick={()=>addToCart(d,1)}>Add</Button></div></div></div></article>))}</div></div></section>) }</main>

    <Sheet open={cartOpen}><SheetContent className='w-full md:w-[420px]'><div className='p-4 flex flex-col h-full'><h2 className='text-xl font-semibold'>Your Cart</h2><div className='mt-4 flex-1 overflow-auto'>{cart.length===0 && <div className='text-[#F59E0B]'>Cart is empty.</div>}<div className='space-y-3'>{cart.map(c=>(<div key={c.id} className='flex items-center justify-between bg-[#FFF7ED] p-3 rounded'><div><div className='font-medium'>{c.name}</div><div className='text-sm text-[#F59E0B]'>₹{c.price} × {c.qty} = ₹{c.price*c.qty}</div></div><div className='flex items-center gap-2'><button className='px-2 py-1 bg-[#F59E0B] text-white rounded' onClick={()=>updateQty(c.id, c.qty-1)}>-</button><div className='w-6 text-center'>{c.qty}</div><button className='px-2 py-1 bg-[#F59E0B] text-white rounded' onClick={()=>updateQty(c.id, c.qty+1)}>+</button></div></div>))}</div></div><div className='mt-4'><Separator /><div className='mt-4 grid gap-2'><div className='flex justify-between text-sm text-[#F59E0B]'><span>Subtotal</span><span>₹{subtotal}</span></div><Input placeholder='Name (required)' id='cust-name' /><Input placeholder='Phone (required)' id='cust-phone' /><Textarea placeholder='Any notes or pickup instructions' id='cust-notes' />{otpStep==='idle' && <Button onClick={()=>{ const phone=(document.getElementById('cust-phone') as HTMLInputElement).value||''; sendOtp(phone); }}>Send OTP</Button>} {otpStep==='sent' && <div><Input placeholder='Enter OTP' id='cust-otp' /><div className='flex gap-2 mt-2'><Button onClick={()=>{ const phone=(document.getElementById('cust-phone') as HTMLInputElement).value||''; const otp=(document.getElementById('cust-otp') as HTMLInputElement).value||''; verifyOtp(phone, otp); }}>Verify OTP</Button><Button variant='ghost' onClick={()=>setOtpStep('idle')}>Cancel</Button></div></div>} {otpStep==='verified' && <Button onClick={()=>{ const name=(document.getElementById('cust-name') as HTMLInputElement).value||''; const phone=(document.getElementById('cust-phone') as HTMLInputElement).value||''; const notes=(document.getElementById('cust-notes') as HTMLInputElement).value||''; if(!name||!phone){ alert('Enter name and phone'); return; } placeOrder(name, phone, notes); }}>Place order (Verified)</Button>}<div className='flex gap-2 mt-2'><Button variant='ghost' onClick={()=>clearCart()}>Clear</Button></div></div></div></div></SheetContent></Sheet></div>); }
