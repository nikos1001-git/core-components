import React, { forwardRef, useMemo, useRef, useState } from 'react';
import cn from 'classnames';
import { endOfDay, isSameMonth, isSameYear, setYear, startOfDay } from 'date-fns';

import { ButtonDesktop } from '@alfalab/core-components-button/desktop';
import { IconButton } from '@alfalab/core-components-icon-button';
import { getDataTestId, hooks } from '@alfalab/core-components-shared';
import { useDidUpdateEffect, useLayoutEffect_SAFE_FOR_SSR } from '@alfalab/hooks';
import { ChevronLeftMIcon } from '@alfalab/icons-glyph/ChevronLeftMIcon';
import { ChevronRightMIcon } from '@alfalab/icons-glyph/ChevronRightMIcon';

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

        const emitChange = (month: Date | number) => {
            if (onChange) {
                onChange(limitMonth(month, minDateTimestamp, maxDateTimestamp).getTime());
            }
        };

        // Если месяц выбран, он переезжает в новый год вместе с переключением года
        const changeYear = (newYear: number) => {
            setActiveMonth(
                limitMonth(setYear(activeMonth, newYear), minDateTimestamp, maxDateTimestamp),
            );

            if (selected) {
                emitChange(setYear(selected, newYear));
            }
        };

        const handleMonthChange = (timestamp: number) => {
            if (view === 'years') {
                changeYear(new Date(timestamp).getFullYear());
                setView('months');

                return;
            }

            setActiveMonth(new Date(timestamp));
            emitChange(timestamp);
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
        const canSetPrevYear = !minDate || year > minDate.getFullYear();
        const canSetNextYear = !maxDate || year < maxDate.getFullYear();

        const isSelectedMonth = (month: Month) =>
            Boolean(selected && isSameMonth(selected, month.date));

        const handlePrevYearClick = () => changeYear(year - 1);

        const handleNextYearClick = () => changeYear(year + 1);

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
                <div className={styles.header}>
                    {view === 'months' && (
                        <IconButton
                            size={32}
                            icon={ChevronLeftMIcon}
                            onClick={handlePrevYearClick}
                            disabled={!canSetPrevYear}
                            aria-label='Предыдущий год'
                            dataTestId={getDataTestId(dataTestId, 'btn-prev-year')}
                        />
                    )}
                    <ButtonDesktop
                        view='text'
                        size={32}
                        className={styles.yearButton}
                        onClick={handleYearSelectorClick}
                        aria-expanded={view === 'years'}
                        aria-label={`${year} год, выбрать год`}
                        aria-live='polite'
                        dataTestId={getDataTestId(dataTestId, 'btn-year')}
                    >
                        {year}
                    </ButtonDesktop>
                    {view === 'months' && (
                        <IconButton
                            size={32}
                            icon={ChevronRightMIcon}
                            onClick={handleNextYearClick}
                            disabled={!canSetNextYear}
                            aria-label='Следующий год'
                            dataTestId={getDataTestId(dataTestId, 'btn-next-year')}
                        />
                    )}
                </div>

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
