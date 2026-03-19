import { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    Box,
    Typography,
    IconButton,
    Tabs,
    Tab,
    Chip,
    LinearProgress,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ChecklistIcon from '@mui/icons-material/Checklist';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SchoolIcon from '@mui/icons-material/School';

import {
    EMPTY_COSTS,
    DEFAULT_REQUIREMENT_COLUMNS,
    type ApplicationEvent,
    type ApplicationRequirement,
    type RequirementColumn,
    type ApplicationCosts,
} from '../types/application';
import type { University, UniversityFormData } from '../types/university';

import EventsTab from './application-details/EventsTab';
import RequirementsTab from './application-details/RequirementsTab';
import CostsTab from './application-details/CostsTab';
import { getCountryByCode } from '../data/countries';

interface UniversityDetailsDialogProps {
    open: boolean;
    university: University | null;
    onClose: () => void;
    onSave?: (id: string, data: Partial<UniversityFormData>) => Promise<void>;
    readOnly?: boolean;
}

const UniversityDetailsDialog: React.FC<UniversityDetailsDialogProps> = ({
    open,
    university,
    onClose,
    onSave,
    readOnly,
}) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const [tab, setTab] = useState(0);
    const [events, setEvents] = useState<ApplicationEvent[]>([]);
    const [requirements, setRequirements] = useState<ApplicationRequirement[]>([]);
    const [requirementColumns, setRequirementColumns] = useState<RequirementColumn[]>([...DEFAULT_REQUIREMENT_COLUMNS]);
    const [costs, setCosts] = useState<ApplicationCosts>({ ...EMPTY_COSTS });
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);

    useEffect(() => {
        if (open && university) {
            setEvents(university.events ?? []);

            const cols = university.requirementColumns?.length
                ? university.requirementColumns
                : [...DEFAULT_REQUIREMENT_COLUMNS];
            setRequirementColumns(cols);

            const rawReqs = university.requirements ?? [];
            const migratedReqs = rawReqs.map((r) => {
                if (r.column) return r;
                const targetCol = r.completed ? cols[cols.length - 1].id : cols[0].id;
                return { ...r, column: targetCol };
            });
            setRequirements(migratedReqs);

            setCosts(university.costs ?? { ...EMPTY_COSTS });
            setTab(0);
            setDirty(false);
        }
    }, [open, university]);

    const handleEventsChange = useCallback((newEvents: ApplicationEvent[]) => {
        setEvents(newEvents);
        setDirty(true);
    }, []);

    const handleRequirementsChange = useCallback((newReqs: ApplicationRequirement[], newCols: RequirementColumn[]) => {
        setRequirements(newReqs);
        setRequirementColumns(newCols);
        setDirty(true);
    }, []);

    const handleCostsChange = useCallback((newCosts: ApplicationCosts) => {
        setCosts(newCosts);
        setDirty(true);
    }, []);

    const handleSave = async () => {
        if (readOnly || !university || !dirty || !onSave) {
            onClose();
            return;
        }
        try {
            setSaving(true);
            const data: Partial<UniversityFormData> = {
                events,
                requirements,
                requirementColumns,
                costs,
            };
            await onSave(university._id, data);
            onClose();
        } catch (err) {
            console.error('Failed to save university details:', err);
        } finally {
            setSaving(false);
        }
    };

    if (!university) return null;

    const country = university.country ? getCountryByCode(university.country) : null;

    return (
        <Dialog
            open={open}
            onClose={handleSave}
            fullScreen={fullScreen}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: fullScreen ? 0 : 3,
                    maxHeight: fullScreen ? '100vh' : '85vh',
                },
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    px: 3,
                    pt: 2.5,
                    pb: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box sx={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SchoolIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                        <Box>
                            <Typography
                                variant="h6"
                                fontWeight={700}
                                sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                            >
                                {university.name}
                            </Typography>
                            {country && (
                                <Typography variant="body2" color="text.secondary">
                                    {country.flag} {country.name}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                    <IconButton onClick={handleSave} size="small" sx={{ mt: -0.5, mr: -1 }}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    University-level deadlines, requirements and costs apply to all programs
                </Typography>

                <Tabs
                    value={tab}
                    onChange={(_e, v) => setTab(v)}
                    textColor="primary"
                    indicatorColor="primary"
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    sx={{
                        minHeight: 40,
                        '.MuiTab-root': {
                            minHeight: 40,
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: { xs: '0.75rem', sm: '0.85rem' },
                            px: { xs: 1, sm: 2 },
                            minWidth: 'auto',
                        },
                    }}
                >
                    <Tab
                        icon={<CalendarMonthIcon sx={{ fontSize: 18 }} />}
                        iconPosition="start"
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                Dates & Deadlines
                                {events.length > 0 && (
                                    <Chip label={events.length} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, bgcolor: 'primary.main', color: '#fff' }} />
                                )}
                            </Box>
                        }
                    />
                    <Tab
                        icon={<ChecklistIcon sx={{ fontSize: 18 }} />}
                        iconPosition="start"
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                Requirements
                                {requirements.length > 0 && (
                                    <Chip
                                        label={`${requirements.filter((r) => r.column === (requirementColumns[requirementColumns.length - 1]?.id)).length}/${requirements.length}`}
                                        size="small"
                                        sx={{
                                            height: 18,
                                            fontSize: '0.65rem',
                                            fontWeight: 700,
                                            bgcolor: requirements.every((r) => r.column === (requirementColumns[requirementColumns.length - 1]?.id)) ? 'success.main' : 'primary.main',
                                            color: '#fff',
                                        }}
                                    />
                                )}
                            </Box>
                        }
                    />
                    <Tab
                        icon={<AttachMoneyIcon sx={{ fontSize: 18 }} />}
                        iconPosition="start"
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                Costs
                            </Box>
                        }
                    />
                </Tabs>
            </Box>

            <DialogContent sx={{ pt: '16px !important', px: 3, pb: 3 }}>
                {tab === 0 && (
                    <EventsTab events={events} onChange={handleEventsChange} />
                )}
                {tab === 1 && (
                    <RequirementsTab requirements={requirements} columns={requirementColumns} onChange={handleRequirementsChange} readOnly={readOnly} />
                )}
                {tab === 2 && (
                    <CostsTab costs={costs} onChange={handleCostsChange} countryCode={university.country} />
                )}
            </DialogContent>

            {saving && (
                <LinearProgress
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 2,
                    }}
                />
            )}
        </Dialog>
    );
};

export default UniversityDetailsDialog;
