export default async function handler(req, res) {
  const host = process.env.BACKEND_HOST || process.env.VITE_BACKEND_HOST;
  const port = process.env.BACKEND_PORT || process.env.VITE_BACKEND_PORT;

  if (!host || !port) {
    res.status(500).json({ error: true, message: 'Backend configuration missing' });
    return;
  }

  try {
    // /api/proxy?path=foo/bar → "foo/bar"
    const { path, ...restQuery } = req.query;
    const subPath = Array.isArray(path) ? path.join('/') : (path || '');
    const qs = new URLSearchParams(restQuery).toString();
    const backendUrl = `http://${host}:${port}/${subPath}${qs ? `?${qs}` : ''}`;

    // 원본 헤더 전달 (Host, Connection, Accept-Encoding 등 일부 제외)
    const fwdHeaders = new Headers();
    for (const [k, v] of Object.entries(req.headers)) {
      if (!v) continue;
      const key = k.toLowerCase();
      if (key === 'host' || key === 'connection' || key === 'accept-encoding') continue;
      // vercel에서 문제될 수 있는 중복/배열 헤더 처리
      fwdHeaders.set(k, Array.isArray(v) ? v.join(', ') : v);
    }

    // X-Forwarded-* (원하면 유지/수정)
    fwdHeaders.set('x-forwarded-host', req.headers['x-forwarded-host'] || req.headers.host || 'frontend');
    fwdHeaders.set('x-forwarded-proto', req.headers['x-forwarded-proto'] || 'https');
    fwdHeaders.set('x-forwarded-port', req.headers['x-forwarded-port'] || '443');

    const method = (req.method || 'GET').toUpperCase();
    const hasBody = !(method === 'GET' || method === 'HEAD');

    // fetch 옵션 (중요: duplex)
    const init = {
      method,
      headers: fwdHeaders,
      body: hasBody ? req : undefined,   // ✅ 멀티파트/폼데이터 스트림 그대로 전달
      duplex: hasBody ? 'half' : undefined,
      redirect: 'manual',
    };

    // (선택) 타임아웃 방어
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 120000);
    init.signal = controller.signal;

    const upstream = await fetch(backendUrl, init).finally(() => clearTimeout(timer));

    // 응답 헤더 포워딩 (전송 관련 몇 개는 제외)
    upstream.headers.forEach((value, key) => {
      const k = key.toLowerCase();
      if (k === 'transfer-encoding' || k === 'content-encoding') return;
      // Set-Cookie 등은 그대로 넘기면 됨
      try { res.setHeader(key, value); } catch {}
    });

    res.status(upstream.status);

    // 바디 스트림 전달
    if (!upstream.body) {
      res.end();
      return;
    }

    // WHATWG ReadableStream → Node stream 변환
    const { Readable } = await import('node:stream');
    const { ReadableStream } = await import('node:stream/web');
    const nodeStream = Readable.fromWeb(upstream.body);
    nodeStream.pipe(res);
  } catch (err) {
    // 업스트림에서 에러/타임아웃
    res.status(502).json({
      error: true,
      message: 'Bad gateway / Proxy crashed',
      detail: err?.message || String(err),
    });
  }
}
