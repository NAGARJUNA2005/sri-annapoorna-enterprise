import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const DATA_DIR = path.join(process.cwd(), 'data');
const VERIFIED_FILE = path.join(DATA_DIR, 'verified.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

async function readJson(file){ try{ const raw = await fs.readFile(file,'utf8'); return JSON.parse(raw||'[]'); }catch(e){ return []; } }
async function writeJson(file, data){ await fs.mkdir(DATA_DIR,{recursive:true}); await fs.writeFile(file, JSON.stringify(data, null, 2)); }

function useSupabase(){ const url = process.env.SUPABASE_URL; const key = process.env.SUPABASE_SERVICE_ROLE_KEY; if(url && key){ return createClient(url, key); } return null; }

export async function POST(req){ try{ const body = await req.json(); const { name, phone, notes, items, total } = body; const phoneClean = String(phone||'').replace(/\D/g,''); if(!name || !/^\d{10}$/.test(phoneClean)) return NextResponse.json({ error:'invalid' }, { status:400 }); const supabase = useSupabase(); if(supabase){ const { data: v } = await supabase.from('verified').select('*').eq('phone', phoneClean).limit(1).single(); if(!v) return NextResponse.json({ error:'not_verified' }, { status:403 }); const id = 'ord_' + Date.now(); await supabase.from('orders').insert({ id, name, phone: phoneClean, notes: notes||'', items, total: total||0, ts: Date.now() }); return NextResponse.json({ ok:true, id }); } else { const verified = await readJson(VERIFIED_FILE); if(!verified.find(v=>v.phone===phoneClean)) return NextResponse.json({ error:'not_verified' }, { status:403 }); const orders = await readJson(ORDERS_FILE); const id = 'ord_' + Date.now(); const order = { id, name, phone: phoneClean, notes: notes||'', items: items||[], total: total||0, ts: Date.now() }; const updated = orders.concat(order); await writeJson(ORDERS_FILE, updated); return NextResponse.json({ ok:true, id }); } }catch(e){ console.error(e); return NextResponse.json({ error:'server error' }, { status:500 }); } }
