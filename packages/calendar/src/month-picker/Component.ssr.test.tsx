import React from 'react';
import { renderToString } from 'react-dom/server';

import { CalendarMonthPickerDesktop } from '@alfalab/core-components-calendar/desktop';

test('CalendarMonthPickerDesktop', () => {
    let htmlString: string | undefined;

    expect(() => {
        htmlString = renderToString(<CalendarMonthPickerDesktop />);
    }).not.toThrow();

    expect(htmlString).toEqual(expect.any(String));
});
