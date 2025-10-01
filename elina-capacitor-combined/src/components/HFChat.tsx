import React, { useState } from 'react';
import { queryHuggingFace } from '../lib/hfClient';

export default function HFChat() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Array<{role:string, text:string}>>([]);
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState('gpt2'); // default model; change to a better HF model if desired

  async function send() {
    if (!prompt) return;
    setMessages(m => [...m, {role:'user', text: prompt}]);
    setLoading(true);
    try {
      const res = await queryHuggingFace(prompt, model);
      setMessages(m => [...m, {role:'assistant', text: res}]);
    } catch (e:any) {
      setMessages(m => [...m, {role:'assistant', text: 'Error: ' + e.message}]);
    } finally {
      setLoading(false);
      setPrompt('');
    }
  }

  return (
    <div style={{padding:16}}>
      <h3>Hugging Face Chat</h3>
      <div style={{marginBottom:8}}>
        <label>Model: </label>
        <input value={model} onChange={e=>setModel(e.target.value)} style={{width:300}} />
        <small style={{display:'block'}}>Use model endpoint name (e.g., gpt2, distilgpt2, EleutherAI/gpt-neo-2.7B)</small>
      </div>
      <div style={{border:'1px solid #ddd', padding:8, height:260, overflow:'auto'}}>
        {messages.map((m,i)=>(<div key={i}><strong>{m.role}:</strong> {m.text}</div>))}
        {loading && <div><em>Thinking…</em></div>}
      </div>
      <div style={{marginTop:8, display:'flex', gap:8}}>
        <input style={{flex:1}} value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Ask something..." />
        <button onClick={send} disabled={loading}>Send</button>
      </div>
      <p style={{color:'#666', marginTop:8}}>Note: public HF endpoints have rate limits. For more capacity set HF_TOKEN on window (or use native storage).</p>
    </div>
  );
}
