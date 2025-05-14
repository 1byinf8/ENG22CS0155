// src/components/HeatMapChart.js
import React from 'react';
import { Box } from '@mui/material';

const getColor = (correlation) => {
  if (correlation > 0.75) return '#2ecc71';
  if (correlation > 0.5) return '#27ae60';
  if (correlation > 0.25) return '#f1c40f';
  if (correlation > 0) return '#e67e22';
  if (correlation > -0.25) return '#e74c3c';
  return '#c0392b';
};

const HeatMapChart = ({ correlation }) => {
  const bgColor = getColor(correlation);
  return (
    <Box
      sx={{
        width: 300,
        height: 150,
        backgroundColor: bgColor,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        fontSize: 24,
        borderRadius: 2,
      }}
    >
      Correlation: {correlation.toFixed(2)}
    </Box>
  );
};

export default HeatMapChart;
