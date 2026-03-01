import { useState, useEffect, useMemo } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    MenuItem,
    Box,
    IconButton,
    Typography,
    Autocomplete,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LinkIcon from '@mui/icons-material/Link';
import {
    APPLICATION_STATUSES,
    EMPTY_FORM_DATA,
    EMPTY_COSTS,
    DEFAULT_REQUIREMENT_COLUMNS,
    type Application,
    type ApplicationFormData,
    type ApplicationLink,
} from '../types/application';
import { COUNTRIES, type Country } from '../data/countries';

interface ApplicationFormDialogProps {
    open: boolean;
    application: Application | null; // null = create mode
    existingUniversities: string[];
    onClose: () => void;
    onSave: (data: ApplicationFormData) => Promise<void>;
}

const ApplicationFormDialog: React.FC<ApplicationFormDialogProps> = ({
    open,
    application,
    existingUniversities,
    onClose,
    onSave,
}) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const [formData, setFormData] = useState<ApplicationFormData>(EMPTY_FORM_DATA);
    const [newLinkUrl, setNewLinkUrl] = useState('');
    const [newLinkName, setNewLinkName] = useState('');
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof ApplicationFormData, string>>>({});

    const isEditing = application !== null;

    const selectedCountry = useMemo(
        () => COUNTRIES.find((c) => c.code === formData.country) ?? null,
        [formData.country],
    );

    useEffect(() => {
        if (open) {
            if (application) {
                // Backward compat: parse old string duration to number
                const rawDuration = application.duration as number | string | null | undefined;
                let parsedDuration: number | null = null;
                if (typeof rawDuration === 'number') {
                    parsedDuration = rawDuration;
                } else if (typeof rawDuration === 'string' && rawDuration.trim()) {
                    const num = parseInt(rawDuration, 10);
                    if (!isNaN(num)) parsedDuration = num;
                }

                // Backward compat: convert old string links to objects and make absolute
                const parsedLinks = application.links.map((link) => {
                    const obj = typeof link === 'string' ? { name: link, url: link } : { ...link };
                    if (!/^https?:\/\//i.test(obj.url)) {
                        obj.url = `https://${obj.url}`;
                    }
                    return obj;
                });

                // Backward compat: old 'location' field mapped to 'country'
                const countryValue = application.country
                    || (application as unknown as Record<string, unknown>).location as string
                    || '';

                setFormData({
                    title: application.title,
                    description: application.description,
                    university: application.university,
                    country: countryValue,
                    duration: parsedDuration,
                    links: parsedLinks,
                    events: application.events ?? [],
                    requirements: application.requirements ?? [],
                    requirementColumns: application.requirementColumns?.length
                        ? application.requirementColumns
                        : [...DEFAULT_REQUIREMENT_COLUMNS],
                    costs: application.costs ?? { ...EMPTY_COSTS },
                    notes: application.notes,
                    status: application.status,
                });
            } else {
                setFormData(EMPTY_FORM_DATA);
            }
            setNewLinkUrl('');
            setNewLinkName('');
            setErrors({});
        }
    }, [open, application]);

    const handleChange = (field: keyof ApplicationFormData) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '') {
            setFormData((prev) => ({ ...prev, duration: null }));
        } else {
            const num = parseInt(value, 10);
            if (!isNaN(num) && num >= 0) {
                setFormData((prev) => ({ ...prev, duration: num }));
            }
        }
    };

    const handleAddLink = () => {
        const trimmedUrl = newLinkUrl.trim();
        if (!trimmedUrl) return;

        let finalUrl = trimmedUrl;
        if (!/^https?:\/\//i.test(finalUrl)) {
            finalUrl = `https://${finalUrl}`;
        }

        const trimmedName = newLinkName.trim() || trimmedUrl;
        const newLink: ApplicationLink = { name: trimmedName, url: finalUrl };
        setFormData((prev) => ({ ...prev, links: [...prev.links, newLink] }));
        setNewLinkUrl('');
        setNewLinkName('');
    };

    const handleRemoveLink = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            links: prev.links.filter((_, i) => i !== index),
        }));
    };

    const handleLinkKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddLink();
        }
    };

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof ApplicationFormData, string>> = {};
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.university.trim()) newErrors.university = 'University is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        try {
            setSaving(true);
            await onSave(formData);
            onClose();
        } catch (err) {
            console.error('Failed to save application:', err);
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
                sx: {
                    borderRadius: fullScreen ? 0 : 3,
                },
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                <Typography variant="h6" component="span">
                    {isEditing ? 'Edit Application' : 'New Application'}
                </Typography>
                <IconButton onClick={onClose} size="small" aria-label="close dialog">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '20px !important' }}>
                {/* Title */}
                <TextField
                    label="Program Title"
                    value={formData.title}
                    onChange={handleChange('title')}
                    error={Boolean(errors.title)}
                    helperText={errors.title}
                    placeholder='e.g., "Master in Computer Science"'
                    required
                />

                {/* University – Autocomplete with freeSolo */}
                <Autocomplete
                    freeSolo
                    options={existingUniversities}
                    value={formData.university}
                    onChange={(_e, newValue) => {
                        setFormData((prev) => ({ ...prev, university: newValue ?? '' }));
                        if (errors.university) {
                            setErrors((prev) => ({ ...prev, university: undefined }));
                        }
                    }}
                    onInputChange={(_e, newValue) => {
                        setFormData((prev) => ({ ...prev, university: newValue }));
                        if (errors.university) {
                            setErrors((prev) => ({ ...prev, university: undefined }));
                        }
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="University"
                            error={Boolean(errors.university)}
                            helperText={errors.university}
                            placeholder='e.g., "MIT"'
                            required
                        />
                    )}
                />

                {/* Country & Duration row */}
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                    {/* Country – Autocomplete dropdown with flags */}
                    <Autocomplete
                        options={COUNTRIES}
                        value={selectedCountry}
                        onChange={(_e, newValue: Country | null) => {
                            setFormData((prev) => ({ ...prev, country: newValue?.code ?? '' }));
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
                            <TextField
                                {...params}
                                label="Country"
                                placeholder="Select a country"
                            />
                        )}
                        sx={{ flex: 1 }}
                        isOptionEqualToValue={(option, value) => option.code === value.code}
                    />

                    {/* Duration – numeric, in years */}
                    <TextField
                        label="Duration (years)"
                        type="number"
                        value={formData.duration ?? ''}
                        onChange={handleDurationChange}
                        placeholder="e.g., 2"
                        slotProps={{
                            htmlInput: { min: 0, step: 1 },
                        }}
                        sx={{ flex: 1, minWidth: 140 }}
                    />
                </Box>

                {/* Status */}
                <TextField
                    select
                    label="Status"
                    value={formData.status}
                    onChange={handleChange('status')}
                >
                    {APPLICATION_STATUSES.map((status) => (
                        <MenuItem key={status} value={status}>
                            {status}
                        </MenuItem>
                    ))}
                </TextField>

                {/* Description */}
                <TextField
                    label="Description"
                    value={formData.description}
                    onChange={handleChange('description')}
                    multiline
                    rows={3}
                    placeholder="Program details, requirements, etc."
                />

                {/* Notes */}
                <TextField
                    label="Notes"
                    value={formData.notes}
                    onChange={handleChange('notes')}
                    multiline
                    rows={3}
                    placeholder="Your personal notes and reminders..."
                />

                {/* Links */}
                <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Links
                    </Typography>

                    {/* Add link inputs */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
                        <TextField
                            size="small"
                            value={newLinkName}
                            onChange={(e) => setNewLinkName(e.target.value)}
                            placeholder="Label (optional)"
                            sx={{ flex: 1 }}
                        />
                        <TextField
                            size="small"
                            value={newLinkUrl}
                            onChange={(e) => setNewLinkUrl(e.target.value)}
                            onKeyDown={handleLinkKeyDown}
                            placeholder="https://..."
                            sx={{ flex: 2 }}
                        />
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={handleAddLink}
                            disabled={!newLinkUrl.trim()}
                            sx={{ minWidth: 'auto', px: 1.5 }}
                        >
                            <AddIcon />
                        </Button>
                    </Box>

                    {/* Links list */}
                    {formData.links.length > 0 && (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 0.5,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                overflow: 'hidden',
                            }}
                        >
                            {formData.links.map((link, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        px: 1.5,
                                        py: 1,
                                        bgcolor: index % 2 === 0 ? 'transparent' : 'action.hover',
                                        '&:hover': { bgcolor: 'action.selected' },
                                        transition: 'background-color 0.15s',
                                    }}
                                >
                                    <LinkIcon fontSize="small" sx={{ color: 'primary.main', opacity: 0.7, flexShrink: 0 }} />
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography
                                            variant="body2"
                                            fontWeight={500}
                                            sx={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {link.name}
                                        </Typography>
                                        {link.name !== link.url && (
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    display: 'block',
                                                }}
                                            >
                                                {link.url}
                                            </Typography>
                                        )}
                                    </Box>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleRemoveLink(index)}
                                        sx={{ color: 'error.main', flexShrink: 0 }}
                                    >
                                        <DeleteOutlineIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} color="inherit">
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={saving}
                    sx={{
                        background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
                        },
                    }}
                >
                    {saving ? 'Saving...' : isEditing ? 'Update' : 'Create'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ApplicationFormDialog;
