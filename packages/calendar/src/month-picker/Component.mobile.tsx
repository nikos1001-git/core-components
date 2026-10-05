import React, { forwardRef } from 'react';

import { ButtonMobile } from '@alfalab/core-components-button/mobile';
import { ModalMobile } from '@alfalab/core-components-modal/mobile';
import { getDataTestId } from '@alfalab/core-components-shared';

import { CalendarMonthPickerDesktop } from './Component.desktop';
import { type CalendarMonthPickerMobileProps } from './typings';

import styles from './mobile.module.css';

export const CalendarMonthPickerMobile = forwardRef<HTMLDivElement, CalendarMonthPickerMobileProps>(
    (
        {
            open,
            onClose,
            onApply,
            onChange,
            value,
            minDate,
            maxDate,
            title = 'Выберите месяц',
            hasHeader = true,
            hasBackButton = false,
            onBack,
            cancelButtonContent = 'Отмена',
            selectButtonContent = 'Выбрать',
            resetButtonContent = 'Сбросить',
            className,
            dataTestId,
            ...restProps
        },
        ref,
    ) => {
        const handleClose = () => {
            if (onClose) onClose();
        };

        const handleApply = () => {
            onApply?.();
            handleClose();
        };

        const handleClear = () => {
            if (onChange) onChange();
        };

        const renderFooter = () => {
            if (value === undefined) {
                return (
                    <ButtonMobile
                        view='secondary'
                        size={56}
                        block={true}
                        onClick={handleClose}
                        dataTestId={getDataTestId(dataTestId, 'btn-cancel')}
                    >
                        {cancelButtonContent}
                    </ButtonMobile>
                );
            }

            return (
                <React.Fragment>
                    <ButtonMobile
                        view='secondary'
                        size={56}
                        block={true}
                        onClick={handleClear}
                        dataTestId={getDataTestId(dataTestId, 'btn-reset')}
                    >
                        {resetButtonContent}
                    </ButtonMobile>
                    <ButtonMobile
                        view='primary'
                        size={56}
                        block={true}
                        onClick={handleApply}
                        dataTestId={getDataTestId(dataTestId, 'btn-apply')}
                    >
                        {selectButtonContent}
                    </ButtonMobile>
                </React.Fragment>
            );
        };

        return (
            <ModalMobile
                open={open}
                onClose={handleClose}
                ref={ref}
                className={className}
                dataTestId={dataTestId}
            >
                {hasHeader && (
                    <ModalMobile.Header
                        hasCloser={true}
                        hasBackButton={hasBackButton}
                        title={title}
                        sticky={true}
                        onBack={onBack}
                    />
                )}
                <ModalMobile.Content className={styles.content} flex={true}>
                    <CalendarMonthPickerDesktop
                        {...restProps}
                        value={value}
                        minDate={minDate}
                        maxDate={maxDate}
                        onChange={onChange}
                        responsive={true}
                        dataTestId={getDataTestId(dataTestId, 'calendar')}
                    />
                </ModalMobile.Content>
                <ModalMobile.Footer sticky={true}>{renderFooter()}</ModalMobile.Footer>
            </ModalMobile>
        );
    },
);

CalendarMonthPickerMobile.displayName = 'CalendarMonthPickerMobile';
