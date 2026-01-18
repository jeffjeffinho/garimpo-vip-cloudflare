export async function onRequestPost(context) {
  // 1. Configurações e Variáveis de Ambiente
  // No Cloudflare, acessamos via context.env
  const GAS_URL = context.env.GAS_WEBAPP_URL;
  const GAS_TOKEN = context.env.GAS_ADMIN_TOKEN;
  const ADMIN_PIN = context.env.ADMIN_PIN;

  const request = context.request;
  const headers = request.headers;

  // 2. Validação do PIN (Blindada)
  const incomingPin = headers.get("x-admin-pin") || "";
  
  // Se não tiver PIN configurado ou não bater
  if (!ADMIN_PIN || incomingPin.trim() !== ADMIN_PIN.trim()) {
    return new Response(JSON.stringify({ ok: false, error: "Acesso negado (PIN incorreto)" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 3. Validação do GAS
  if (!GAS_URL || !GAS_TOKEN) {
    return new Response(JSON.stringify({ ok: false, error: "Erro: Variáveis de ambiente GAS ausentes" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 4. Ler o corpo da requisição (JSON)
  let body = {};
  try {
    body = await request.json();
  } catch (e) {
    body = {};
  }

  // 5. Preparar dados para enviar ao Google
  // Pegar parâmetros da URL (query string)
  const url = new URL(request.url);
  const path = url.searchParams.get("path") || "";
  
  // Copia todos os parâmetros da URL
  const query = {};
  url.searchParams.forEach((val, key) => {
    if (key !== "path") query[key] = val;
  });

  const payload = {
    token: GAS_TOKEN,
    method: request.method, // Será POST
    path: path,
    query: query,
    body: body
  };

  try {
    // 6. Fetch para o Google Apps Script
    const response = await fetch(`${GAS_URL}?r=admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const text = await response.text();

    return new Response(text, {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    });

  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e.message) }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}