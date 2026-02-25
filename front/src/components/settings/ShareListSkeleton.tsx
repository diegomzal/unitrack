import {
    ListItem,
    ListItemAvatar,
    ListItemText,
    Skeleton,
    Box,
} from '@mui/material';

interface ShareListSkeletonProps {
    /** Number of skeleton rows to render */
    count?: number;
    /** Number of action icon placeholders per row */
    actions?: number;
}

export default function ShareListSkeleton({ count = 3, actions = 1 }: ShareListSkeletonProps) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <ListItem
                    key={i}
                    sx={{
                        py: 1.5,
                        px: 1,
                        borderRadius: 2,
                    }}
                >
                    <ListItemAvatar>
                        <Skeleton variant="circular" width={36} height={36} />
                    </ListItemAvatar>
                    <ListItemText
                        primary={<Skeleton variant="text" width="40%" sx={{ fontSize: '0.875rem' }} />}
                        secondary={<Skeleton variant="text" width="60%" sx={{ fontSize: '0.75rem' }} />}
                    />
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {Array.from({ length: actions }).map((_, j) => (
                            <Skeleton key={j} variant="circular" width={28} height={28} />
                        ))}
                    </Box>
                </ListItem>
            ))}
        </>
    );
}
