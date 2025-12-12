import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const DATA_DIR = path.join(process.cwd(), 'data');
const OTP_FILE = path.join(DATA_DIR, 'otps.json');
const VERIFIED_FILE = path.join(DATA_DIR, 'verified.json');

async function readJson(file){ try{ const raw = await fs.readFile(file,'utf8'); return JSON.parse(raw||'[]'); }catch(e){ return []; } }
async function writeJson(file, data){ await fs.mkdir(DATA_DIR,{recursive:true}); await fs.writeFile(file, JSON.stringify(data, null, 2)); }

function useSupabase(){ const url = process.env.SUPABASE_URL; const key = process.env.SUPABASE_SERVICE_ROLE_KEY; if(url && key){ return createClient(url, key); } return null; }

export async function POST(req){ try{ const body = await req.json(); const phone = String(body.phone||'').replace(/\D/g,''); const otp = String(body.otp||''); if(!/^\d{10}$/.test(phone)) return NextResponse.json({ error:'invalid phone' }, { status:400 }); const supabase = useSupabase(); if(supabase){ const { data, error } = await supabase.from('otps').select('*').eq('phone', phone).limit(1).single(); if(error || !data) return NextResponse.json({ error:'not found' }, { status:404 }); if(Date.now() - data.ts > 1000*60*10) return NextResponse.json({ error:'expired' }, { status:400 }); if(String(data.otp) !== String(otp)) return NextResponse.json({ error:'wrong otp' }, { status:400 }); await supabase.from('verified').upsert({ phone, ts: Date.now() }); await supabase.from('otps').delete().eq('phone', phone); return NextResponse.json({ ok:true }); } else { const otps = await readJson(OTP_FILE); const entry = otps.find(o=>o.phone===phone); if(!entry) return NextResponse.json({ error:'not found' }, { status:404 }); if(Date.now() - entry.ts > 1000*60*10) return NextResponse.json({ error:'expired' }, { status:400 }); if(String(entry.otp) !== String(otp)) return NextResponse.json({ error:'wrong otp' }, { status:400 }); const verified = await readJson(VERIFIED_FILE); const v = verified.filter(v=>v.phone!==phone).concat({ phone, ts: Date.now() }); await writeJson(VERIFIED_FILE, v); const remaining = otps.filter(o=>o.phone!==phone); await writeJson(OTP_FILE, remaining); return NextResponse.json({ ok:true }); } }catch(e){ console.error(e); return NextResponse.json({ error:'server error' }, { status:500 }); } }
