import { v4 as uuidv4 } from 'uuid';

export const generateId = (): string => uuidv4();

export const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const truncate = (str: string, maxLength: number): string =>
  str.length > maxLength ? `${str.substring(0, maxLength - 3)}...` : str;

export const capitalize = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1);

export const parseBoolean = (value: string | undefined): boolean => {
  if (!value) return false;
  return value.toLowerCase() === 'true' || value === '1';
};

export const parseNumber = (value: string | undefined, defaultValue: number): number => {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};