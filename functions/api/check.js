// functions/api/check.js

export async function onRequestPost(context) {
  try {
    const { serverKey, username, password } = await context.request.json();

    // --- CONFIGURATION ---
    const SERVER_IPS = {
      "useast": "http://192.64.119.64", 
      "uswest": "http://185.245.2.106",
      "asia":   "http://103.211.100.210"
    };

    const targetBase = SERVER_IPS[serverKey];

    if (!targetBase) {
      return new Response(JSON.stringify({ error: "Invalid Server Selection" }), { status: 400 });
    }
    
    // Construct URL using the DIRECT IP
    const targetUrl = `${targetBase}/player_api.php?username=${username}&password=${password}`;

    // Log the attempt
    console.log(`Fetching Direct IP: ${targetUrl}`);

    const serverResponse = await fetch(targetUrl, {
      method: "GET",
      headers: {
        // WE REMOVED THE HOST HEADER.
        // We are now letting the worker connect to the IP just like your browser did.
        
        "User-Agent": "IPTVSmartersPro", // Pretend to be a player app
      },
    });

    if (!serverResponse.ok) {
      const errorText = await serverResponse.text();
      return new Response(JSON.stringify({ 
        error: `Server Error: ${serverResponse.status}`,
        details: errorText.substring(0, 100) 
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