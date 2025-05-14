import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { getStockData } from '../helpers/getStockDataModule.js';
import { findCorrelation } from '../helpers/findCorrelationModule.js';

// Setup the app for testing
const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/stocks/ticker', async (req, res) => {
    const { ticker, minutes, aggregation } = req.query;

    if (!ticker) {
        return res.status(400).json({ error: 'Ticker symbol is required' });
    }
    if (!minutes || isNaN(minutes)) {
        return res.status(400).json({ error: 'Valid minutes parameter is required' });
    }

    try {
        if (aggregation !== 'average') {
            return res.status(400).json({ error: 'Invalid aggregation type' });
        }
        const stockData = await getStockData(ticker, minutes);
        if (!stockData || !Array.isArray(stockData) || stockData.length === 0) {
            return res.status(404).json({ error: 'Stock data not found' });
        }
        const average = stockData.reduce((acc, data) => acc + (data.price || 0), 0) / stockData.length;
        return res.json({ averagePrice: average, data: stockData });
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
    if (!minutes || isNaN(minutes)) {
        return res.status(400).json({ error: 'Valid minutes parameter is required' });
    }

    try {
        const [data1, data2] = await Promise.all([
            getStockData(ticker1, minutes),
            getStockData(ticker2, minutes),
        ]);

        if (!data1 || !data2 || !Array.isArray(data1) || !Array.isArray(data2) || data1.length === 0 || data2.length === 0) {
            return res.status(404).json({ error: 'Stock data not found' });
        }

        const correlation = findCorrelation(data1, data2);
        const avgPrice1 = data1.reduce((acc, data) => acc + (data.price || 0), 0) / data1.length;
        const avgPrice2 = data2.reduce((acc, data) => acc + (data.price || 0), 0) / data2.length;

        const response = {
            correlation,
            stocks: {
                [ticker1]: { avgPrice: avgPrice1, priceHistory: data1 },
                [ticker2]: { avgPrice: avgPrice2, priceHistory: data2 },
            },
        };
        return res.json(response);
    } catch (error) {
        console.error('Error fetching stock correlation:', error);
        return res.status(500).json({ error: 'Error fetching stock data' });
    }
});

// Test cases for '/stocks/ticker' endpoint
describe('GET /stocks/ticker', () => {
    it('should return stock data and average price', async () => {
        // Mock getStockData for testing
        jest.spyOn(require('../helpers/getStockDataModule.js'), 'getStockData')
            .mockResolvedValue([{ price: 100 }, { price: 200 }]);

        const res = await request(app)
            .get('/stocks/ticker')
            .query({ ticker: 'NVDA', minutes: '5', aggregation: 'average' });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('averagePrice', 150);
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should return 400 if ticker is missing', async () => {
        const res = await request(app)
            .get('/stocks/ticker')
            .query({ minutes: '5', aggregation: 'average' });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error', 'Ticker symbol is required');
    });

    it('should return 400 if minutes is invalid', async () => {
        const res = await request(app)
            .get('/stocks/ticker')
            .query({ ticker: 'NVDA', minutes: 'invalid', aggregation: 'average' });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error', 'Valid minutes parameter is required');
    });

    it('should return 400 for invalid aggregation', async () => {
        const res = await request(app)
            .get('/stocks/ticker')
            .query({ ticker: 'NVDA', minutes: '5', aggregation: 'invalid' });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error', 'Invalid aggregation type');
    });

    it('should return 404 if stock data is not found', async () => {
        jest.spyOn(require('../helpers/getStockDataModule.js'), 'getStockData')
            .mockResolvedValue([]);

        const res = await request(app)
            .get('/stocks/ticker')
            .query({ ticker: 'NVDA', minutes: '5', aggregation: 'average' });

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('error', 'Stock data not found');
    });
});

// Test cases for '/stocks/stockcorrelation' endpoint
describe('GET /stocks/stockcorrelation', () => {
    it('should return correlation data and stock price history', async () => {
        jest.spyOn(require('../helpers/getStockDataModule.js'), 'getStockData')
            .mockImplementation((ticker) =>
                Promise.resolve(ticker === 'NVDA' ? [{ price: 100 }] : [{ price: 200 }])
            );
        jest.spyOn(require('../helpers/findCorrelationModule.js'), 'findCorrelation')
            .mockReturnValue(0.95);

        const res = await request(app)
            .get('/stocks/stockcorrelation')
            .query({ minutes: '5', ticker: 'NVDA', ticker2: 'PYPL' });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('correlation', 0.95);
        expect(res.body.stocks).toHaveProperty('NVDA');
        expect(res.body.stocks).toHaveProperty('PYPL');
        expect(res.body.stocks.NVDA).toHaveProperty('avgPrice', 100);
        expect(res.body.stocks.PYPL).toHaveProperty('avgPrice', 200);
    });

    it('should return 400 if tickers are missing', async () => {
        const res = await request(app)
            .get('/stocks/stockcorrelation')
            .query({ minutes: '5' });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error', 'Both ticker symbols are required');
    });

    it('should return 400 if minutes is invalid', async () => {
        const res = await request(app)
            .get('/stocks/stockcorrelation')
            .query({ ticker: 'NVDA', ticker2: 'PYPL', minutes: 'invalid' });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error', 'Valid minutes parameter is required');
    });

    it('should return 404 if stock data is not found', async () => {
        jest.spyOn(require('../helpers/getStockDataModule.js'), 'getStockData')
            .mockResolvedValue([]);

        const res = await request(app)
            .get('/stocks/stockcorrelation')
            .query({ ticker: 'NVDA', ticker2: 'PYPL', minutes: '5' });

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('error', 'Stock data not found');
    });
});