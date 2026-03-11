export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  const clientId = env.GITHUB_CLIENT_ID;
  const clientSecret = env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return new Response("Missing GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET env vars", { status: 500 });
  }

  if (!code) {
    return new Response("Missing code", { status: 400 });
  }

  // Exchange code for token
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code
    })
  });

  const tokenJson = await tokenRes.json();
  const token = tokenJson.access_token;

  if (!token) {
    return new Response(`Token exchange failed: ${JSON.stringify(tokenJson)}`, { status: 500 });
  }

  // Decap CMS expects a page that posts the token back to the opener.
  // This format is compatible with the "netlify-cms-oauth-provider" style.
  const html = `<!doctype html>
<html>
  <body>
    <script>
      (function() {
        var payload = { token: ${JSON.stringify(token)} };
        var msg = 'authorization:github:success:' + JSON.stringify(payload);

        // Try to notify the opener (Decap opens OAuth in a popup).
        try {
          if (window.opener) {
            window.opener.postMessage(msg, '*');
          }
        } catch (e) {}

        // Fallback: notify parent (in case it was opened in an iframe/tab)
        try {
          if (window.parent) {
            window.parent.postMessage(msg, '*');
          }
        } catch (e) {}

        // If the window can't close (browser blocked), redirect back to /admin
        try { window.close(); } catch (e) {}
        setTimeout(function(){
          try { window.location.href = '/admin/'; } catch (e) {}
        }, 250);
      })();
    </script>
    Logging in…
  </body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}
