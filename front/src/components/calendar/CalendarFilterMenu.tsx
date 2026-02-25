import { Menu, MenuItem, Checkbox, ListItemText, ListSubheader, Divider } from '@mui/material';
import type { SharedGroup } from '../../hooks/useSharedApplications';

interface CalendarFilterMenuProps {
    anchorEl: null | HTMLElement;
    onClose: () => void;
    showMyEvents: boolean;
    onToggleMyEvents: () => void;
    sharedGroups: SharedGroup[];
    hiddenShareIds: string[];
    onToggleShareGroup: (shareId: string) => void;
}

export function CalendarFilterMenu({
    anchorEl,
    onClose,
    showMyEvents,
    onToggleMyEvents,
    sharedGroups,
    hiddenShareIds,
    onToggleShareGroup,
}: CalendarFilterMenuProps) {
    return (
        <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={onClose}
            PaperProps={{
                sx: { minWidth: 200, borderRadius: 2, mt: 1 },
            }}
        >
            <ListSubheader sx={{ lineHeight: '32px', bgcolor: 'transparent' }}>
                Show events for
            </ListSubheader>
            <MenuItem onClick={onToggleMyEvents}>
                <Checkbox checked={showMyEvents} size="small" />
                <ListItemText primary="My Applications" primaryTypographyProps={{ variant: 'body2' }} />
            </MenuItem>
            {sharedGroups.length > 0 && <Divider sx={{ my: 0.5 }} />}
            {sharedGroups.map((group) => {
                const isVisible = !hiddenShareIds.includes(group.share._id);
                return (
                    <MenuItem
                        key={group.share._id}
                        onClick={() => onToggleShareGroup(group.share._id)}
                    >
                        <Checkbox checked={isVisible} size="small" />
                        <ListItemText
                            primary={group.share.ownerName || group.share.ownerEmail}
                            secondary={group.share.ownerName ? group.share.ownerEmail : undefined}
                            primaryTypographyProps={{ variant: 'body2' }}
                            secondaryTypographyProps={{ variant: 'caption' }}
                        />
                    </MenuItem>
                );
            })}
        </Menu>
    );
}
