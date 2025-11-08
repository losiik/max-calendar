import type { ISODateString } from "@/entities/event/model/types";

export const toLocalISODate = (date: Date): ISODateString => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}` as ISODateString;
};

export const fromLocalISODate = (iso: ISODateString): Date => {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
};
