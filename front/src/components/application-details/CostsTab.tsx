import React from 'react';
import { Box, Typography, TextField, InputAdornment } from '@mui/material';
import { type ApplicationCosts } from '../../types/application';

interface CostsTabProps {
    costs: ApplicationCosts;
    onChange: (costs: ApplicationCosts) => void;
    readOnly?: boolean;
}

const formatCurrency = (value: number | null): string => {
    if (value === null || value === 0) return '$0';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

const CostsTab: React.FC<CostsTabProps> = ({ costs, onChange, readOnly }) => {
    const tuition = costs.tuitionFeePerYear ?? 0;
    const living = costs.livingCostPerYear ?? 0;
    const totalAnnual = tuition + living;

    const handleNumberChange =
        (field: 'tuitionFeePerYear' | 'livingCostPerYear') =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                const raw = e.target.value;
                if (raw === '') {
                    onChange({ ...costs, [field]: null });
                } else {
                    const num = parseFloat(raw);
                    if (!isNaN(num) && num >= 0) {
                        onChange({ ...costs, [field]: num });
                    }
                }
            };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Annual cost summary */}
            <Box
                sx={{
                    p: 2.5,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(139, 92, 246, 0.08))',
                    border: '1px solid',
                    borderColor: 'rgba(59, 130, 246, 0.15)',
                }}
            >
                <Typography
                    variant="caption"
                    fontWeight={600}
                    color="text.secondary"
                    sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', mb: 1 }}
                >
                    Estimated Annual Cost
                </Typography>
                <Typography variant="h4" fontWeight={800} sx={{ color: 'primary.main', lineHeight: 1.2 }}>
                    {formatCurrency(totalAnnual)}
                    <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                        / year
                    </Typography>
                </Typography>
                {(tuition > 0 || living > 0) && (
                    <Box sx={{ display: 'flex', gap: 2, mt: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#3B82F6' }} />
                            <Typography variant="caption" color="text.secondary">
                                Tuition: {formatCurrency(tuition)}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#8B5CF6' }} />
                            <Typography variant="caption" color="text.secondary">
                                Living: {formatCurrency(living)}
                            </Typography>
                        </Box>
                    </Box>
                )}
            </Box>

            {/* Tuition Fee */}
            <TextField
                label="Tuition Fee (per year)"
                type="number"
                value={costs.tuitionFeePerYear ?? ''}
                onChange={handleNumberChange('tuitionFeePerYear')}
                placeholder="e.g., 15000"
                fullWidth
                slotProps={{
                    htmlInput: { min: 0, step: 100 },
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">$</InputAdornment>
                        ),
                        readOnly,
                    },
                }}
            />

            {/* Living Cost */}
            <TextField
                label="Living Cost (per year)"
                type="number"
                value={costs.livingCostPerYear ?? ''}
                onChange={handleNumberChange('livingCostPerYear')}
                placeholder="e.g., 12000"
                fullWidth
                slotProps={{
                    htmlInput: { min: 0, step: 100 },
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">$</InputAdornment>
                        ),
                        readOnly,
                    },
                }}
            />

            {/* Scholarship Info */}
            <TextField
                label="Scholarships Available"
                value={costs.scholarshipInfo}
                onChange={(e) => onChange({ ...costs, scholarshipInfo: e.target.value })}
                multiline
                rows={3}
                fullWidth
                placeholder="e.g., Merit-based scholarship up to 50%, need-based aid available..."
                slotProps={{
                    input: { readOnly },
                }}
            />
        </Box>
    );
};

export default CostsTab;
