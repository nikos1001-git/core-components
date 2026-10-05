import React, { forwardRef } from 'react';

import { useIsDesktop } from '@alfalab/core-components-mq';

import { CalendarMonthPickerDesktop } from './Component.desktop';
import { CalendarMonthPickerMobile } from './Component.mobile';
import { type CalendarMonthPickerProps } from './typings';

export const CalendarMonthPicker = forwardRef<HTMLDivElement, CalendarMonthPickerProps>(
    ({ breakpoint, client, ...restProps }, ref) => {
        const isDesktop = useIsDesktop(
            breakpoint,
            client === undefined ? undefined : client === 'desktop',
        );

        return isDesktop ? (
            <CalendarMonthPickerDesktop {...restProps} ref={ref} />
        ) : (
            <CalendarMonthPickerMobile {...restProps} ref={ref} />
        );
    },
);

CalendarMonthPicker.displayName = 'CalendarMonthPicker';
