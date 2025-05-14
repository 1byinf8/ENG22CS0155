Here's a README file template for your [stock-aggregation-api](https://github.com/1byinf8/ENG22CS0155/tree/main/stock-aggregation-api) project. This will help explain the project's functionality, how to set it up, and how to interact with it.

---

# Stock Aggregation API

This is a backend API for aggregating and analyzing stock price data. The API allows users to fetch stock prices, calculate correlation between the prices of two different stocks, and handle minute-level aggregation of stock data.

## Features

* **Fetch Stock Data by Ticker**: Retrieve stock price data for a given stock ticker symbol.
* **Calculate Correlation**: Retrieve correlation between the prices of two stocks over a specified minute interval.
* **Data Aggregation**: Aggregate stock prices by minute and compute averages.

## Endpoints

### 1. `/stocks/ticker`

**Method**: `GET`

**Description**: Fetch stock data for a given ticker symbol and aggregate it by minute.

**Query Parameters**:

* `ticker`: The stock ticker symbol (required).
* `minutes`: The interval in minutes for aggregation (required).
* `aggregation`: The type of aggregation (currently only supports `'average'`).

**Response**:

* **200 OK**: Returns the average stock price and the raw data.
* **400 Bad Request**: If a required parameter is missing or invalid.
* **404 Not Found**: If stock data is not found for the given ticker.
* **500 Internal Server Error**: If an error occurs while fetching the data.

**Example Request**:

```bash
GET http://localhost:3000/stocks/ticker?ticker=AAPL&minutes=15&aggregation=average
```

**Example Response**:

```json
{
  "averagePrice": 135.67,
  "data": [
    {"price": 135.50, "lastUpdatedAt": "2025-05-14T06:43:41.928586518Z"},
    {"price": 135.85, "lastUpdatedAt": "2025-05-14T06:55:41.928362924Z"}
  ]
}
```

---

### 2. `/stocks/stockcorrelation`

**Method**: `GET`

**Description**: Calculate the correlation between the prices of two stocks over a given minute interval.

**Query Parameters**:

* `ticker`: The first stock ticker symbol (required).
* `ticker2`: The second stock ticker symbol (required).
* `minutes`: The interval in minutes for aggregation (required).

**Response**:

* **200 OK**: Returns the correlation between the two stocks, along with their price history and average price.
* **400 Bad Request**: If a required parameter is missing or invalid.
* **404 Not Found**: If stock data is not found for the given tickers.
* **500 Internal Server Error**: If an error occurs while fetching the data.

**Example Request**:

```bash
GET http://localhost:3000/stocks/stockcorrelation?ticker=AAPL&ticker2=GOOGL&minutes=15
```

**Example Response**:

```json
{
  "correlation": 0.85,
  "stocks": {
    "AAPL": {
      "avgPrice": 135.67,
      "priceHistory": [
        {"price": 135.50, "lastUpdatedAt": "2025-05-14T06:43:41.928586518Z"},
        {"price": 135.85, "lastUpdatedAt": "2025-05-14T06:55:41.928362924Z"}
      ]
    },
    "GOOGL": {
      "avgPrice": 134.25,
      "priceHistory": [
        {"price": 134.10, "lastUpdatedAt": "2025-05-14T06:43:41.928586518Z"},
        {"price": 134.50, "lastUpdatedAt": "2025-05-14T06:55:41.928362924Z"}
      ]
    }
  }
}
```

---

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/1byinf8/ENG22CS0155.git
   cd ENG22CS0155/stock-aggregation-api
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables (if needed). For example, you may need to specify API keys for fetching stock data.

4. Start the server:

   ```bash
   npm start
   ```

   The server will run on `http://localhost:3000`.

---

## Error Handling

The API responds with appropriate HTTP status codes:

* **200**: Success
* **400**: Bad Request (missing or invalid parameters)
* **404**: Not Found (if the stock data or correlation is not available)
* **500**: Internal Server Error (if something goes wrong on the server)

---

## Example Use Case

1. **Get the average stock price of AAPL over 15 minutes**:

   ```bash
   GET http://localhost:3000/stocks/ticker?ticker=AAPL&minutes=15&aggregation=average
   ```

2. **Get the correlation between AAPL and GOOGL over 15 minutes**:

   ```bash
   GET http://localhost:3000/stocks/stockcorrelation?ticker=AAPL&ticker2=GOOGL&minutes=15
   ```

---

## Technologies Used

* **Node.js**: Backend framework for handling API requests.
* **Express.js**: Web framework for building RESTful APIs.
* **Axios**: Used to fetch stock data (if applicable).
* **MUI**: For UI components in the frontend (if you plan to integrate this API with a frontend).

---

## Contributing

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes.
4. Push to the branch.
5. Open a pull request with a clear description of the changes.

---

## License

This project is licensed under the MIT License.

---

Feel free to customize the README with any additional details specific to your project or development setup. Let me know if you'd like to adjust anything!
