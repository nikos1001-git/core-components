import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { MONTHS } from '../utils';

import { CalendarMonthPickerDesktop } from './Component.desktop';
import { CalendarMonthPickerMobile } from './Component.mobile';
import { type CalendarMonthPickerDesktopProps } from './typings';

describe('CalendarMonthPicker', () => {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query) => ({
            matches: true,
            media: query,
            onchange: null,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
        })),
    });

    const value = new Date(2020, 10, 15).getTime();
    const currentYear = new Date().getFullYear();
    const getButton = (name: string) => screen.getByRole('button', { name });

    const ControlledPicker = (props: CalendarMonthPickerDesktopProps) => {
        const [month, setMonth] = useState(props.value);

        return (
            <CalendarMonthPickerDesktop
                {...props}
                value={month}
                onChange={(newMonth) => {
                    setMonth(newMonth);
                    props.onChange?.(newMonth);
                }}
            />
        );
    };

    describe('Desktop', () => {
        it('should match snapshot', () => {
            expect(
                render(<CalendarMonthPickerDesktop value={value} />).container,
            ).toMatchSnapshot();
        });

        it('should set `data-test-id` attribute', () => {
            render(<CalendarMonthPickerDesktop value={value} dataTestId='picker' />);

            expect(screen.getByTestId('picker')).toBeInTheDocument();
            expect(screen.getByTestId('picker-btn-year')).toHaveTextContent(/^2020$/);
            expect(screen.getByTestId('picker-btn-prev-year')).toBeInTheDocument();
            expect(screen.getByTestId('picker-btn-next-year')).toBeInTheDocument();
        });

        it('should set custom class', () => {
            const { container } = render(<CalendarMonthPickerDesktop className='custom' />);

            expect(container.firstElementChild).toHaveClass('custom');
        });

        it('should render 12 months and select month of value', () => {
            render(<CalendarMonthPickerDesktop value={value} dataTestId='picker' />);

            MONTHS.forEach((month) => expect(getButton(month)).toBeInTheDocument());
            expect(getButton('Ноябрь')).toHaveAttribute('aria-selected', 'true');
            expect(getButton('Ноябрь')).toHaveClass('selected');
            expect(getButton('Октябрь')).toHaveAttribute('aria-selected', 'false');
            // в шапке только год, без месяца
            expect(screen.getByTestId('picker-btn-year')).toHaveTextContent(/^2020$/);
        });

        it('should open current year without selected month by default', () => {
            render(<CalendarMonthPickerDesktop dataTestId='picker' />);

            expect(screen.getByTestId('picker-btn-year')).toHaveTextContent(
                new RegExp(`^${currentYear}$`),
            );
            MONTHS.forEach((month) => {
                expect(getButton(month)).toHaveAttribute('aria-selected', 'false');
                expect(getButton(month)).not.toHaveClass('current');
            });
        });

        it('should call onChange with the first day of clicked month', () => {
            const onChange = jest.fn();

            render(<CalendarMonthPickerDesktop value={value} onChange={onChange} />);

            fireEvent.click(getButton('Март'));

            expect(onChange).toHaveBeenCalledTimes(1);
            expect(onChange).toHaveBeenCalledWith(new Date(2020, 2, 1).getTime());
        });

        it('should switch only year with arrows when month is not selected', () => {
            const onChange = jest.fn();

            render(<CalendarMonthPickerDesktop onChange={onChange} dataTestId='picker' />);

            fireEvent.click(screen.getByTestId('picker-btn-prev-year'));

            expect(screen.getByTestId('picker-btn-year')).toHaveTextContent(
                new RegExp(`^${currentYear - 1}$`),
            );
            expect(onChange).not.toHaveBeenCalled();

            fireEvent.click(getButton('Май'));

            expect(onChange).toHaveBeenCalledWith(new Date(currentYear - 1, 4, 1).getTime());
        });

        it('should keep selected month when year is switched with arrows', () => {
            const onChange = jest.fn();

            render(
                <ControlledPicker
                    value={new Date(2026, 9, 1).getTime()}
                    onChange={onChange}
                    dataTestId='picker'
                />,
            );

            fireEvent.click(screen.getByTestId('picker-btn-prev-year'));

            expect(onChange).toHaveBeenLastCalledWith(new Date(2025, 9, 1).getTime());
            expect(screen.getByTestId('picker-btn-year')).toHaveTextContent(/^2025$/);
            expect(getButton('Октябрь')).toHaveAttribute('aria-selected', 'true');

            fireEvent.click(screen.getByTestId('picker-btn-next-year'));
            fireEvent.click(screen.getByTestId('picker-btn-next-year'));

            expect(onChange).toHaveBeenLastCalledWith(new Date(2027, 9, 1).getTime());
            expect(screen.getByTestId('picker-btn-year')).toHaveTextContent(/^2027$/);
        });

        describe('years list', () => {
            it('should open years list by click on year', () => {
                render(<CalendarMonthPickerDesktop value={value} dataTestId='picker' />);

                const yearButton = screen.getByTestId('picker-btn-year');

                fireEvent.click(yearButton);

                expect(yearButton).toHaveAttribute('aria-expanded', 'true');
                expect(screen.queryByTestId('picker-btn-prev-year')).not.toBeInTheDocument();
                expect(screen.queryByTestId('picker-btn-next-year')).not.toBeInTheDocument();
                expect(screen.queryByRole('button', { name: 'Март' })).not.toBeInTheDocument();
                expect(getButton('2020')).toHaveAttribute('aria-selected', 'true');
            });

            it('should close years list by second click on year', () => {
                render(<CalendarMonthPickerDesktop value={value} dataTestId='picker' />);

                fireEvent.click(screen.getByTestId('picker-btn-year'));
                fireEvent.click(screen.getByTestId('picker-btn-year'));

                expect(getButton('Март')).toBeInTheDocument();
            });

            it('should move selected month to chosen year', () => {
                const onChange = jest.fn();

                render(<ControlledPicker value={value} onChange={onChange} dataTestId='picker' />);

                fireEvent.click(screen.getByTestId('picker-btn-year'));
                fireEvent.click(getButton('2010'));

                expect(onChange).toHaveBeenCalledWith(new Date(2010, 10, 1).getTime());
                expect(screen.getByTestId('picker-btn-year')).toHaveTextContent(/^2010$/);
                expect(screen.getByTestId('picker-btn-year')).toHaveAttribute(
                    'aria-expanded',
                    'false',
                );
                expect(getButton('Ноябрь')).toHaveAttribute('aria-selected', 'true');
            });

            it('should only open chosen year when month is not selected', () => {
                const onChange = jest.fn();

                render(<CalendarMonthPickerDesktop onChange={onChange} dataTestId='picker' />);

                fireEvent.click(screen.getByTestId('picker-btn-year'));
                fireEvent.click(getButton('2010'));

                expect(onChange).not.toHaveBeenCalled();
                expect(screen.getByTestId('picker-btn-year')).toHaveTextContent(/^2010$/);
            });
        });

        describe('when minDate and maxDate are set', () => {
            const minDate = new Date(2020, 2, 10).getTime();
            const maxDate = new Date(2021, 8, 20).getTime();

            it('should disable months out of range', () => {
                render(
                    <CalendarMonthPickerDesktop
                        value={value}
                        minDate={minDate}
                        maxDate={maxDate}
                    />,
                );

                expect(getButton('Февраль')).toBeDisabled();
                expect(getButton('Март')).not.toBeDisabled();
                expect(getButton('Декабрь')).not.toBeDisabled();
            });

            it('should disable arrows on bound years and limit selected month', () => {
                const onChange = jest.fn();

                render(
                    <ControlledPicker
                        value={value}
                        minDate={minDate}
                        maxDate={maxDate}
                        onChange={onChange}
                        dataTestId='picker'
                    />,
                );

                expect(screen.getByTestId('picker-btn-prev-year')).toBeDisabled();
                expect(screen.getByTestId('picker-btn-next-year')).not.toBeDisabled();

                fireEvent.click(screen.getByTestId('picker-btn-next-year'));

                // Ноябрь 2021 позже maxDate — выбирается последний доступный месяц
                expect(onChange).toHaveBeenLastCalledWith(new Date(2021, 8, 1).getTime());
                expect(screen.getByTestId('picker-btn-year')).toHaveTextContent(/^2021$/);
                expect(screen.getByTestId('picker-btn-next-year')).toBeDisabled();
                expect(getButton('Октябрь')).toBeDisabled();
            });

            it('should show only years in range', () => {
                render(
                    <CalendarMonthPickerDesktop
                        value={value}
                        minDate={minDate}
                        maxDate={maxDate}
                        dataTestId='picker'
                    />,
                );

                fireEvent.click(screen.getByTestId('picker-btn-year'));

                expect(getButton('2020')).toBeInTheDocument();
                expect(getButton('2021')).toBeInTheDocument();
                expect(screen.queryByRole('button', { name: '2019' })).not.toBeInTheDocument();
                expect(screen.queryByRole('button', { name: '2022' })).not.toBeInTheDocument();
            });
        });
    });

    describe('Mobile', () => {
        it('should show only cancel button when value is empty', () => {
            const onClose = jest.fn();

            render(<CalendarMonthPickerMobile open={true} onClose={onClose} dataTestId='picker' />);

            expect(screen.queryByTestId('picker-btn-apply')).not.toBeInTheDocument();
            expect(screen.queryByTestId('picker-btn-reset')).not.toBeInTheDocument();

            fireEvent.click(screen.getByTestId('picker-btn-cancel'));

            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it('should call onChange from months grid', () => {
            const onChange = jest.fn();

            render(
                <CalendarMonthPickerMobile
                    open={true}
                    value={value}
                    onChange={onChange}
                    dataTestId='picker'
                />,
            );

            expect(screen.getByTestId('picker-calendar-btn-year')).toHaveTextContent(/^2020$/);

            fireEvent.click(getButton('Июль'));

            expect(onChange).toHaveBeenCalledWith(new Date(2020, 6, 1).getTime());
        });

        it('should reset value', () => {
            const onChange = jest.fn();

            render(
                <CalendarMonthPickerMobile
                    open={true}
                    value={value}
                    onChange={onChange}
                    dataTestId='picker'
                />,
            );

            fireEvent.click(screen.getByTestId('picker-btn-reset'));

            expect(onChange).toHaveBeenCalledTimes(1);
            expect(onChange).toHaveBeenCalledWith();
        });

        it('should call onApply and onClose on apply', () => {
            const onApply = jest.fn();
            const onClose = jest.fn();

            render(
                <CalendarMonthPickerMobile
                    open={true}
                    value={value}
                    onApply={onApply}
                    onClose={onClose}
                    dataTestId='picker'
                />,
            );

            fireEvent.click(screen.getByTestId('picker-btn-apply'));

            expect(onApply).toHaveBeenCalledTimes(1);
            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });
});
