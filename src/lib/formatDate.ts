// Centralized date formatting utility
import { format, parseISO } from "date-fns";

export function formatDate(dateString: string, dateFormat = "MMMM d, yyyy") {
  try {
    return format(parseISO(dateString), dateFormat);
  } catch {
    return dateString;
  }
}
