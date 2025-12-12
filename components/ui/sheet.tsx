import React from "react";
export function Sheet({ children, open }: any){ if(!open) return null; return <div className='fixed inset-y-0 right-0 z-50 w-full md:w-[420px] bg-white shadow-lg'>{children}</div>; }
export function SheetContent({ children, className }: any){ return <div className={['p-4 h-full', className].filter(Boolean).join(' ')}>{children}</div>; }
export default Sheet;
