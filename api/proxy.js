import axios from 'axios';
import { URLSearchParams } from 'url';

export default async function handler(req, res) {
  try {
    const { path, ...restQuery } = req.query;
    const host = process.env.VITE_BACKEND_HOST;
    const port = process.env.VITE_BACKEND_PORT;

    if (!host || !port) {
      return res.status(500).json({ error: true, message: 'Backend configuration missing' });
    }

    const subPath = Array.isArray(path) ? path.join('/') : (path || '');
    const qs = new URLSearchParams(restQuery).toString();
    const backendUrl = `http://${host}:${port}/${subPath}${qs ? `?${qs}` : ''}`;

    // host 제거
    const { host: _ignored, ...restHeaders } = req.headers;
    const forwardHeaders = {
      ...restHeaders,
      'x-forwarded-host': 'frontend-ts-ihnk.vercel.app',
      'x-forwarded-proto': 'https',
      'x-forwarded-port': '443',
    };

    const response = await axios({
      method: req.method,
      url: backendUrl,
      headers: forwardHeaders,
      data: (req.body && Object.keys(req.body).length) ? req.body : undefined,
      validateStatus: () => true,
      maxRedirects: 0
    });

    const setCookie = response.headers['set-cookie'];
    if (setCookie) res.setHeader('set-cookie', setCookie);

    Object.entries(response.headers).forEach(([k, v]) => {
      if (!['content-encoding', 'transfer-encoding'].includes(k)) {
        try { res.setHeader(k, v); } catch {}
      }
    });

    res.status(response.status).send(response.data);
  } catch (err) {
    if (err.response) {
      const setCookie = err.response.headers?.['set-cookie'];
      if (setCookie) res.setHeader('set-cookie', setCookie);
      Object.entries(err.response.headers || {}).forEach(([k, v]) => {
        if (!['content-encoding', 'transfer-encoding'].includes(k)) {
          try { res.setHeader(k, v); } catch {}
        }
      });
      return res.status(err.response.status).send(err.response.data);
    }
    res.status(502).json({ error: true, message: 'Bad gateway / Proxy crashed' });
  }
}