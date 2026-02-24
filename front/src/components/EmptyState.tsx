import { Box, Typography, Button } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import AddIcon from '@mui/icons-material/Add';

interface EmptyStateProps {
    onAdd: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onAdd }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 10,
                px: 3,
                textAlign: 'center',
            }}
        >
            <Box
                sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(0, 229, 255, 0.1))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                }}
            >
                <SchoolIcon sx={{ fontSize: 48, color: 'primary.light' }} />
            </Box>
            <Typography variant="h5" gutterBottom>
                No Applications Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mb: 4 }}>
                Start tracking your university applications. Add your first program to get organized and stay on top of deadlines.
            </Typography>
            <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={onAdd}
                sx={{
                    background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
                    },
                }}
            >
                Add Your First Application
            </Button>
        </Box>
    );
};

export default EmptyState;
