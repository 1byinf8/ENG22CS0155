export function findCorrelation() {
    const covariance = calculateCovariance(prices1, prices2);
    const sd1 = calculateStandardDeviation(prices1);
    const sd2 = calculateStandardDeviation(prices2);
    
    return covariance / (sd1 * sd2);
}

function calculateCovariance(prices1, prices2) {
    const mean1 = calculateMean(prices1);
    const mean2 = calculateMean(prices2);
    
    let covariance = 0;
    for (let i = 0; i < prices1.length; i++) {
        covariance += (prices1[i] - mean1) * (prices2[i] - mean2);
    }
    
    return covariance / prices1.length;
}

function calculateMean(prices) {
    let sum = 0;
    for (let i = 0; i < prices.length; i++) {
        sum += prices[i];
    }
    
    return sum / prices.length;
}

function calculateStandardDeviation(prices) {
    const mean = calculateMean(prices);
    let sumOfSquares = 0;
    
    for (let i = 0; i < prices.length; i++) {
        sumOfSquares += Math.pow(prices[i] - mean, 2);
    }
    
    return Math.sqrt(sumOfSquares / prices.length);
}