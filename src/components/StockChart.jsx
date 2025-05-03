import React, { useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Box, TextField, Button, Typography } from '@mui/material';
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

  const fetchStockData = async () => {
    try {
      const response = await axios.get(`https://www.alphavantage.co/query`, {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol: symbol,
          outputsize: 'compact',
          apikey: 'TOCXILWROOJJLEBL', 
        },
      });

      const timeSeries = response.data['Time Series (Daily)'];
      if (!timeSeries) throw new Error('Invalid symbol or limit reached');

      const labels = Object.keys(timeSeries).slice(0, 30).reverse();
      const data = labels.map((date) => parseFloat(timeSeries[date]['4. close']));

      setChartData({
        labels,
        datasets: [
          {
            label: `${symbol} Closing Price`,
            data,
            borderColor: 'rgba(75,192,192,1)',
            fill: false,
          },
        ],
      });
    } catch (err) {
      alert(err.message || 'Error fetching data');
    }
  };

  return (
    <Box mt={4} display="flex" flexDirection="column" alignItems="center" gap={2}>
      <Typography variant="h6">Enter Stock Symbol</Typography>
      <TextField
        label="Stock Symbol (e.g., AAPL)"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
      />
      <Button variant="contained" onClick={fetchStockData}>
        Get Stock Data
      </Button>
      {chartData && (
        <Box width="100%" maxWidth={800}>
          <Line data={chartData} />
        </Box>
      )}
    </Box>
  );
};

export default StockChart;
