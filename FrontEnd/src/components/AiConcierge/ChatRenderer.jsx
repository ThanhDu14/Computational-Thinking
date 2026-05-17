import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import './ChatCards.css';

/**
 * Shared chat message renderer.
 * Handles: JSON objects, markdown json blocks, location_name text, plain text.
 * Used by both FloatingChatWidget and AiConciergePage.
 */
const renderMessageContent = (text, sendMessage) => {
  if (!text) return <span></span>;

  const formatBold = (str) => {
    if (typeof str !== 'string') return str;
    return str.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className="font-bold">{part}</strong> : part);
  };

  // --- 0. TRY PARSE JSON ---
  let messageData = null;
  if (typeof text === 'object' && text !== null) {
    messageData = text;
  } else if (typeof text === 'string') {
    const trimmed = text.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try { messageData = JSON.parse(trimmed); } catch (e) { /* not JSON */ }
    }
  }

  // --- 1. STRUCTURED JSON { message, data } ---
  if (messageData && (messageData.message || messageData.data)) {
    const mainMessage = messageData.message || "";
    const locations = Array.isArray(messageData.data) ? messageData.data : [];
    return (
      <div className="flex flex-col gap-4">
        {mainMessage && (
          <div className="chat-main-message">{formatBold(mainMessage)}</div>
        )}
        {locations.length > 0 && (
          <div className="flex flex-col gap-4 mt-1">
            {locations.map((item, i) => {
              const name = item.location || item.location_name;
              if ((!name || name === 'NULL') && !item.description) return null;
              return renderPlaceCard(item, i, { name, formatBold });
            })}
          </div>
        )}
      </div>
    );
  }

  // Ensure string for remaining checks
  const stringContent = typeof text === 'string' ? text : JSON.stringify(text);

  // --- 2. MARKDOWN JSON BLOCKS ```json ... ``` ---
  if (stringContent.includes('```json')) {
    const blockRegex = /```json\s*([\s\S]*?)\s*```/gi;
    const elements = [];
    let lastIndex = 0;
    let match;
    while ((match = blockRegex.exec(stringContent)) !== null) {
      let beforeText = stringContent.substring(lastIndex, match.index)
        .replace(/(?:\r?\n)+\s*\d+[\.\/\s-]+\s*(?:\*\*.*?\*\*|.*?)?\s*$/g, '');
      if (beforeText.trim()) {
        elements.push(<div key={`text-${lastIndex}`} className="whitespace-pre-wrap mb-2">{formatBold(beforeText.trim())}</div>);
      }
      try {
        let cleaned = match[1].trim().replace(/"rating"\s*:\s*(\d+(?:\.\d+)?)\s*\/\s*5/g, '"rating": "$1/5"');
        const place = JSON.parse(cleaned);
        if (place && place.name) {
          elements.push(renderPlaceCard(place, match.index, { name: place.name.replace(/^\d+[\.\/\s-]+\s*/, ''), formatBold }));
        }
      } catch (e) {
        elements.push(<pre key={match.index} className="bg-on-surface/5 p-2 rounded text-xs overflow-x-auto">{match[1]}</pre>);
      }
      lastIndex = blockRegex.lastIndex;
    }
    const rem = stringContent.substring(lastIndex);
    if (rem.trim()) elements.push(<div key="text-final" className="whitespace-pre-wrap mt-2">{formatBold(rem.trim())}</div>);
    if (elements.length > 0) return <div className="space-y-2">{elements}</div>;
  }

  // --- 3. CHIP FORMAT ["option1","option2"] ---
  if (stringContent.trim().startsWith('[') && stringContent.trim().endsWith(']')) {
    try {
      const chips = JSON.parse(stringContent);
      if (Array.isArray(chips) && chips.every(c => typeof c === 'string')) {
        return (
          <div className="flex flex-wrap gap-2 py-1">
            {chips.map((chip, i) => (
              <button key={i} onClick={() => sendMessage?.(chip)} className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-full text-xs font-medium border border-primary/20 transition-all active:scale-95">
                {chip}
              </button>
            ))}
          </div>
        );
      }
    } catch (e) {}
  }

  // --- 4. BENTO/GRID FORMAT (###) ---
  if (stringContent.includes('###')) {
    const sections = stringContent.split('###').filter(s => s.trim());
    return (
      <div className="grid grid-cols-1 gap-3 w-full">
        {sections.map((section, i) => {
          const [title, ...rest] = section.split('\n');
          return (
            <div key={i} className="p-3 bg-surface/50 border border-on-surface/5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-bold text-primary mb-1 text-[14px]">{formatBold(title.trim())}</h4>
              <div className="text-[13px] text-on-surface-variant leading-relaxed">{formatBold(rest.join('\n').trim())}</div>
            </div>
          );
        })}
      </div>
    );
  }

  // --- 5. TEXT-BASED: location_name: ... (flexible order, supports uri/url) ---
  if (stringContent.includes('location_name:')) {
    const elements = [];
    const firstLocIdx = stringContent.indexOf('location_name:');
    const preamble = stringContent.substring(0, firstLocIdx).replace(/^Message:\s*/i, '').trim();
    if (preamble) {
      elements.push(<div key="main-message" className="chat-main-message">{formatBold(preamble)}</div>);
    }

    const blocks = stringContent.substring(firstLocIdx).split(/(?=location_name:)/gi).filter(b => b.trim());
    blocks.forEach((block, idx) => {
      const get = (key) => {
        const re = new RegExp(key + ':\\s*(.+?)(?=\\n\\s*\\w+:|$)', 'is');
        const m = block.match(re);
        return m ? m[1].trim() : null;
      };
      const name = get('location_name');
      const address = get('address');
      const desc = get('description');
      const rating = get('overall_rating');
      const rawUrl = get('url') || get('uri');
      const catStr = get('category');
      if (!name || name === 'NULL') return;

      let categories = [];
      if (catStr && catStr !== 'NULL') {
        try { categories = JSON.parse(catStr.replace(/'/g, '"')); }
        catch (e) { categories = catStr.replace(/[\[\]']/g, '').split(',').map(c => c.trim()).filter(Boolean); }
      }
      const url = rawUrl && rawUrl !== 'NULL' && rawUrl !== '#' ? rawUrl : null;

      elements.push(
        <div key={`place-${idx}`} className="chat-place-card">
          <div className="card-header">
            <h4 className="card-title">{name}</h4>
            {rating && rating !== 'NULL' && <span className="card-rating">⭐ {rating}</span>}
          </div>
          {categories.length > 0 && (
            <div className="card-tags">{categories.map((cat, ci) => <span key={ci} className="card-tag">#{cat}</span>)}</div>
          )}
          {desc && desc !== 'NULL' && <p className="card-desc">{desc}</p>}
          {address && address !== 'NULL' && (
            <div className="card-address"><MapPin size={14} className="shrink-0 mt-0.5" /><span>{address}</span></div>
          )}
          {url && <a href={url} target="_blank" rel="noopener noreferrer" className="card-link">Khám phá ngay <ExternalLink size={14} /></a>}
        </div>
      );
    });
    if (elements.length > 0) return <div className="flex flex-col">{elements}</div>;
  }

  // --- 6. FALLBACK: plain text ---
  return <div className="whitespace-pre-wrap">{formatBold(stringContent)}</div>;
};

/** Reusable place card renderer */
function renderPlaceCard(item, key, opts = {}) {
  const name = opts.name || item.location || item.location_name || item.name || 'Địa điểm';
  const displayName = name !== 'NULL' ? name : 'Địa điểm đề xuất';
  const rating = item.overall_rating || item.rating;
  const desc = item.description;
  const address = item.address;
  const url = item.url || item.uri;
  const rawCats = item.category || item.categories || [];
  const categories = Array.isArray(rawCats) ? rawCats.filter(c => c && c !== 'NULL') : [];

  return (
    <div key={key} className="chat-place-card">
      <div className="card-header">
        <h4 className="card-title">{displayName}</h4>
        {rating && rating !== 'NULL' && <span className="card-rating">⭐ {rating}</span>}
      </div>
      {categories.length > 0 && (
        <div className="card-tags">{categories.map((cat, ci) => <span key={ci} className="card-tag">#{cat}</span>)}</div>
      )}
      {desc && desc !== 'NULL' && <p className="card-desc">{desc}</p>}
      {address && address !== 'NULL' && (
        <div className="card-address"><MapPin size={14} className="shrink-0 mt-0.5" /><span>{address}</span></div>
      )}
      {url && url !== '#' && url !== 'NULL' && (
        <a href={url} target="_blank" rel="noopener noreferrer" className="card-link">Khám phá ngay <ExternalLink size={14} /></a>
      )}
    </div>
  );
}

export default renderMessageContent;
