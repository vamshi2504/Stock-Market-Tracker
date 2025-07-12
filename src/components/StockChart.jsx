import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Card, 
  CardContent,
  CircularProgress,
  Alert,
  Fade,
  Switch,
  FormControlLabel,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  IconButton,
  Divider
} from '@mui/material';
import { Search, TrendingUp, ShowChart, Refresh, CalendarToday, DateRange, Schedule, Add, Remove, Compare } from '@mui/icons-material';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const StockChart = () => {
  const [symbol, setSymbol] = useState('');
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [timeInterval, setTimeInterval] = useState('daily'); // daily, weekly, monthly
  const [intradayData, setIntradayData] = useState(null);
  const [compareSymbols, setCompareSymbols] = useState([]); // Array of symbols to compare
  const [compareInput, setCompareInput] = useState('');
  const [stocksData, setStocksData] = useState({}); // Store data for all stocks

  // Color palette for multiple stocks
  const stockColors = [
    { border: '#1976d2', bg: 'rgba(25, 118, 210, 0.1)' }, // Blue
    { border: '#ff6b35', bg: 'rgba(255, 107, 53, 0.1)' }, // Orange
    { border: '#4caf50', bg: 'rgba(76, 175, 80, 0.1)' }, // Green
    { border: '#9c27b0', bg: 'rgba(156, 39, 176, 0.1)' }, // Purple
    { border: '#f44336', bg: 'rgba(244, 67, 54, 0.1)' }, // Red
    { border: '#ff9800', bg: 'rgba(255, 152, 0, 0.1)' }, // Amber
    { border: '#607d8b', bg: 'rgba(96, 125, 139, 0.1)' }, // Blue Grey
    { border: '#795548', bg: 'rgba(121, 85, 72, 0.1)' }, // Brown
  ];

  // Auto-refresh effect - runs every 10 seconds when autoRefresh is true and symbol exists
  useEffect(() => {
    let interval;
    
    if (autoRefresh && symbol && chartData) {
      interval = setInterval(() => {
        fetchStockData();
      }, 100000); // 10 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh, symbol, chartData]);

  // Update chart when time interval changes
  useEffect(() => {
    if ((symbol || compareSymbols.length > 0) && Object.keys(stocksData).length > 0) {
      updateChartData();
    }
  }, [timeInterval, compareSymbols]);

  const addComparisonStock = async () => {
    if (!compareInput || compareSymbols.includes(compareInput.toUpperCase()) || compareInput.toUpperCase() === symbol) {
      return;
    }

    const newSymbol = compareInput.toUpperCase();
    setLoading(true);
    setError('');

    try {
      // Fetch data for the new comparison stock
      const dailyResponse = await axios.get(`https://www.alphavantage.co/query`, {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol: newSymbol,
          outputsize: 'compact',
          apikey: 'TOCXILWROOJJLEBL', 
        },
      });

      const intradayResponse = await axios.get(`https://www.alphavantage.co/query`, {
        params: {
          function: 'TIME_SERIES_INTRADAY',
          symbol: newSymbol,
          interval: '5min',
          apikey: 'TOCXILWROOJJLEBL',
        },
      });

      const dailyTimeSeries = dailyResponse.data['Time Series (Daily)'];
      const intradayTimeSeries = intradayResponse.data['Time Series (5min)'];
      
      if (!dailyTimeSeries) throw new Error(`Invalid symbol: ${newSymbol}`);

      // Add to comparison symbols
      setCompareSymbols(prev => [...prev, newSymbol]);
      
      // Store the data
      setStocksData(prev => ({
        ...prev,
        [newSymbol]: {
          daily: dailyTimeSeries,
          intraday: intradayTimeSeries
        }
      }));

      setCompareInput('');
      updateChartData();

    } catch (err) {
      setError(err.message || `Error fetching data for ${newSymbol}`);
    } finally {
      setLoading(false);
    }
  };

  const removeComparisonStock = (stockToRemove) => {
    setCompareSymbols(prev => prev.filter(s => s !== stockToRemove));
    setStocksData(prev => {
      const newData = { ...prev };
      delete newData[stockToRemove];
      return newData;
    });
  };

  const fetchStockData = async () => {
    if (!symbol) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Fetch daily data
      const dailyResponse = await axios.get(`https://www.alphavantage.co/query`, {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol: symbol,
          outputsize: 'compact',
          apikey: 'TOCXILWROOJJLEBL', 
        },
      });

      // Fetch intraday data (5min intervals for today's data)
      const intradayResponse = await axios.get(`https://www.alphavantage.co/query`, {
        params: {
          function: 'TIME_SERIES_INTRADAY',
          symbol: symbol,
          interval: '5min',
          apikey: 'TOCXILWROOJJLEBL',
        },
      });

      const dailyTimeSeries = dailyResponse.data['Time Series (Daily)'];
      const intradayTimeSeries = intradayResponse.data['Time Series (5min)'];
      
      if (!dailyTimeSeries) throw new Error('Invalid symbol or API limit reached');

      // Store both datasets
      setIntradayData(intradayTimeSeries);
      
      // Store data for the main stock
      setStocksData(prev => ({
        ...prev,
        [symbol]: {
          daily: dailyTimeSeries,
          intraday: intradayTimeSeries
        }
      }));
      
      // Update chart based on current time interval
      updateChartData(dailyTimeSeries, intradayTimeSeries);
      
      // Set last updated time
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || 'Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const updateChartData = (dailyData = null, intradayDataParam = null) => {
    // Get all stocks to display (main symbol + comparison symbols)
    const allSymbols = symbol ? [symbol, ...compareSymbols] : compareSymbols;
    if (allSymbols.length === 0) return;

    const datasets = [];
    let commonLabels = [];

    allSymbols.forEach((stockSymbol, index) => {
      const stockData = stocksData[stockSymbol];
      if (!stockData) return;

      const daily = stockSymbol === symbol ? (dailyData || stockData.daily) : stockData.daily;
      const intraday = stockSymbol === symbol ? (intradayDataParam || stockData.intraday) : stockData.intraday;
      
      if (!daily) return;

      let labels, data, datasetLabel;
      const color = stockColors[index % stockColors.length];

      if (timeInterval === 'intraday' && intraday) {
        // Show today's intraday data (5-minute intervals)
        const intradayKeys = Object.keys(intraday).slice(0, 78); // Last 6.5 hours of trading
        labels = intradayKeys.reverse().map(time => {
          const date = new Date(time);
          return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        });
        data = intradayKeys.map(time => parseFloat(intraday[time]['4. close']));
        datasetLabel = `${stockSymbol} - Intraday (5min)`;
      } else if (timeInterval === 'weekly') {
        // Group daily data into weekly averages
        const dailyKeys = Object.keys(daily);
        const weeklyData = [];
        const weeklyLabels = [];
        
        for (let i = 0; i < dailyKeys.length; i += 7) {
          const weekData = dailyKeys.slice(i, i + 7);
          if (weekData.length > 0) {
            const weekAvg = weekData.reduce((sum, date) => 
              sum + parseFloat(daily[date]['4. close']), 0) / weekData.length;
            weeklyData.push(weekAvg);
            weeklyLabels.push(new Date(weekData[0]).toLocaleDateString([], { month: 'short', day: 'numeric' }));
          }
        }
        
        labels = weeklyLabels.slice(0, 12).reverse();
        data = weeklyData.slice(0, 12).reverse();
        datasetLabel = `${stockSymbol} - Weekly`;
      } else {
        // Daily data (default)
        const dailyKeys = Object.keys(daily).slice(0, 30).reverse();
        labels = dailyKeys.map(date => new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' }));
        data = dailyKeys.map(date => parseFloat(daily[date]['4. close']));
        datasetLabel = `${stockSymbol} - Daily`;
      }

      // Set common labels from the first stock
      if (index === 0) {
        commonLabels = labels;
      }

      datasets.push({
        label: datasetLabel,
        data,
        borderColor: color.border,
        backgroundColor: color.bg,
        borderWidth: 3,
        fill: false, // Don't fill when comparing multiple stocks
        tension: 0.4,
        pointBackgroundColor: color.border,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: timeInterval === 'intraday' ? 3 : 5,
        pointHoverRadius: timeInterval === 'intraday' ? 6 : 8,
      });
    });

    setChartData({
      labels: commonLabels,
      datasets,
      dailyData: dailyData, // Store for future use
    });
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: '#1976d2',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Price ($)',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        }
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Search Section - Always on top */}
      <Box sx={{ mb: 4 }}>
        <Card elevation={2}>
          <CardContent>
            <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
              <Box display="flex" alignItems="center" gap={2}>
                <ShowChart sx={{ fontSize: 32, color: 'primary.main' }} />
                <Typography 
                  variant="h5" 
                  component="h2"
                  sx={{ fontWeight: 'bold', color: 'primary.main' }}
                >
                  Stock Data Search
                </Typography>
              </Box>
              
              <Box display="flex" gap={2} alignItems="center" width="100%" maxWidth={600}>
                <TextField
                  label="Stock Symbol"
                  placeholder="e.g., AAPL, GOOGL, TSLA"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  variant="outlined"
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                />
                <Button 
                  variant="contained" 
                  onClick={fetchStockData}
                  disabled={loading || !symbol}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Search />}
                  sx={{
                    minWidth: 140,
                    height: 56,
                    background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                    }
                  }}
                >
                  {loading ? 'Loading...' : 'Search'}
                </Button>
              </Box>
              
              {/* Stock Comparison Section - only show when main chart data exists */}
              {chartData && (
                <Box sx={{ width: '100%', maxWidth: 800 }}>
                  <Divider sx={{ my: 2 }} />
                  
                  <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Compare sx={{ fontSize: 24, color: 'primary.main' }} />
                      <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
                        Compare with Other Stocks
                      </Typography>
                    </Box>
                    
                    {/* Add comparison stock input */}
                    <Box display="flex" gap={2} alignItems="center" width="100%" maxWidth={400}>
                      <TextField
                        label="Add Stock to Compare"
                        placeholder="e.g., MSFT, TSLA"
                        value={compareInput}
                        onChange={(e) => setCompareInput(e.target.value.toUpperCase())}
                        variant="outlined"
                        size="small"
                        fullWidth
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addComparisonStock();
                          }
                        }}
                      />
                      <IconButton 
                        onClick={addComparisonStock}
                        disabled={!compareInput || loading}
                        color="primary"
                        sx={{
                          bgcolor: 'primary.main',
                          color: 'white',
                          '&:hover': { bgcolor: 'primary.dark' },
                          '&:disabled': { bgcolor: 'grey.300' }
                        }}
                      >
                        <Add />
                      </IconButton>
                    </Box>
                    
                    {/* Display comparison stocks */}
                    {compareSymbols.length > 0 && (
                      <Box display="flex" flexWrap="wrap" gap={1} justifyContent="center" mt={1}>
                        {compareSymbols.map((compSymbol, index) => (
                          <Chip
                            key={compSymbol}
                            label={compSymbol}
                            onDelete={() => removeComparisonStock(compSymbol)}
                            deleteIcon={<Remove />}
                            sx={{
                              bgcolor: stockColors[index + 1]?.bg || 'grey.100',
                              border: `2px solid ${stockColors[index + 1]?.border || 'grey.400'}`,
                              fontWeight: 'bold'
                            }}
                          />
                        ))}
                      </Box>
                    )}
                    
                    {compareSymbols.length > 0 && (
                      <Typography variant="caption" color="text.secondary" textAlign="center">
                        Comparing {compareSymbols.length + 1} stocks: {symbol}, {compareSymbols.join(', ')}
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}

              {/* Time Interval Selector - only show when chart data exists */}
              {chartData && (
                <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                    Time Interval
                  </Typography>
                  <ToggleButtonGroup
                    value={timeInterval}
                    exclusive
                    onChange={(e, newInterval) => {
                      if (newInterval !== null) {
                        setTimeInterval(newInterval);
                      }
                    }}
                    aria-label="time interval"
                    size="small"
                  >
                    <ToggleButton value="intraday" aria-label="intraday">
                      <Schedule sx={{ mr: 1, fontSize: 18 }} />
                      Today
                    </ToggleButton>
                    <ToggleButton value="daily" aria-label="daily">
                      <CalendarToday sx={{ mr: 1, fontSize: 18 }} />
                      Daily
                    </ToggleButton>
                    <ToggleButton value="weekly" aria-label="weekly">
                      <DateRange sx={{ mr: 1, fontSize: 18 }} />
                      Weekly
                    </ToggleButton>
                  </ToggleButtonGroup>
                  
                  <Box display="flex" gap={1} flexWrap="wrap" justifyContent="center">
                    <Chip 
                      size="small" 
                      label={
                        timeInterval === 'intraday' ? 'Last 6.5 hours (5min intervals)' :
                        timeInterval === 'weekly' ? 'Last 12 weeks (weekly avg)' :
                        'Last 30 days'
                      }
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                </Box>
              )}

              {/* Auto-refresh toggle - only show when chart data exists */}
              {chartData && (
                <Box display="flex" alignItems="center" gap={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={autoRefresh}
                        onChange={(e) => setAutoRefresh(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Refresh sx={{ fontSize: 20, color: autoRefresh ? 'primary.main' : 'text.secondary' }} />
                        <Typography variant="body2" color={autoRefresh ? 'primary.main' : 'text.secondary'}>
                          Auto-refresh
                        </Typography>
                      </Box>
                    }
                  />
                  {autoRefresh && (
                    <Typography variant="caption" color="success.main" sx={{ fontWeight: 'bold' }}>
                      ● Live
                    </Typography>
                  )}
                </Box>
              )}
              
              {error && (
                <Alert severity="error" sx={{ width: '100%', maxWidth: 600 }}>
                  {error}
                </Alert>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Chart Section - Always on bottom when data exists */}
      {chartData && (
        <Box sx={{ width: '100%' }}>
          <Fade in={!!chartData} timeout={800}>
            <Card elevation={3}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <TrendingUp sx={{ fontSize: 28, color: 'primary.main' }} />
                    <Typography 
                      variant="h6" 
                      component="h3"
                      sx={{ fontWeight: 'bold', color: 'primary.main' }}
                    >
                      {compareSymbols.length > 0 ? 
                        `Stock Comparison - ${timeInterval === 'intraday' ? 'Today\'s Performance' : timeInterval === 'weekly' ? 'Weekly Performance' : 'Daily Performance'}` :
                        `${symbol} - ${timeInterval === 'intraday' ? 'Today\'s Performance (5min intervals)' : timeInterval === 'weekly' ? 'Weekly Performance (12 weeks)' : 'Daily Performance (30 days)'}`
                      }
                    </Typography>
                  </Box>
                  
                  {lastUpdated && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="caption" color="text.secondary">
                        Last updated: {lastUpdated.toLocaleTimeString()}
                      </Typography>
                      {autoRefresh && (
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: 'success.main',
                            animation: 'pulse 1.5s infinite',
                            '@keyframes pulse': {
                              '0%': { opacity: 1 },
                              '50%': { opacity: 0.5 },
                              '100%': { opacity: 1 },
                            },
                          }}
                        />
                      )}
                    </Box>
                  )}
                </Box>
                
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    height: 500,
                    backgroundColor: '#fafafa',
                    border: '1px solid #e0e0e0'
                  }}
                >
                  <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
                    <Line data={chartData} options={chartOptions} />
                  </Box>
                </Paper>
              </CardContent>
            </Card>
          </Fade>
        </Box>
      )}
    </Box>
  );
};

export default StockChart;
