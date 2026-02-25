import { Box, TextField, InputAdornment, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import { APPLICATION_STATUSES } from '../../types/application';

interface ApplicationsFilterBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    statusFilter: string;
    onStatusChange: (status: string) => void;
    sortOption: string;
    onSortChange: (sort: string) => void;
    disabled?: boolean;
}

export default function ApplicationsFilterBar({
    searchQuery,
    onSearchChange,
    statusFilter,
    onStatusChange,
    sortOption,
    onSortChange,
    disabled = false,
}: ApplicationsFilterBarProps) {
    return (
        <Box
            sx={{
                display: 'flex',
                gap: 1.5,
                mb: 3,
                flexDirection: { xs: 'column', sm: 'row' },
            }}
        >
            <TextField
                fullWidth
                size="small"
                placeholder="Search programs, universities..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                disabled={disabled}
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                            </InputAdornment>
                        ),
                    },
                }}
                sx={{ flexGrow: 1 }}
            />
            <TextField
                select
                size="small"
                value={statusFilter}
                onChange={(e) => onStatusChange(e.target.value)}
                disabled={disabled}
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <FilterListIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                            </InputAdornment>
                        ),
                    },
                }}
                sx={{ minWidth: 160 }}
            >
                <MenuItem value="All">All statuses</MenuItem>
                {APPLICATION_STATUSES.map((status) => (
                    <MenuItem key={status} value={status}>
                        {status}
                    </MenuItem>
                ))}
            </TextField>
            <TextField
                select
                size="small"
                value={sortOption}
                onChange={(e) => onSortChange(e.target.value)}
                disabled={disabled}
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <SortIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                            </InputAdornment>
                        ),
                    },
                }}
                sx={{ minWidth: 160 }}
            >
                <MenuItem value="newest">Newest first</MenuItem>
                <MenuItem value="oldest">Oldest first</MenuItem>
                <MenuItem value="title_asc">Title (A-Z)</MenuItem>
                <MenuItem value="title_desc">Title (Z-A)</MenuItem>
                <MenuItem value="university_asc">University (A-Z)</MenuItem>
                <MenuItem value="university_desc">University (Z-A)</MenuItem>
            </TextField>
        </Box>
    );
}
