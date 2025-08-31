const axios = require('axios');

module.exports = async (req, res) => {
  try {
    const { path } = req.query;
    const host = process.env.VITE_BACKEND_HOST;
    const port = process.env.VITE_BACKEND_PORT;
    
    if (!host || !port) {
      return res.status(500).json({ error: 'Backend configuration missing' });
    }
    
    const backendUrl = `http://${host}:${port}/${Array.isArray(path) ? path.join('/') : path || ''}`;
    
    const response = await axios.get(backendUrl, {
      headers: req.headers
    });
    
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy failed' });
  }
};