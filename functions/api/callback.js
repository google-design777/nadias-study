export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);

  const code = url.searchParams.get('code');

  const clientId = env.GITHUB_CLIENT_ID;
  const clientSecret = env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return new Response('Missing GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET env vars', { status: 500 });
  }

  if (!code) {
    return new Response('Missing code', { status: 400 });
  }

  // Exchange code for token
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
    }),
  });

  const tokenJson = await tokenRes.json();
  const token = tokenJson.access_token;

  if (!token) {
    return new Response(`Token exchange failed: ${JSON.stringify(tokenJson)}`, { status: 500 });
  }

  // Decap CMS expects a page that posts the token back to the opener.
  // Keep payload minimal for maximum compatibility.
  const html = `<!doctype html>
<html>
  <body>
    <script>
      (function() {
        var payload = { token: ${JSON.stringify(token)}, provider: 'github' };
        var msg = 'authorization:github:success:' + JSON.stringify(payload);

        function send(target) {
          try {
            target.postMessage(msg, '*');
            target.postMessage(msg, window.location.origin);
          } catch (e) {}
        }

        if (window.opener) send(window.opener);
        if (window.parent && window.parent !== window) send(window.parent);

        setTimeout(function(){
          try { window.close(); } catch (e) {}
        }, 1200);
      })();
    </script>
    Logging in… If this window doesn’t close, close it manually and return to <a href="/admin/">/admin</a>.
  </body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
