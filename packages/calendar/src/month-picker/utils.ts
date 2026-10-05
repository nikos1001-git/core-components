import { startOfMonth } from 'date-fns';

import { limitDate } from '../utils';

/**
 * Ограничивает месяц диапазоном [minDate, maxDate] и приводит к первому дню месяца
 */
export function limitMonth(date: Date | number, minDate?: number, maxDate?: number) {
    return startOfMonth(
        limitDate(
            date,
            minDate === undefined ? undefined : startOfMonth(minDate),
            maxDate === undefined ? undefined : startOfMonth(maxDate),
        ),
    );
}
