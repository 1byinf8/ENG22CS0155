// src/pages/CorrelationHeatmapPage.js
import React, { useState } from 'react';
import { TextField, Button, Grid, Typography, Paper, Alert } from '@mui/material';
import axios from 'axios';
import HeatMapChart from './components/HeatMapChart';

const CorrelationPage = () => {
  const [ticker1, setTicker1] = useState('');
  const [ticker2, setTicker2] = useState('');
  const [minutes, setMinutes] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError(''); // Clear previous errors
    try {
      const res = await axios.get('http://localhost:3000/stocks/stockcorrelation', {
        params: { ticker: ticker1, ticker2, minutes },
      });

      if (res.data.error) {
        setError(res.data.error); // If the response contains an error, display it
      } else {
        setResult(res.data);
      }
    } catch (error) {
      console.error('Error fetching correlation data', error);
      setError('An error occurred while fetching data.');
    }
  };

  return (
    <Grid container spacing={2} padding={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          Stock Correlation Heatmap
        </Typography>
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField fullWidth label="Ticker 1" value={ticker1} onChange={(e) => setTicker1(e.target.value)} />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField fullWidth label="Ticker 2" value={ticker2} onChange={(e) => setTicker2(e.target.value)} />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField fullWidth label="Minutes" type="number" value={minutes} onChange={(e) => setMinutes(e.target.value)} />
      </Grid>
      <Grid item xs={12}>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Get Correlation
        </Button>
      </Grid>

      {error && (
        <Grid item xs={12}>
          <Alert severity="error">{error}</Alert>
        </Grid>
      )}

      {result && !error && (
        <>
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ padding: 2 }}>
              <Typography variant="h6">Correlation: {result.correlation.toFixed(2)}</Typography>
              <HeatMapChart correlation={result.correlation} />
            </Paper>
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default CorrelationPage;
