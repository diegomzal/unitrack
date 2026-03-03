import { useState, useEffect, useMemo } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    IconButton,
    Typography,
    Autocomplete,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SchoolIcon from '@mui/icons-material/School';

import type { University, UniversityFormData } from '../types/university';
import { COUNTRIES, type Country } from '../data/countries';

interface UniversityFormDialogProps {
    open: boolean;
    university: University;
    onClose: () => void;
    onSave: (id: string, data: Partial<UniversityFormData>) => Promise<void>;
}

const UniversityFormDialog: React.FC<UniversityFormDialogProps> = ({
    open,
    university,
    onClose,
    onSave,
}) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const [name, setName] = useState('');
    const [country, setCountry] = useState('');
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);
    const [nameError, setNameError] = useState('');

    const selectedCountry = useMemo(
        () => COUNTRIES.find((c) => c.code === country) ?? null,
        [country],
    );

    useEffect(() => {
        if (open && university) {
            setName(university.name);
            setCountry(university.country ?? '');
            setNotes(university.notes ?? '');
            setNameError('');
        }
    }, [open, university]);

    const handleSave = async () => {
        if (!name.trim()) {
            setNameError('Name is required');
            return;
        }

        try {
            setSaving(true);
            await onSave(university._id, {
                name: name.trim(),
                country,
                notes,
            });
            onClose();
        } catch (err) {
            console.error('Failed to save university:', err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullScreen={fullScreen}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { borderRadius: fullScreen ? 0 : 3 },
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SchoolIcon sx={{ color: 'primary.main' }} />
                    <Typography variant="h6" component="span">
                        Edit University
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small" aria-label="close dialog">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '20px !important' }}>
                <TextField
                    label="University Name"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        if (nameError) setNameError('');
                    }}
                    error={Boolean(nameError)}
                    helperText={nameError || 'Changing the name will update all linked programs'}
                    required
                />

                <Autocomplete
                    options={COUNTRIES}
                    value={selectedCountry}
                    onChange={(_e, newValue: Country | null) => {
                        setCountry(newValue?.code ?? '');
                    }}
                    getOptionLabel={(option) => option.name}
                    renderOption={(props, option) => {
                        const { key, ...rest } = props;
                        return (
                            <Box
                                component="li"
                                key={key}
                                {...rest}
                                sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}
                            >
                                <Typography component="span" sx={{ fontSize: '1.3rem', lineHeight: 1 }}>
                                    {option.flag}
                                </Typography>
                                <Typography variant="body2">{option.name}</Typography>
                            </Box>
                        );
                    }}
                    renderInput={(params) => (
                        <TextField {...params} label="Country" placeholder="Select a country" />
                    )}
                    isOptionEqualToValue={(option, value) => option.code === value.code}
                />

                <TextField
                    label="Notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    multiline
                    rows={3}
                    placeholder="General notes about this university..."
                />
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} color="inherit">Cancel</Button>
                <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={saving}
                    sx={{
                        background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                        '&:hover': { background: 'linear-gradient(135deg, #60A5FA, #3B82F6)' },
                    }}
                >
                    {saving ? 'Saving...' : 'Update'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UniversityFormDialog;
