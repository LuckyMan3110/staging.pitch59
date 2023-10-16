import { format } from 'date-fns';

export function formatDateCell(timestamp, dateFormat = 'MMM d, YYYY h:mm a') {
    return format(new Date(timestamp), dateFormat);
}
