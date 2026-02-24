import { useMediaQuery, Box, useTheme } from "@mui/material";
import type { Application } from "../types/application";
import ApplicationCard from "./ApplicationCard";

interface ApplicationGridProps {
    applications: Application[];
    onEdit: (app: Application) => void;
    onDelete: (id: string) => void;
}

export default function ApplicationGrid({ applications, onEdit, onDelete }: ApplicationGridProps) {
    const muiTheme = useTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 2 : 2.5 }}>
            {applications.map((app) => (
                <ApplicationCard
                    key={app._id}
                    application={app}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </Box>
    );
}