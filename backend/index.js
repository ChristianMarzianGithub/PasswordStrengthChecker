import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '*';

app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/pwned', async (req, res) => {
  try {
    const prefix = (req.query.hashPrefix || '').toString().toUpperCase();
    if (!prefix || prefix.length !== 5) {
      return res.status(400).json({ error: 'hashPrefix required' });
    }
    const hibpUrl = `https://api.pwnedpasswords.com/range/${prefix}`;
    const hibpRes = await fetch(hibpUrl, {
      headers: {
        'Add-Padding': 'true'
      }
    });

    if (!hibpRes.ok) {
      return res.status(502).json({ error: 'Upstream error' });
    }

    const body = await hibpRes.text();
    const hashes = body
      .split('\n')
      .filter(Boolean)
      .map((line) => line.trim());

    res.json({ hashes });
  } catch (error) {
    console.error('Lookup failed', error);
    res.status(500).json({ error: 'Unexpected error' });
  }
});

app.listen(PORT, () => {
  console.log(`Breach proxy listening on port ${PORT}`);
});
