// functions/api/check.js

export async function onRequestPost(context) {
  try {
    const { serverKey, username, password } = await context.request.json();

    // --- CONFIGURATION: DIRECT SERVER IPS ---
    // These are used by the backend to bypass Cloudflare and get the account status.
    const SERVER_MAP = {
      "useast": "http://192.64.119.64", 
      "uswest": "http://185.245.2.106",
      "asia":   "http://103.211.100.210"
    };

    const targetBase = SERVER_MAP[serverKey];

    if (!targetBase) {
      return new Response(JSON.stringify({ error: "Invalid Server Selection" }), { status: 400 });
    }
    
    // Construct URL using the DIRECT IP
    const targetUrl = `${targetBase}/player_api.php?username=${username}&password=${password}`;

    // Log for debugging (visible in Cloudflare dashboard logs only)
    console.log(`Proxying request to: ${targetUrl}`);

    const serverResponse = await fetch(targetUrl, {
      method: "GET",
      headers: {
        // Some panels require a Host header, but often direct IP is fine.
        // We set a generic user agent.
        "User-Agent": "TFPlus-Status-Tool/1.0",
      },
    });

    if (!serverResponse.ok) {
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