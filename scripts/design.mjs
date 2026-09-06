export const themes = {
  dark: { bg:'#101613', panel:'#161e19', text:'#edf2e8', muted:'#a2b1a5', line:'#2b3c30', accent:'#c1f77c', ink:'#182715', tint:'#223720', blue:'#85dbe4', purple:'#c2b2ef', orange:'#f3bc91' },
  light:{ bg:'#f6f7f0', panel:'#edf0e5', text:'#223424', muted:'#5b6f5c', line:'#d3ddc9', accent:'#436b24', ink:'#eff5e5', tint:'#dcebc6', blue:'#207785', purple:'#7760aa', orange:'#976044' },
};
export const xml = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export const text = (x,y,value,size=16,color='currentColor',extra='') => `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" ${extra}>${xml(value)}</text>`;
export const mono = (x,y,value,size,color,extra='') => text(x,y,value,size,color,`font-family="DejaVu Sans Mono,monospace" ${extra}`);
export const line = (x1,y1,x2,y2,color,extra='') => `<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${color}" ${extra}/>`;
export const rect = (x,y,w,h,r,fill,stroke='none',extra='') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" ${extra}/>`;
export const arrow = (x,y,color) => `<g transform="translate(${x} ${y})" fill="none" stroke="${color}" stroke-width="1.8"><path d="M-6 6L6-6M-6-6H6V6"/></g>`;
export const chip = (x,y,label,p,accent=false) => { const w=label.length*8+26; return rect(x,y,w,28,14,accent?p.accent:p.panel,accent?'none':p.line)+mono(x+13,y+19,label,11,accent?p.ink:p.muted); };
export function svg(w,h,title,p,body,{frame=true,description=title,css=''}={}) {
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title desc"><title id="title">${xml(title)}</title><desc id="desc">${xml(description)}</desc><style>text{font-family:DejaVu Sans,Arial,sans-serif} ${css} @media(prefers-reduced-motion:reduce){.drift,.signal,.flow{animation:none!important}}</style>${frame?rect(1,1,w-2,h-2,22,p.bg,p.line):''}${body}</svg>\n`;
}
export function icon(kind,x,y,color,scale=1) {
 const paths={code:'M-8-6L-14 0L-8 6M8-6L14 0L8 6M3-10L-3 10',mobile:'M-6-13H6Q9-13 9-10V10Q9 13 6 13H-6Q-9 13-9 10V-10Q-9-13-6-13ZM-3 9H3M-2-9H2',data:'M-12-7V7C-12 15 12 15 12 7V-7M-12 0C-12 8 12 8 12 0M-12-7C-12-15 12-15 12-7C12 1-12 1-12-7',map:'M-14-8L-5-12L5-8L14-12V8L5 12L-5 8L-14 12ZM-5-12V8M5-8V12',cloud:'M-11 8C-22 8-20-5-10-4C-8-17 10-17 12-4C23-4 23 9 12 9H-11M-2 5V-5M-6-1L-2-5L2-1',ai:'M0-14L4-4L14 0L4 4L0 14L-4 4L-14 0L-4-4ZM12-13V-7M9-10H15'};
 return `<g transform="translate(${x} ${y}) scale(${scale})" fill="none" stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[kind]}"/></g>`;
}
