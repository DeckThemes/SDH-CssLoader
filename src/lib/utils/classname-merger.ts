import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...args: any[]) {
  return twMerge(clsx(args));
}
