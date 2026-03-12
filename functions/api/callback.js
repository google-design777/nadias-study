export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  const clientId = env.GITHUB_CLIENT_ID;
  const clientSecret = env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return new Response('Missing GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET env vars', { status: 500 });
  }

  if (!code) {
    return new Response('Missing code', { status: 400 });
  }

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
  // Include the original `state` (Decap uses it to validate the flow).
  const html = `<!doctype html>
<html>
  <body>
    <script>
      (function() {
        var payload = { token: ${JSON.stringify(token)}, provider: 'github', state: ${JSON.stringify(state)} };
        var msg = 'authorization:github:success:' + JSON.stringify(payload);

        try {
          if (window.opener) {
            window.opener.postMessage(msg, window.location.origin);
            window.opener.postMessage(msg, '*');
          }
        } catch (e) {}

        try {
          if (window.parent) {
            window.parent.postMessage(msg, window.location.origin);
            window.parent.postMessage(msg, '*');
          }
        } catch (e) {}

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
