import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import Twilio from 'twilio';

const DATA_DIR = path.join(process.cwd(), 'data');
const OTP_FILE = path.join(DATA_DIR, 'otps.json');

async function readJson(file){ try{ const raw = await fs.readFile(file,'utf8'); return JSON.parse(raw||'[]'); }catch(e){ return []; } }
async function writeJson(file, data){ await fs.mkdir(DATA_DIR,{recursive:true}); await fs.writeFile(file, JSON.stringify(data, null, 2)); }

function useSupabase(){ const url = process.env.SUPABASE_URL; const key = process.env.SUPABASE_SERVICE_ROLE_KEY; if(url && key){ return createClient(url, key); } return null; }

export async function POST(req){ try{ const body = await req.json(); const phone = String(body.phone||'').replace(/\D/g,''); if(!/^\d{10}$/.test(phone)) return NextResponse.json({ error:'invalid phone' }, { status:400 }); const otp = Math.floor(100000 + Math.random()*900000).toString(); const now = Date.now(); const supabase = useSupabase(); if(supabase){ await supabase.from('otps').upsert({ phone, otp, ts: now }); } else { const otps = await readJson(OTP_FILE); const remaining = otps.filter(o=>o.phone!==phone).concat({ phone, otp, ts: now }); await writeJson(OTP_FILE, remaining); } // send via Twilio if configured
  if(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM){ const client = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN); try{ await client.messages.create({ body: `Your OTP for Sri Annapoorna: ${otp}`, from: process.env.TWILIO_FROM, to: '+91'+phone }); }catch(err){ console.error('Twilio send failed', err); } } else { console.log('Mock OTP for', phone, otp); } return NextResponse.json({ ok:true }); }catch(e){ console.error(e); return NextResponse.json({ error:'server error' }, { status:500 }); } }
