import { DayOfWeek } from '@/types/commute';

export const DAYS_OF_WEEK: { value: DayOfWeek; label: string; short: string }[] = [
  { value: 'monday', label: 'Segunda-feira', short: 'Seg' },
  { value: 'tuesday', label: 'Terça-feira', short: 'Ter' },
  { value: 'wednesday', label: 'Quarta-feira', short: 'Qua' },
  { value: 'thursday', label: 'Quinta-feira', short: 'Qui' },
  { value: 'friday', label: 'Sexta-feira', short: 'Sex' },
  { value: 'saturday', label: 'Sábado', short: 'Sáb' },
  { value: 'sunday', label: 'Domingo', short: 'Dom' },
];

export const parseTime = (time: string): { hours: number; minutes: number } => {
  const [hours, minutes] = time.split(':').map(Number);
  return { hours, minutes };
};

export const formatTime = (hours: number, minutes: number): string => {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export const getCurrentTime = (): string => {
  const now = new Date();
  return formatTime(now.getHours(), now.getMinutes());
};

export const compareTime = (time1: string, time2: string): number => {
  const t1 = parseTime(time1);
  const t2 = parseTime(time2);
  
  if (t1.hours !== t2.hours) {
    return t1.hours - t2.hours;
  }
  return t1.minutes - t2.minutes;
};

export const isTimeBetween = (current: string, start: string, end: string): boolean => {
  if (start <= end) {
    // Horário normal (ex: 08:00 - 18:00)
    return current >= start && current <= end;
  } else {
    // Horário que cruza meia-noite (ex: 22:00 - 08:00)
    return current >= start || current <= end;
  }
};

export const getDayOfWeek = (date: Date = new Date()): DayOfWeek => {
  const dayNames: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return dayNames[date.getDay()];
};

export const getNextOccurrence = (daysOfWeek: DayOfWeek[], startTime: string): Date | null => {
  const now = new Date();
  const currentDay = getDayOfWeek(now);
  const currentTime = getCurrentTime();
  
  const daysOfWeekOrder: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const currentDayIndex = daysOfWeekOrder.indexOf(currentDay);
  
  // Verificar se hoje é um dos dias e se o horário ainda não passou
  if (daysOfWeek.includes(currentDay) && startTime > currentTime) {
    const [hours, minutes] = startTime.split(':').map(Number);
    const nextDate = new Date(now);
    nextDate.setHours(hours, minutes, 0, 0);
    return nextDate;
  }
  
  // Procurar nos próximos dias
  for (let i = 1; i < 7; i++) {
    const nextDayIndex = (currentDayIndex + i) % 7;
    const nextDay = daysOfWeekOrder[nextDayIndex];
    
    if (daysOfWeek.includes(nextDay)) {
      const [hours, minutes] = startTime.split(':').map(Number);
      const nextDate = new Date(now);
      nextDate.setDate(nextDate.getDate() + i);
      nextDate.setHours(hours, minutes, 0, 0);
      return nextDate;
    }
  }
  
  return null;
};

