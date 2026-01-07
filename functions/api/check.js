// functions/api/check.js

export async function onRequestPost(context) {
  try {
    const { serverKey, username, password } = await context.request.json();

    // --- CONFIGURATION ---
    // 1. Map Keys to Direct IPs
    const SERVER_IPS = {
      "useast": "http://192.64.119.64", 
      "uswest": "http://185.245.2.106",
      "asia":   "http://103.211.100.210"
    };

    // 2. Map Keys to the "Host" the server expects
    const SERVER_HOSTS = {
      "useast": "useast.tfplus.stream",
      "uswest": "uswest.tfplus.stream",
      "asia":   "hk.tfplus.stream"
    };

    const targetBase = SERVER_IPS[serverKey];
    const targetHost = SERVER_HOSTS[serverKey];

    if (!targetBase || !targetHost) {
      return new Response(JSON.stringify({ error: "Invalid Server Selection" }), { status: 400 });
    }
    
    // Construct the URL using the DIRECT IP
    const targetUrl = `${targetBase}/player_api.php?username=${username}&password=${password}`;

    // Log the attempt (visible in Dashboard)
    console.log(`Proxying to: ${targetUrl} with Host: ${targetHost}`);

    const serverResponse = await fetch(targetUrl, {
      method: "GET",
      headers: {
        // CRITICAL: Tell the server we want the specific website, not just the IP
        "Host": targetHost,
        // Spoof a real player User-Agent to avoid 'bot' blocks
        "User-Agent": "IPTVSmartersPro", 
      },
    });

    if (!serverResponse.ok) {
      // If we still get a 502/404, we try to read the text to see why
      const errorText = await serverResponse.text(); 
      console.log("Upstream Error Body:", errorText); // Check logs if this happens
      
      return new Response(JSON.stringify({ 
        error: `Server Error: ${serverResponse.status}`,
        details: "The server rejected the connection."
      }), { status: 502 });
    }

    const data = await serverResponse.json();
    
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}