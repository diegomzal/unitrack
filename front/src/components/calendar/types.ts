import type { Application, ApplicationEvent } from '../../types/application';

export interface CalendarEvent {
    event: ApplicationEvent;
    application: Application;
    isShared?: boolean;
    ownerName?: string;
}

export interface WeekEventSegment {
    calEvent: CalendarEvent;
    startCol: number;   // 0-indexed column (day of week)
    span: number;       // number of columns to span
    isStart: boolean;   // is this the beginning of the event?
    isEnd: boolean;     // is this the end of the event?
}
