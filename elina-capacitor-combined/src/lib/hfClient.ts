// src/lib/hfClient.ts
// Lightweight wrapper to call Hugging Face Inference API using a model endpoint.
// This uses the public inference endpoint. For higher rate limits provide HF_TOKEN in app.
export async function queryHuggingFace(prompt: string, model='gpt2') {
  const base = 'https://api-inference.huggingface.co/models';
  const url = `${base}/${model}`;
  const body = { inputs: prompt, options: { wait_for_model: true } };
  // If you want higher limits create an HF account and put your token in native config.
  const headers: any = { 'Content-Type': 'application/json' };
  if ((window as any).HF_TOKEN) headers['Authorization'] = 'Bearer ' + (window as any).HF_TOKEN;
  const resp = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error('Hugging Face API error: ' + resp.status + ' ' + txt);
  }
  const data = await resp.json();
  // Data shape depends on model; handle both string and array responses
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) {
    if (data.length && typeof data[0] === 'string') return data.join('\n');
    if (data[0] && data[0].generated_text) return data[0].generated_text;
  }
  return JSON.stringify(data);
}
