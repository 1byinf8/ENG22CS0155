import { useEffect, useState } from 'react';
import {
  Box, Typography, TextField, MenuItem, Button,
  CircularProgress, Paper, Divider
} from '@mui/material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

const StockPage = () => {
  const [ticker, setTicker] = useState('AAPL');
  const [minutes, setMinutes] = useState(30);
  const [data, setData] = useState([]);
  const [average, setAverage] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStockData = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:3000/stocks/ticker?ticker=${ticker}&minutes=${minutes}&aggregation=average`
      );
      const json = await res.json();
      setData(json.data);
      setAverage(json.averagePrice);
    } catch (err) {
      console.error('Error fetching stock data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();
  }, []);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight={600} color="primary">
        📈 Stock Price Visualizer
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>🔍 Search Parameters</Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Ticker Symbol"
            variant="outlined"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            sx={{ minWidth: 120 }}
          />
          <TextField
            select
            label="Timeframe (minutes)"
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            sx={{ minWidth: 160 }}
          >
            {[15, 30, 60, 120].map((m) => (
              <MenuItem key={m} value={m}>{m} Minutes</MenuItem>
            ))}
          </TextField>
          <Button variant="contained" onClick={fetchStockData} sx={{ height: 56 }}>
            Fetch Data
          </Button>
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body1" mt={2}>Loading stock data...</Typography>
        </Box>
      ) : data.length > 0 ? (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>📊 Price Chart for {ticker}</Typography>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip />
              <Line type="monotone" dataKey="price" stroke="#1976d2" strokeWidth={2} dot={false} />
              {average && (
                <ReferenceLine y={average} label="Avg" stroke="red" strokeDasharray="3 3" />
              )}
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      ) : (
        <Typography variant="body1">No data to display.</Typography>
      )}
    </Box>
  );
};

export default StockPage;
