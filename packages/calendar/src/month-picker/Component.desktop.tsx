import React, { forwardRef, useMemo, useRef, useState } from 'react';
import cn from 'classnames';
import { endOfDay, isSameMonth, isSameYear, startOfDay } from 'date-fns';

import { getDataTestId, hooks } from '@alfalab/core-components-shared';
import { useDidUpdateEffect, useLayoutEffect_SAFE_FOR_SSR } from '@alfalab/hooks';
import { ChevronDownCompactSIcon } from '@alfalab/icons-glyph/ChevronDownCompactSIcon';

import { SelectButton } from '../components/select-button';
import { type Month } from '../typings';
import { useCalendar } from '../useCalendar';
import { monthName } from '../utils';

import { type CalendarMonthPickerDesktopProps } from './typings';
import { limitMonth } from './utils';

import styles from './index.module.css';

const { useCustomWebkitScrollbar } = hooks;

type MonthPickerView = 'months' | 'years';

export const CalendarMonthPickerDesktop = forwardRef<
    HTMLDivElement,
    CalendarMonthPickerDesktopProps
>(
    (
        {
            className,
            value,
            minDate: minDateTimestamp,
            maxDate: maxDateTimestamp,
            onChange,
            responsive,
            dataTestId,
        },
        ref,
    ) => {
        const [view, setView] = useState<MonthPickerView>('months');
        const bodyRef = useRef<HTMLDivElement>(null);

        const selected = useMemo(
            () =>
                value === undefined
                    ? undefined
                    : limitMonth(value, minDateTimestamp, maxDateTimestamp),
            [value, minDateTimestamp, maxDateTimestamp],
        );

        const minDate = useMemo(
            () => (minDateTimestamp ? startOfDay(minDateTimestamp) : undefined),
            [minDateTimestamp],
        );

        const maxDate = useMemo(
            () => (maxDateTimestamp ? endOfDay(maxDateTimestamp) : undefined),
            [maxDateTimestamp],
        );

        // Открытый год. Месяц в нем нужен только для навигации с клавиатуры
        const [activeMonth, setActiveMonth] = useState(() =>
            limitMonth(selected ?? Date.now(), minDateTimestamp, maxDateTimestamp),
        );

        const handleMonthChange = (timestamp: number) => {
            setActiveMonth(new Date(timestamp));

            // Выбор года только открывает его месяцы — выбранный месяц в новый год не переносится
            if (view === 'years') {
                setView('months');

                return;
            }

            if (onChange) {
                onChange(limitMonth(timestamp, minDateTimestamp, maxDateTimestamp).getTime());
            }
        };

        const { months, years, getMonthProps, getYearProps, getRootProps } = useCalendar({
            month: activeMonth,
            defaultMonth: activeMonth,
            view,
            minDate,
            maxDate,
            selected,
            onMonthChange: handleMonthChange,
        });

        const year = activeMonth.getFullYear();

        const isSelectedMonth = (month: Month) =>
            Boolean(selected && isSameMonth(selected, month.date));

        const handleYearSelectorClick = () => setView(view === 'years' ? 'months' : 'years');

        // При открытии списка лет прокручиваем к открытому году
        useLayoutEffect_SAFE_FOR_SSR(() => {
            const listNode = bodyRef.current;

            if (view === 'years' && listNode) {
                const activeYearNode =
                    listNode.querySelector<HTMLButtonElement>('button[tabIndex="0"]');

                listNode.scrollTop = activeYearNode
                    ? activeYearNode.offsetTop - listNode.offsetTop
                    : 0;
            }
        }, [view]);

        useDidUpdateEffect(() => {
            if (selected && !isSameYear(selected, activeMonth)) {
                setActiveMonth(selected);
            }
        }, [value]);

        const shouldUseCustomScrollbar = useCustomWebkitScrollbar();

        return (
            <div
                {...getRootProps({ ref })}
                className={cn('cc-calendar', styles.component, className, {
                    [styles.responsive]: responsive,
                })}
                data-test-id={dataTestId}
            >
                <SelectButton
                    view='filled'
                    className={styles.yearSelect}
                    onClick={handleYearSelectorClick}
                    aria-expanded={view === 'years'}
                    aria-label={`${year} год, выбрать год`}
                    aria-live='polite'
                    data-test-id={getDataTestId(dataTestId, 'btn-year')}
                >
                    <span className={styles.yearSelectContent}>
                        {year}
                        <ChevronDownCompactSIcon className={styles.chevron} />
                    </span>
                </SelectButton>

                <div
                    ref={bodyRef}
                    className={cn(styles.body, {
                        [styles.customScrollbar]: view === 'years' && shouldUseCustomScrollbar,
                        [styles.nativeScrollbar]: view === 'years' && !shouldUseCustomScrollbar,
                    })}
                >
                    <div className={styles.grid}>
                        {view === 'months' &&
                            months.map((month) => (
                                <SelectButton
                                    {...getMonthProps(month)}
                                    // useCalendar отмечает выбранным открытый месяц, а здесь выбранный — тот, что в value
                                    aria-selected={isSelectedMonth(month)}
                                    key={month.date.getTime()}
                                    view={isSelectedMonth(month) ? 'selected' : 'default'}
                                    className={styles.item}
                                >
                                    {monthName(month.date)}
                                </SelectButton>
                            ))}

                        {view === 'years' &&
                            years.map((yearDate) => (
                                <SelectButton
                                    {...getYearProps(yearDate)}
                                    key={yearDate.getFullYear()}
                                    view={
                                        isSameYear(yearDate, activeMonth) ? 'selected' : 'default'
                                    }
                                    className={styles.item}
                                >
                                    {yearDate.getFullYear()}
                                </SelectButton>
                            ))}
                    </div>
                </div>
            </div>
        );
    },
);

CalendarMonthPickerDesktop.displayName = 'CalendarMonthPickerDesktop';
