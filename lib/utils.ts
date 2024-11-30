import { clsx, type ClassValue } from "clsx"
import { QueryResult } from "mysql2";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const resolveQuery = (query: QueryResult) => JSON.parse(JSON.stringify(query))[0];
