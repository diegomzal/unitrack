export const APPLICATION_STATUSES = [
    'Not started',
    'In progress',
    'Submitted',
    'Interview',
    'Accepted',
    'Rejected',
    'Waitlisted',
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export interface ApplicationLink {
    name: string;
    url: string;
}

export const EVENT_TYPES = ['deadline', 'date-range', 'event'] as const;

export type ApplicationEventType = (typeof EVENT_TYPES)[number];

export const EVENT_TYPE_LABELS: Record<ApplicationEventType, string> = {
    deadline: 'Deadline',
    'date-range': 'Date Range',
    event: 'Event',
};

export const EVENT_COLORS = [
    '#EF4444', // red
    '#F97316', // orange
    '#EAB308', // yellow
    '#22C55E', // green
    '#3B82F6', // blue
    '#8B5CF6', // violet
    '#EC4899', // pink
    '#06B6D4', // cyan
] as const;

export interface ApplicationEvent {
    id: string;
    title: string;
    type: ApplicationEventType;
    date: string;       // ISO date string (YYYY-MM-DD)
    endDate?: string;    // ISO date string, only for 'date-range'
    color: string;
}

export interface RequirementColumn {
    id: string;
    title: string;
}

export const DEFAULT_REQUIREMENT_COLUMNS: RequirementColumn[] = [
    { id: 'todo', title: 'To Do' },
    { id: 'done', title: 'Done' },
];

export interface ApplicationRequirement {
    id: string;
    title: string;
    column: string;     // column id
    completed?: boolean; // legacy field for backward compat
}

export interface ApplicationCosts {
    tuitionFeePerYear: number | null;
    livingCostPerYear: number | null;
    scholarshipInfo: string;
}

export interface Application {
    _id: string;
    userId: string;
    title: string;
    description: string;
    university: string;
    country: string; // ISO country code
    duration: number | null; // in years
    links: ApplicationLink[];
    events: ApplicationEvent[];
    requirements: ApplicationRequirement[];
    requirementColumns: RequirementColumn[];
    costs: ApplicationCosts;
    notes: string;
    status: ApplicationStatus;
    createdAt: string;
    updatedAt: string;
}

export type ApplicationFormData = Omit<Application, '_id' | 'userId' | 'createdAt' | 'updatedAt'>;

export const EMPTY_COSTS: ApplicationCosts = {
    tuitionFeePerYear: null,
    livingCostPerYear: null,
    scholarshipInfo: '',
};

export const EMPTY_FORM_DATA: ApplicationFormData = {
    title: '',
    description: '',
    university: '',
    country: '',
    duration: null,
    links: [],
    events: [],
    requirements: [],
    requirementColumns: [...DEFAULT_REQUIREMENT_COLUMNS],
    costs: { ...EMPTY_COSTS },
    notes: '',
    status: 'Not started',
};
