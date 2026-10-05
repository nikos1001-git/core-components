export interface CalendarMonthPickerDesktopProps {
    /**
     * Дополнительный класс
     */
    className?: string;

    /**
     * Выбранный месяц (timestamp любого дня месяца)
     */
    value?: number;

    /**
     * Минимальная дата, доступная для выбора (timestamp)
     */
    minDate?: number;

    /**
     * Максимальная дата, доступная для выбора (timestamp)
     */
    maxDate?: number;

    /**
     * Обработчик выбора месяца. Возвращает timestamp первого дня выбранного месяца
     */
    onChange?: (month?: number) => void;

    /**
     * Должен ли календарь подстраиваться под ширину родителя.
     */
    responsive?: boolean;

    /**
     * Идентификатор для систем автоматизированного тестирования
     */
    dataTestId?: string;
}

export interface CalendarMonthPickerMobileProps
    extends Omit<CalendarMonthPickerDesktopProps, 'responsive'> {
    /**
     * Управление видимостью модалки
     */
    open: boolean;

    /**
     * Обработчик закрытия модалки
     */
    onClose?: () => void;

    /**
     * Обработчик клика на кнопку «Выбрать»
     */
    onApply?: () => void;

    /**
     * Заголовок календаря
     * @default Выберите месяц
     */
    title?: string;

    /**
     * Нужно ли рендерить шапку
     */
    hasHeader?: boolean;

    /**
     * Наличие кнопки «Назад» в шапке
     */
    hasBackButton?: boolean;

    /**
     * Обработчик нажатия на кнопку «Назад»
     */
    onBack?: () => void;

    /**
     * Контент кнопки «Отмена»
     * @default Отмена
     */
    cancelButtonContent?: string;

    /**
     * Контент кнопки «Выбрать»
     * @default Выбрать
     */
    selectButtonContent?: string;

    /**
     * Контент кнопки «Сбросить»
     * @default Сбросить
     */
    resetButtonContent?: string;
}

export interface CalendarMonthPickerProps
    extends CalendarMonthPickerDesktopProps,
        CalendarMonthPickerMobileProps {
    /**
     * Контрольная точка, с нее начинается desktop версия
     * @default 1024
     */
    breakpoint?: number;

    /**
     * Версия, которая будет использоваться при серверном рендеринге
     */
    client?: 'desktop' | 'mobile';
}
