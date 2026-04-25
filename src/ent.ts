import { format } from 'date-fns';

export type EntOption = { label: '15.06' | '03.07'; value: string };

export const getEntOptions = (year = new Date().getFullYear()): EntOption[] => ([
  { label: '15.06', value: `${year}-06-15` },
  { label: '03.07', value: `${year}-07-03` },
]);

export const isEntDate = (dateYmd: string, year = new Date().getFullYear()) => {
  const set = new Set(getEntOptions(year).map((o) => o.value));
  return set.has(dateYmd);
};

export const formatEntLabel = (dateYmd: string) => format(new Date(dateYmd), 'dd.MM');
