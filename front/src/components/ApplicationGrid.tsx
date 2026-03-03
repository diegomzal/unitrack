import { useMemo } from 'react';
import { useMediaQuery, Box, useTheme } from '@mui/material';
import type { Application } from '../types/application';
import type { University } from '../types/university';
import ApplicationCard from './ApplicationCard';
import UniversityGroupCard from './UniversityGroupCard';

interface ApplicationGridProps {
    applications: Application[];
    universities: University[];
    onEdit?: (app: Application) => void;
    onDelete?: (id: string) => void;
    onOpenDetails: (app: Application) => void;
    onOpenUniDetails: (university: University) => void;
    onEditUni?: (university: University) => void;
    readOnly?: boolean;
}

interface GroupedItem {
    type: 'university';
    university: University;
    applications: Application[];
}

interface UngroupedItem {
    type: 'ungrouped';
    application: Application;
}

type GridItem = GroupedItem | UngroupedItem;

export default function ApplicationGrid({
    applications,
    universities,
    onEdit,
    onDelete,
    onOpenDetails,
    onOpenUniDetails,
    onEditUni,
    readOnly,
}: ApplicationGridProps) {
    const muiTheme = useTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

    const gridItems = useMemo((): GridItem[] => {
        const uniMap = new Map<string, University>();
        universities.forEach((uni) => uniMap.set(uni._id, uni));

        // Group apps by universityId
        const grouped = new Map<string, Application[]>();
        const ungrouped: Application[] = [];

        applications.forEach((app) => {
            if (app.universityId && uniMap.has(app.universityId)) {
                const list = grouped.get(app.universityId) || [];
                list.push(app);
                grouped.set(app.universityId, list);
            } else {
                ungrouped.push(app);
            }
        });

        const items: GridItem[] = [];

        // Add university groups
        grouped.forEach((apps, uniId) => {
            const uni = uniMap.get(uniId);
            if (uni) {
                items.push({ type: 'university', university: uni, applications: apps });
            }
        });

        // Sort university groups by name
        items.sort((a, b) => {
            if (a.type === 'university' && b.type === 'university') {
                return a.university.name.localeCompare(b.university.name);
            }
            return 0;
        });

        // Add ungrouped apps
        ungrouped.forEach((app) => {
            items.push({ type: 'ungrouped', application: app });
        });

        return items;
    }, [applications, universities]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 2 : 2.5 }}>
            {gridItems.map((item) => {
                if (item.type === 'university') {
                    return (
                        <UniversityGroupCard
                            key={`uni-${item.university._id}`}
                            university={item.university}
                            applications={item.applications}
                            onEditApp={onEdit}
                            onDeleteApp={onDelete}
                            onOpenAppDetails={onOpenDetails}
                            onOpenUniDetails={onOpenUniDetails}
                            onEditUni={onEditUni}
                            readOnly={readOnly}
                        />
                    );
                }
                return (
                    <ApplicationCard
                        key={item.application._id}
                        application={item.application}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onOpenDetails={onOpenDetails}
                        readOnly={readOnly}
                    />
                );
            })}
        </Box>
    );
}