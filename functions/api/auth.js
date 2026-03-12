export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);

  const clientId = env.GITHUB_CLIENT_ID;
  const redirectUri = `${url.origin}/api/callback`;

  if (!clientId) {
    return new Response('Missing GITHUB_CLIENT_ID env var', { status: 500 });
  }

  // IMPORTANT: Decap CMS passes its own `state` value and expects it back.
  // If we generate a new one here, Decap will ignore the callback message and you
  // get stuck on the "Login with GitHub" screen.
  const state = url.searchParams.get('state') || crypto.randomUUID();

  const gh = new URL('https://github.com/login/oauth/authorize');
  gh.searchParams.set('client_id', clientId);
  gh.searchParams.set('redirect_uri', redirectUri);
  gh.searchParams.set('scope', 'repo');
  gh.searchParams.set('state', state);

  return Response.redirect(gh.toString(), 302);
}
