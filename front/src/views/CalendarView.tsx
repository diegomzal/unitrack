import { Typography, Container, Box } from '@mui/material';

export default function CalendarView() {
    return (
        <Container maxWidth="lg" sx={{ py: 3, px: { xs: 2, sm: 3 } }}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h5" color="text.secondary">
                    Calendar View
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                    Coming soon!
                </Typography>
            </Box>
        </Container>
    );
}
