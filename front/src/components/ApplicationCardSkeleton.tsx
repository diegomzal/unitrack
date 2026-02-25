import { Card, Box, Skeleton } from '@mui/material';

interface ApplicationCardSkeletonProps {
    count?: number;
}

/**
 * Skeleton placeholder that mirrors ApplicationCard's layout:
 * title + status chip | university + country + duration | action buttons
 */
export default function ApplicationCardSkeleton({ count = 6 }: ApplicationCardSkeletonProps) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <Card key={i} sx={{ opacity: 1 - i * 0.1 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'stretch', sm: 'center' },
                            p: 2,
                            gap: 2,
                        }}
                    >
                        {/* Left: text content */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            {/* Title row + status chip */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                                <Skeleton
                                    variant="text"
                                    width={`${55 + (i % 3) * 10}%`}
                                    sx={{ fontSize: '1.15rem' }}
                                />
                                <Skeleton
                                    variant="rounded"
                                    width={72}
                                    height={24}
                                    sx={{ borderRadius: 3, flexShrink: 0 }}
                                />
                            </Box>

                            {/* Metadata row */}
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mt: 1 }}>
                                <Skeleton variant="text" width={120} sx={{ fontSize: '0.875rem' }} />
                                <Skeleton variant="text" width={80} sx={{ fontSize: '0.75rem' }} />
                                <Skeleton variant="text" width={60} sx={{ fontSize: '0.75rem' }} />
                            </Box>
                        </Box>

                        {/* Right: action icons */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: { xs: 'space-between', sm: 'flex-end' },
                                gap: 0.5,
                                mt: { xs: 1, sm: 0 },
                                pt: { xs: 1.5, sm: 0 },
                                borderTop: { xs: '1px solid', sm: 'none' },
                                borderColor: 'divider',
                                minWidth: { sm: '170px' },
                            }}
                        >
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <Skeleton variant="circular" width={28} height={28} />
                                <Skeleton variant="circular" width={28} height={28} />
                                <Skeleton variant="circular" width={28} height={28} />
                            </Box>
                            <Skeleton variant="circular" width={28} height={28} />
                        </Box>
                    </Box>
                </Card>
            ))}
        </>
    );
}
