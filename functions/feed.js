export async function onRequestGet(context) {
  const GAS_URL = context.env.GAS_WEBAPP_URL;

  if (!GAS_URL) {
    return new Response(JSON.stringify({ ok: false, error: "Missing GAS_WEBAPP_URL" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const response = await fetch(`${GAS_URL}?r=feed`, {
      headers: { "Accept": "application/json" }
    });
    const text = await response.text();

    return new Response(text, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60", // Cache de 1 min
        "Access-Control-Allow-Origin": "*" // Permite acesso externo se precisar
      }
    });

  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e.message) }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}