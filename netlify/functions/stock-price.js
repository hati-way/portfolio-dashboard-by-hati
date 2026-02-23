exports.handler = async (event) => {
  const ticker = event.queryStringParameters && event.queryStringParameters.ticker;
  if (!ticker) return { statusCode: 400, body: JSON.stringify({ error: 'ticker required' }) };
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) throw new Error(`Yahoo API ${res.status}`);
    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta) throw new Error('No data');
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticker,
        name: meta.shortName || meta.longName || ticker,
        current: meta.regularMarketPrice ?? meta.previousClose ?? null,
        currency: meta.currency ?? 'USD'
      }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
