import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { getStockData } from './helpers/getStockDataModule.mjs';
import { findCorrelation } from './helpers/findCorrelationModule.mjs';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    'origin': 'http://localhost:5173',
    'methods': ['GET', 'POST'],
}));
app.use(bodyParser.json());

app.get('/stocks/ticker', async (req, res) => {
    const { ticker, minutes, aggregation } = req.query;

    if (!ticker) {
        return res.status(400).json({ error: 'Ticker symbol is required' });
    }
    if (!minutes || isNaN(Number(minutes))) {
        return res.status(400).json({ error: 'Valid minutes parameter is required' });
    }

    try {
        if (aggregation !== 'average') {
            return res.status(400).json({ error: 'Invalid aggregation type' });
        }
        const stockData = await getStockData(ticker, Number(minutes));
        if (!stockData || !Array.isArray(stockData) || stockData.length === 0) {
            return res.status(404).json({ error: 'Stock data not found' });
        }
        const average = stockData.reduce((acc, data) => acc + (data.price || 0), 0) / stockData.length;
        const response = {
            averagePrice: average,
            data: stockData,
        };
        res.json(response);
    } catch (error) {
        console.error('Error fetching stock data:', error);
        return res.status(500).json({ error: 'Error fetching stock data' });
    }
});

app.get('/stocks/stockcorrelation', async (req, res) => {
    const { minutes, ticker: ticker1, ticker2 } = req.query;

    if (!ticker1 || !ticker2) {
        return res.status(400).json({ error: 'Both ticker symbols are required' });
    }
    if (!minutes || isNaN(Number(minutes))) {
        return res.status(400).json({ error: 'Valid minutes parameter is required' });
    }

    try {
        const [data1, data2] = await Promise.all([
            getStockData(ticker1, Number(minutes)),
            getStockData(ticker2, Number(minutes)),
        ]);

        if (!data1 || !data2 || !Array.isArray(data1) || !Array.isArray(data2) || data1.length === 0 || data2.length === 0) {
            return res.status(404).json({ error: 'Stock data not found' });
        }

        const prices1 = data1.map(item => item.price);
        const prices2 = data2.map(item => item.price);

        const average1 = data1.reduce((acc, data) => acc + (data.price || 0), 0) / data1.length;
        const average2 = data2.reduce((acc, data) => acc + (data.price || 0), 0) / data2.length;
        const correlation = findCorrelation(prices1, prices2);

        const response = {
            correlation,
            stocks: {
                [ticker1]: {
                    avgPrice: average1,
                    priceHistory: data1,
                },
                [ticker2]: {
                    avgPrice: average2,
                    priceHistory: data2,
                },
            },
        };
        res.json(response);
    } catch (error) {
        console.error('Error fetching stock correlation:', error);
        return res.status(500).json({ error: 'Error fetching stock data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});