import React from "react";
export function Dialog({ children, open }: any){ if(!open) return null; return <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>{children}</div>; }
export function DialogContent({ children }: any){ return <div className='bg-white rounded-lg max-w-lg w-full p-4'>{children}</div>; }
export function DialogHeader({ children }: any){ return <div className='mb-2'>{children}</div>; }
export function DialogTitle({ children }: any){ return <h3 className='text-lg font-semibold'>{children}</h3>; }
export default Dialog;
