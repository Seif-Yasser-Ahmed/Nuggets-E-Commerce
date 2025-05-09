import API from '../../services/api';
import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    TextField,
    InputAdornment,
    IconButton,
    Chip,
    Alert,
    Pagination,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import {
    Search as SearchIcon,
    Refresh as RefreshIcon,
    Error as ErrorIcon,
    Info as InfoIcon,
    Warning as WarningIcon,
    CheckCircle as SuccessIcon
} from '@mui/icons-material';

const Logs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [rowsPerPage] = useState(10);
    const [logType, setLogType] = useState('all');

    // Mock data for logs until API endpoint is implemented
    const mockLogs = [
        { id: 1, timestamp: new Date().toISOString(), level: 'error', message: 'Failed to process order #1234', source: 'orderController.js', user: 'admin@example.com' },
        { id: 2, timestamp: new Date(Date.now() - 3600000).toISOString(), level: 'info', message: 'User logged in successfully', source: 'authController.js', user: 'customer@example.com' },
        { id: 3, timestamp: new Date(Date.now() - 7200000).toISOString(), level: 'warning', message: 'Low stock alert for product ID 5678', source: 'inventoryService.js', user: 'system' },
        { id: 4, timestamp: new Date(Date.now() - 86400000).toISOString(), level: 'info', message: 'New product added to catalog', source: 'productController.js', user: 'admin@example.com' },
        { id: 5, timestamp: new Date(Date.now() - 172800000).toISOString(), level: 'error', message: 'Database connection failure', source: 'server.js', user: 'system' }
    ];

    // Fetch logs on component mount
    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            // This would be replaced with an actual API call when the endpoint is ready
            // const response = await API.get('/admin/logs');
            // setLogs(response.data);

            // Using mock data for now
            setTimeout(() => {
                setLogs(mockLogs);
                setLoading(false);
            }, 800);
        } catch (error) {
            console.error('Error fetching logs:', error);
            setError('Failed to fetch logs');
            setLoading(false);
        }
    };

    // Filter logs based on search and type
    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.user.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = logType === 'all' || log.level === logType;

        return matchesSearch && matchesType;
    });

    // Paginate logs
    const paginatedLogs = filteredLogs.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    // Get chip color based on log level
    const getLevelColor = (level) => {
        switch (level.toLowerCase()) {
            case 'error': return 'error';
            case 'warning': return 'warning';
            case 'info': return 'info';
            case 'success': return 'success';
            default: return 'default';
        }
    };

    // Get icon based on log level
    const getLevelIcon = (level) => {
        switch (level.toLowerCase()) {
            case 'error': return <ErrorIcon />;
            case 'warning': return <WarningIcon />;
            case 'info': return <InfoIcon />;
            case 'success': return <SuccessIcon />;
            default: return null;
        }
    };

    // Format timestamp for display
    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleString();
    };

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ mb: 3 }}>System Logs</Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Search and Filter Controls */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
                flexWrap: 'wrap',
                gap: 2
            }}>
                <TextField
                    placeholder="Search logs..."
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ width: { xs: '100%', sm: '300px' } }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Log Type</InputLabel>
                        <Select
                            value={logType}
                            label="Log Type"
                            onChange={(e) => setLogType(e.target.value)}
                        >
                            <MenuItem value="all">All Types</MenuItem>
                            <MenuItem value="error">Errors</MenuItem>
                            <MenuItem value="warning">Warnings</MenuItem>
                            <MenuItem value="info">Info</MenuItem>
                            <MenuItem value="success">Success</MenuItem>
                        </Select>
                    </FormControl>

                    <IconButton
                        color="primary"
                        onClick={fetchLogs}
                        title="Refresh logs"
                    >
                        <RefreshIcon />
                    </IconButton>
                </Box>
            </Box>

            {/* Logs Table */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Timestamp</TableCell>
                                    <TableCell>Level</TableCell>
                                    <TableCell>Message</TableCell>
                                    <TableCell>Source</TableCell>
                                    <TableCell>User</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedLogs.length > 0 ? (
                                    paginatedLogs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell>{formatTimestamp(log.timestamp)}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={getLevelIcon(log.level)}
                                                    label={log.level.toUpperCase()}
                                                    color={getLevelColor(log.level)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>{log.message}</TableCell>
                                            <TableCell>{log.source}</TableCell>
                                            <TableCell>{log.user}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
                                            No logs found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Pagination */}
                    {filteredLogs.length > rowsPerPage && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                            <Pagination
                                count={Math.ceil(filteredLogs.length / rowsPerPage)}
                                page={page}
                                onChange={(e, newPage) => setPage(newPage)}
                                color="primary"
                            />
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
};

export default Logs;
