import React from "react";
export function Card({ children, className }: any) { return <div className={['bg-white rounded-lg shadow p-4', className].filter(Boolean).join(' ')}>{children}</div>; }
export function CardHeader({ children }: any){ return <div className='mb-2 text-sm font-semibold'>{children}</div>; }
export function CardContent({ children }: any){ return <div>{children}</div>; }
export default Card;
