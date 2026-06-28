import { ChevronLeft, ChevronRight } from 'lucide-react';

const GOLD    = '#d4a017';
const BORDER  = '#e2e8f0';
const TEXT    = '#1e293b';
const MUTED   = '#64748b';
const SURFACE = '#ffffff';

export function DateHierarchyNav({ nav }) {
  const {
    monthLabel, weeks, currentWeek,
    selectedDate, goToPrevMonth, goToNextMonth,
    selectWeek, selectDay, isSameDay, weekdayLabels,
  } = nav;

  return (
    <div style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}` }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '14px 0' }}>
        <button onClick={goToPrevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, display: 'flex' }}>
          <ChevronLeft size={20} />
        </button>
        <span style={{ fontSize: 16, fontWeight: 700, color: TEXT, minWidth: 160, textAlign: 'center' }}>
          {monthLabel}
        </span>
        <button onClick={goToNextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, display: 'flex' }}>
          <ChevronRight size={20} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '0 24px 12px', overflowX: 'auto' }}>
        {weeks.map(week => {
          const isActive = week.weekNumber === currentWeek?.weekNumber;
          return (
            <button
              key={week.weekNumber}
              onClick={() => selectWeek(week)}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                border: isActive ? `1.5px solid ${GOLD}` : `1px solid ${BORDER}`,
                background: isActive ? `${GOLD}15` : 'transparent',
                color: isActive ? '#b88a12' : MUTED,
                cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              Semana {week.weekNumber}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 6, padding: '0 24px 14px' }}>
        {currentWeek?.days.map((day, i) => {
          const isActive = isSameDay(day, selectedDate);
          return (
            <button
              key={i}
              onClick={() => selectDay(day)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                padding: '8px 4px', borderRadius: 10,
                border: isActive ? `1.5px solid ${GOLD}` : '1px solid transparent',
                background: isActive ? GOLD : '#f8fafc',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 10, fontWeight: 700, color: isActive ? '#ffffff' : MUTED, textTransform: 'uppercase' }}>
                {weekdayLabels[i]}
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: isActive ? '#ffffff' : TEXT }}>
                {day.getDate()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}