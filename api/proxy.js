export default async function handler(req, res) {
  const { path } = req.query;
  const host = process.env.VITE_BACKEND_HOST;
  const port = process.env.VITE_BACKEND_PORT;
  
  if (!host || !port) {
    return res.status(500).json({ error: 'Backend configuration missing' });
  }
  
  const backendUrl = `http://${host}:${port}/${Array.isArray(path) ? path.join('/') : path || ''}`;
  
  try {
    const response = await fetch(backendUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
    });
    
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Proxy error' });
  }
}