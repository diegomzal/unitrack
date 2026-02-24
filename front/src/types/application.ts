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

export interface Application {
    _id: string;
    userId: string;
    title: string;
    description: string;
    university: string;
    country: string; // ISO country code
    duration: number | null; // in years
    links: ApplicationLink[];
    notes: string;
    status: ApplicationStatus;
    createdAt: string;
    updatedAt: string;
}

export type ApplicationFormData = Omit<Application, '_id' | 'userId' | 'createdAt' | 'updatedAt'>;

export const EMPTY_FORM_DATA: ApplicationFormData = {
    title: '',
    description: '',
    university: '',
    country: '',
    duration: null,
    links: [],
    notes: '',
    status: 'Not started',
};
