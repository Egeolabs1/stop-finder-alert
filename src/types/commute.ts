export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface RecurringAlarm {
  id: string;
  name: string;
  destination: {
    name: string;
    address: string;
    location: [number, number];
  };
  radius: number;
  daysOfWeek: DayOfWeek[];
  startTime: string; // HH:mm format
  endTime?: string; // HH:mm format (opcional)
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommuteSettings {
  autoStart: boolean;
  autoEnd: boolean;
  silentMode: boolean;
  silentStartTime?: string; // HH:mm format
  silentEndTime?: string; // HH:mm format
  workingDays: DayOfWeek[];
}

export interface SilentModeSchedule {
  enabled: boolean;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  daysOfWeek?: DayOfWeek[]; // Se não especificado, aplica todos os dias
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  location?: {
    name: string;
    address: string;
    coordinates?: [number, number];
  };
  alarmRadius?: number;
}


export interface RecurringAlarm {
  id: string;
  name: string;
  destination: {
    name: string;
    address: string;
    location: [number, number];
  };
  radius: number;
  daysOfWeek: DayOfWeek[];
  startTime: string; // HH:mm format
  endTime?: string; // HH:mm format (opcional)
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommuteSettings {
  autoStart: boolean;
  autoEnd: boolean;
  silentMode: boolean;
  silentStartTime?: string; // HH:mm format
  silentEndTime?: string; // HH:mm format
  workingDays: DayOfWeek[];
}

export interface SilentModeSchedule {
  enabled: boolean;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  daysOfWeek?: DayOfWeek[]; // Se não especificado, aplica todos os dias
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  location?: {
    name: string;
    address: string;
    coordinates?: [number, number];
  };
  alarmRadius?: number;
}





