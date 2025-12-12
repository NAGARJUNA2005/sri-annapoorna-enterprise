import React from "react";
export function Button({ children, variant, size, asChild, className, ...props }: any) {
  const Tag = asChild ? "div" : "button";
  const base = "inline-flex items-center justify-center rounded-md transition focus:outline-none";
  const sizeClass = size === "lg" ? "px-4 py-2 text-base" : size === "sm" ? "px-2 py-1 text-sm" : "px-3 py-2";
  const variantClass = variant === "ghost" ? "bg-transparent" : variant === "outline" ? "border" : "bg-[#F59E0B] text-white";
  return <Tag className={[base, sizeClass, variantClass, className].filter(Boolean).join(" ")} {...props}>{children}</Tag>;
}
export default Button;
