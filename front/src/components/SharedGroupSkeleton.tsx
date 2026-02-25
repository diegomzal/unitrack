import { Box, Skeleton } from '@mui/material';

interface SharedGroupSkeletonProps {
    count?: number;
}

/**
 * Skeleton placeholder that mirrors the shared-group accordion layout:
 * avatar + owner name + email + apps chip
 */
export default function SharedGroupSkeleton({ count = 2 }: SharedGroupSkeletonProps) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <Box
                    key={i}
                    sx={{
                        mb: 2,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                    }}
                >
                    <Skeleton variant="circular" width={32} height={32} />
                    <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width={`${35 + i * 15}%`} sx={{ fontSize: '1rem' }} />
                        <Skeleton variant="text" width={`${50 + i * 10}%`} sx={{ fontSize: '0.75rem' }} />
                    </Box>
                    <Skeleton variant="rounded" width={52} height={24} sx={{ borderRadius: 3 }} />
                </Box>
            ))}
        </>
    );
}
