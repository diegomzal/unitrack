import type {
    ApplicationEvent,
    ApplicationRequirement,
    RequirementColumn,
    ApplicationCosts,
} from './application';
import { EMPTY_COSTS, DEFAULT_REQUIREMENT_COLUMNS } from './application';

export interface University {
    _id: string;
    userId: string;
    name: string;
    country: string;
    events: ApplicationEvent[];
    requirements: ApplicationRequirement[];
    requirementColumns: RequirementColumn[];
    costs: ApplicationCosts;
    notes: string;
    createdAt: string;
    updatedAt: string;
}

export type UniversityFormData = Omit<University, '_id' | 'userId' | 'createdAt' | 'updatedAt'>;

export const EMPTY_UNIVERSITY_FORM_DATA: UniversityFormData = {
    name: '',
    country: '',
    events: [],
    requirements: [],
    requirementColumns: [...DEFAULT_REQUIREMENT_COLUMNS],
    costs: { ...EMPTY_COSTS },
    notes: '',
};
