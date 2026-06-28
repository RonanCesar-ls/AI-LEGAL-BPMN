import { useState, useMemo, useCallback } from 'react';

const WEEKDAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const MONTH_LABELS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

// Segunda-feira como início da semana (padrão de trabalho)
function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = domingo
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function useDateNavigation() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [selectedDate, setSelectedDate] = useState(() => new Date());

  // Todas as semanas que tocam o mês atual
  const weeks = useMemo(() => {
    const year  = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay  = new Date(year, month + 1, 0);

    let cursor = startOfWeek(firstDay);
    const result = [];
    let weekNumber = 1;

    while (cursor <= lastDay) {
      const days = Array.from({ length: 7 }, (_, i) => addDays(cursor, i));
      result.push({ weekNumber, startDate: days[0], endDate: days[6], days });
      cursor = addDays(cursor, 7);
      weekNumber++;
    }

    return result;
  }, [currentMonth]);

  // Semana que contém a data selecionada
  const currentWeek = useMemo(() => {
    return weeks.find(w => w.days.some(d => isSameDay(d, selectedDate))) ?? weeks[0];
  }, [weeks, selectedDate]);

  const goToPrevMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const selectWeek = useCallback((week) => setSelectedDate(week.days[0]), []);
  const selectDay  = useCallback((day) => setSelectedDate(day), []);

  const monthLabel = `${MONTH_LABELS[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;

  return {
    currentMonth, monthLabel,
    weeks, currentWeek,
    selectedDate, selectedDateISO: toISODate(selectedDate),
    goToPrevMonth, goToNextMonth,
    selectWeek, selectDay,
    isSameDay,
    weekdayLabels: WEEKDAY_LABELS,
  };
}