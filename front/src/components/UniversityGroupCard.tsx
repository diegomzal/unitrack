import { useState } from 'react';
import {
    Card,
    Typography,
    Box,
    IconButton,
    Tooltip,
    Collapse,
    Chip,
    LinearProgress,
    Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SchoolIcon from '@mui/icons-material/School';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import EventIcon from '@mui/icons-material/Event';
import ChecklistIcon from '@mui/icons-material/Checklist';
import type { Application } from '../types/application';
import { DEFAULT_REQUIREMENT_COLUMNS } from '../types/application';
import type { University } from '../types/university';
import { getCountryByCode } from '../data/countries';
import ApplicationCard from './ApplicationCard';

interface UniversityGroupCardProps {
    university: University;
    applications: Application[];
    onEditApp?: (application: Application) => void;
    onDeleteApp?: (id: string) => void;
    onOpenAppDetails: (application: Application) => void;
    onOpenUniDetails: (university: University) => void;
    onEditUni?: (university: University) => void;
    readOnly?: boolean;
}

const UniversityGroupCard: React.FC<UniversityGroupCardProps> = ({
    university,
    applications,
    onEditApp,
    onDeleteApp,
    onOpenAppDetails,
    onOpenUniDetails,
    onEditUni,
    readOnly,
}) => {
    const [expanded, setExpanded] = useState(true);

    const country = university.country ? getCountryByCode(university.country) : null;

    // University-level requirement progress
    const uniReqs = university.requirements ?? [];
    const uniReqCols = university.requirementColumns?.length ? university.requirementColumns : [...DEFAULT_REQUIREMENT_COLUMNS];
    const uniLastColId = uniReqCols.length > 0 ? uniReqCols[uniReqCols.length - 1].id : null;
    const uniCompletedReqs = uniReqs.filter((r) => r.column === uniLastColId || (!r.column && r.completed)).length;
    const uniReqProgress = uniReqs.length > 0 ? (uniCompletedReqs / uniReqs.length) * 100 : 0;

    const uniEvents = university.events ?? [];

    // Aggregate cost
    const uniCosts = university.costs;
    const annualCost = (uniCosts?.tuitionFeePerYear ?? 0) + (uniCosts?.livingCostPerYear ?? 0);
    const formattedAnnualCost = annualCost > 0
        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(annualCost) + '/yr'
        : null;

    return (
        <Card
            sx={{
                overflow: 'visible',
                transition: 'box-shadow 0.2s',
                '&:hover': {
                    boxShadow: (theme) => theme.shadows[4],
                },
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
            }}
        >
            {/* University header */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'stretch', sm: 'center' },
                    p: 2,
                    gap: 1.5,
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.04), rgba(139, 92, 246, 0.04))',
                }}
            >
                {/* Left: university info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <SchoolIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                        <Typography
                            variant="h6"
                            sx={{
                                fontSize: { xs: '1rem', sm: '1.1rem' },
                                fontWeight: 700,
                                lineHeight: 1.3,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {university.name}
                        </Typography>
                        <Chip
                            label={`${applications.length} program${applications.length !== 1 ? 's' : ''}`}
                            size="small"
                            sx={{
                                height: 20,
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                bgcolor: 'primary.main',
                                color: '#fff',
                            }}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, ml: 3.5 }}>
                        {country && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography component="span" sx={{ fontSize: '1rem', lineHeight: 1 }}>
                                    {country.flag}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {country.name}
                                </Typography>
                            </Box>
                        )}

                        {uniEvents.length > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <EventIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">
                                    {uniEvents.length} event{uniEvents.length > 1 ? 's' : ''}
                                </Typography>
                            </Box>
                        )}

                        {uniReqs.length > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <ChecklistIcon sx={{ fontSize: 14, color: uniReqProgress === 100 ? 'success.main' : 'text.secondary' }} />
                                <Typography variant="caption" color={uniReqProgress === 100 ? 'success.main' : 'text.secondary'} fontWeight={uniReqProgress === 100 ? 600 : 400}>
                                    {uniCompletedReqs}/{uniReqs.length}
                                </Typography>
                            </Box>
                        )}

                        {formattedAnnualCost && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography variant="caption" color="primary.light" fontWeight={600}>
                                    {formattedAnnualCost}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* Right: actions */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        justifyContent: { xs: 'space-between', sm: 'flex-end' },
                    }}
                >
                    <Tooltip title="University Details">
                        <IconButton
                            size="small"
                            onClick={() => onOpenUniDetails(university)}
                            sx={{
                                color: 'primary.main',
                                bgcolor: 'primary.50',
                                '&:hover': { bgcolor: 'primary.100' },
                            }}
                        >
                            <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    {!readOnly && onEditUni && (
                        <Tooltip title="Edit University">
                            <IconButton
                                size="small"
                                onClick={() => onEditUni(university)}
                                sx={{
                                    color: 'text.secondary',
                                    '&:hover': { color: 'primary.main', bgcolor: 'primary.50' },
                                }}
                            >
                                <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                    <IconButton
                        size="small"
                        onClick={() => setExpanded(!expanded)}
                        aria-label={expanded ? 'collapse programs' : 'expand programs'}
                        sx={{
                            color: 'text.secondary',
                            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s',
                        }}
                    >
                        <ExpandMoreIcon />
                    </IconButton>
                </Box>
            </Box>

            {/* Requirements progress bar */}
            {uniReqs.length > 0 && (
                <LinearProgress
                    variant="determinate"
                    value={uniReqProgress}
                    sx={{
                        height: 3,
                        '& .MuiLinearProgress-bar': {
                            background: uniReqProgress === 100
                                ? 'linear-gradient(135deg, #22C55E, #16A34A)'
                                : 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                            transition: 'transform 0.4s ease',
                        },
                        bgcolor: 'rgba(139, 92, 246, 0.06)',
                    }}
                />
            )}

            {/* Programs list */}
            <Collapse in={expanded}>
                <Divider />
                <Box
                    sx={{
                        p: { xs: 1.5, sm: 2 },
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.5,
                        bgcolor: 'rgba(0, 0, 0, 0.01)',
                    }}
                >
                    {applications.map((app) => (
                        <ApplicationCard
                            key={app._id}
                            application={app}
                            onEdit={onEditApp}
                            onDelete={onDeleteApp}
                            onOpenDetails={onOpenAppDetails}
                            readOnly={readOnly}
                        />
                    ))}
                </Box>
            </Collapse>
        </Card>
    );
};

export default UniversityGroupCard;
