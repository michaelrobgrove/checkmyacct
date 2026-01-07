// functions/api/check.js

export async function onRequestPost(context) {
  try {
    const { domain, username, password } = await context.request.json();

    if (!domain || !username || !password) {
      return new Response(JSON.stringify({ error: "Missing information." }), { status: 400 });
    }

    // Construct the Xtream API URL
    // We expect the domain to already have https:// from the frontend
    const targetUrl = `${domain}/player_api.php?username=${username}&password=${password}`;

    const serverResponse = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "User-Agent": "TFPlus-Status-Tool/1.0",
      },
    });

    if (!serverResponse.ok) {
      // If the actual IPTV server errors out (500, 404, etc)
      return new Response(JSON.stringify({ error: `Server Error: ${serverResponse.status}` }), { status: 502 });
    }

    const data = await serverResponse.json();
    
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
