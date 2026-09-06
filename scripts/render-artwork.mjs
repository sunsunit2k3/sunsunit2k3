import { mkdir, writeFile } from 'node:fs/promises';
import { themes, svg, text, mono, line, rect, arrow, chip, icon } from './design.mjs';

const motion = '.flow{stroke-dasharray:5 12;animation:flow 18s linear infinite}@keyframes flow{to{stroke-dashoffset:-170}}.drift{animation:drift 7s ease-in-out infinite}@keyframes drift{50%{transform:translateY(-7px)}}.signal{animation:signal 5s ease-in-out infinite}@keyframes signal{50%{opacity:.3}}';

function layers(p,cx,cy,s=1) {
 const tile=(dy,fill,opacity)=>`<path d="M0 ${dy-85}L174 ${dy}L0 ${dy+85}L-174 ${dy}Z" fill="${fill}" stroke="${p.accent}" stroke-opacity="${opacity}"/>`;
 const grid=Array.from({length:9},(_,i)=>{const v=(i-4)*28;return `<path d="M${v-70} ${v*.48-34}L${v+70} ${v*.48+34}M${v-70} ${-v*.48+34}L${v+70} ${-v*.48-34}"/>`;}).join('');
 return `<g transform="translate(${cx} ${cy}) scale(${s})">${tile(83,p.panel,.15)}${tile(58,p.panel,.2)}${tile(32,p.tint,.3)}<g class="drift">${tile(0,p.panel,.65)}<defs><clipPath id="tile-grid"><path d="M0-85L174 0L0 85L-174 0Z"/></clipPath></defs><g clip-path="url(#tile-grid)" fill="none" stroke="${p.accent}" stroke-width=".8" opacity=".2">${grid}</g><path d="M-120 0L-69-25L-18 0L23-20L80 8L126-16" stroke="${p.accent}" stroke-opacity=".3" stroke-width="2" fill="none"/><path class="flow" d="M-120 0L-69-25L-18 0L23-20L80 8L126-16" stroke="${p.accent}" stroke-width="2" fill="none"/><g stroke="${p.accent}" fill="${p.bg}"><circle cx="-69" cy="-25" r="5"/><circle cx="23" cy="-20" r="6"/><circle cx="80" cy="8" r="4"/></g><path d="M23-20V-81" stroke="${p.accent}" stroke-dasharray="2 4"/><circle cx="23" cy="-87" r="6" fill="${p.accent}"/><circle class="signal" cx="23" cy="-87" r="17" fill="none" stroke="${p.accent}" opacity=".6"/></g></g>`;
}

function banner(p){
 let dots=''; for(let x=600;x<1010;x+=22)for(let y=85;y<413;y+=22)dots+=`<circle cx="${x}" cy="${y}" r=".8" fill="${p.line}"/>`;
 return svg(1040,480,'Nguyễn Sỹ Long — Software developer in Hanoi, Vietnam',p,
  `<defs><clipPath id="bounds">${rect(1,1,1038,478,22,'white')}</clipPath></defs><g clip-path="url(#bounds)">${dots}</g>`+
  rect(32,29,36,36,10,p.accent)+text(50,54,'L.',23,p.ink,'font-weight="700" text-anchor="middle"')+
  mono(82,52,'SUNSUNIT2K3',12,p.text,'letter-spacing="1"')+mono(1003,52,'HANOI, VIETNAM  /  UTC+7',11,p.muted,'text-anchor="end"')+
  line(32,83,1008,83,p.line)+mono(36,126,'XIN CHÀO, I’M',12,p.accent,'letter-spacing="2"')+
  text(32,199,'Nguyễn',68,p.text,'font-weight="700" letter-spacing="-3"')+
  text(32,271,'Sỹ Long.',68,p.accent,'font-weight="700" letter-spacing="-3"')+
  text(36,320,'Software for the',25,p.text)+text(36,354,'world beyond the screen.',25,p.text)+
  chip(36,401,'WEB',p,true)+chip(99,401,'MOBILE',p)+chip(186,401,'GEOSPATIAL',p)+
  `<ellipse cx="793" cy="374" rx="175" ry="30" fill="${p.tint}" opacity=".4"/>`+layers(p,794,239,1.07)+
  mono(622,124,'01 / IDEAS → INTERFACES',11,p.muted)+
  line(636,418,949,418,p.line)+text(638,446,'BUILD WITH PURPOSE.',11,p.muted,'letter-spacing="2"')+
  `<circle class="signal" cx="960" cy="441" r="4" fill="${p.accent}"/>`,{css:motion});
}

function section(p,n,title,side){return svg(1040,83,`${n} — ${title}`,p,mono(6,53,n,12,p.accent)+text(45,55,title,27,p.text,'font-weight="700" letter-spacing="-.6"')+mono(1033,52,side,11,p.muted,'text-anchor="end"'),{frame:false});}

function artwork(p,kind){
 if(kind==='hydro')return `<g transform="translate(357 91) scale(.63)">${Array.from({length:7},(_,i)=>`<ellipse cx="0" cy="0" rx="${45+i*17}" ry="${22+i*10}" fill="none" stroke="${p.accent}" opacity="${.6-i*.06}" transform="rotate(-25)"/>`).join('')}<path d="M-117 33Q-83-33-40-12T40-19T112-43" fill="none" stroke="${p.blue}" stroke-width="4"/><circle cx="-18" cy="2" r="6" fill="${p.accent}"/><circle class="signal" cx="-18" cy="2" r="17" fill="none" stroke="${p.accent}"/></g>`;
 if(kind==='gis')return `<g transform="translate(353 98)"><circle r="72" fill="none" stroke="${p.blue}" opacity=".2"/><circle r="49" fill="none" stroke="${p.blue}" opacity=".3"/><circle r="24" fill="none" stroke="${p.blue}" opacity=".4"/><path d="M-76 0H76M0-76V76" stroke="${p.blue}" opacity=".2"/><path d="M-55 30L-15-40L30-15L62 35L-10 55Z" fill="${p.blue}" fill-opacity=".1" stroke="${p.blue}" stroke-opacity=".5"/><g fill="${p.blue}"><circle cx="-15" cy="-40" r="4"/><circle cx="30" cy="-15" r="5"/><circle cx="-10" cy="55" r="4"/></g><circle class="signal" cx="30" cy="-15" r="13" fill="none" stroke="${p.blue}"/></g>`;
 if(kind==='data')return `<g transform="translate(335 88)">${[-30,0,30].map((y,i)=>rect(-42,y,105,22,6,p.panel,p.purple,`opacity="${.4+i*.25}"`)+`<circle cx="-28" cy="${y+11}" r="3" fill="${p.purple}"/>`+line(-13,y+11,45,y+11,p.purple,'opacity=".4"')).join('')}<path class="flow" d="M-93-45V43Q-93 61-73 61H4V52M112 4H76V-45H10" fill="none" stroke="${p.purple}" stroke-width="1.5"/><circle cx="-93" cy="-47" r="7" fill="${p.purple}"/><circle cx="114" cy="4" r="5" fill="${p.purple}"/></g>`;
 return `<g transform="translate(354 95) rotate(9)">${rect(-48,-77,96,155,16,p.panel,p.orange)}${rect(-37,-52,74,110,6,p.bg)}${rect(-12,-67,24,4,2,p.orange)}${[-30,0,30].map(y=>`<g>${rect(-25,y,12,12,3,p.orange)}<path d="M-22 ${y+6}L-19 ${y+9}L-15 ${y+3}" fill="none" stroke="${p.bg}" stroke-width="1.4"/>${line(-4,y+4,26,y+4,p.orange,'opacity=".6"')}${line(-4,y+10,14,y+10,p.orange,'opacity=".3"')}</g>`).join('')}${line(-10,68,10,68,p.orange)}</g>`;
}

const projects=[
 {file:'hydromap',n:'01',category:'GEOSPATIAL / BACKEND',title:'Cẩm Phả HydroMap',desc:'Mapping water. Making data useful.',tags:'NODE.JS  ·  EXPRESS  ·  POSTGRESQL',kind:'hydro',accent:'accent'},
 {file:'pollution',n:'02',category:'GEOSPATIAL / WEB',title:'GIS Pollution Warning',desc:'Environmental data, on the map.',tags:'JAVASCRIPT  ·  WEB GIS',kind:'gis',accent:'blue'},
 {file:'air-data',n:'03',category:'DATA / TOOLING',title:'Air Pollution Data',desc:'From scattered sources to usable data.',tags:'TYPESCRIPT  ·  DATA COLLECTION',kind:'data',accent:'purple'},
 {file:'flutter',n:'04',category:'MOBILE / FLUTTER',title:'Everyday, organized.',desc:'A to-do app for the small things.',tags:'FLUTTER  ·  DART',kind:'mobile',accent:'orange'},
];
function project(p,proj){
 const a=p[proj.accent];
 return svg(510,308,`${proj.title} — ${proj.desc}`,p,
 `<defs><clipPath id="card">${rect(1,1,508,306,20,'white')}</clipPath></defs><g clip-path="url(#card)">`+
 rect(1,1,508,167,0,p.panel)+artwork(p,proj.kind)+
 mono(25,35,proj.category,10,p.muted,'letter-spacing=".8"')+
 text(23,114,proj.n,63,a,'font-weight="700" letter-spacing="-4"')+
 mono(26,144,'SELECTED PROJECT',9,p.muted,'letter-spacing="1.5"')+
 line(1,169,509,169,p.line)+text(25,209,proj.title,23,p.text,'font-weight="700" letter-spacing="-.6"')+
 text(25,238,proj.desc,13,p.muted)+mono(25,282,proj.tags,9,a)+arrow(477,279,a)+`</g>`,{css:motion});
}

function stack(p){
 const cells=[['code','Web & APIs','JavaScript · Node.js','Express · HTML / CSS'],['mobile','Mobile','Flutter · Dart','Firebase'],['map','Geospatial','GeoServer · GIS','PostgreSQL'],['data','Data & analysis','Python · pandas · Jupyter','MongoDB · MySQL · Redis'],['cloud','Build & deploy','Docker · Git','AWS · Google Cloud'],['ai','AI in the workflow','Codex · Claude','Antigravity']];
 const body=cells.map(([kind,title,a,b],i)=>{const x=34+i%3*341;const y=35+Math.floor(i/3)*128;return rect(x,y,40,40,12,p.tint)+icon(kind,x+20,y+20,p.accent,.8)+text(x+55,y+18,title,16,p.text,'font-weight="700"')+text(x+55,y+45,a,12,p.muted)+text(x+55,y+64,b,12,p.muted);}).join('');
 return svg(1040,277,'Tools I build with',p,body+line(34,139,1006,139,p.line)+line(354,33,354,115,p.line)+line(695,33,695,115,p.line)+line(354,163,354,245,p.line)+line(695,163,695,245,p.line));
}
function footer(p){return svg(1040,110,'Explore my repositories — always building, always learning',p,
 mono(30,34,'ONE COMMIT AT A TIME.',10,p.muted,'letter-spacing="1.6"')+text(29,77,'Always building. Always learning.',27,p.text,'font-weight="700" letter-spacing="-.8"')+
 rect(752,29,257,54,27,p.accent)+text(777,62,'Explore repositories',16,p.ink,'font-weight="700"')+arrow(981,56,p.ink));}

function mobileBanner(p){return svg(510,452,'Nguyễn Sỹ Long — Web, mobile and geospatial',p,
  rect(24,24,32,32,9,p.accent)+text(40,47,'L.',21,p.ink,'font-weight="700" text-anchor="middle"')+mono(70,45,'SUNSUNIT2K3',13,p.text)+
  line(24,74,486,74,p.line)+mono(27,112,'XIN CHÀO, I’M',13,p.accent,'letter-spacing="1.7"')+
  text(22,182,'Nguyễn',64,p.text,'font-weight="700" letter-spacing="-3"')+
  text(22,253,'Sỹ Long.',64,p.accent,'font-weight="700" letter-spacing="-3"')+
  `<g opacity=".35">${layers(p,410,208,.43)}</g>`+
  text(26,303,'Software for the',23,p.text)+text(26,335,'world beyond the screen.',23,p.text)+
  chip(26,364,'WEB',p,true)+chip(89,364,'MOBILE',p)+chip(176,364,'GEOSPATIAL',p)+
  mono(27,423,'HANOI, VIETNAM / UTC+7',12,p.muted),{css:motion});}
function mobileProject(p,proj){
 const titles={hydromap:['Cẩm Phả','HydroMap'],pollution:['GIS Pollution','Warning'],'air-data':['Air Pollution','Data'],flutter:['Everyday,','organized.']};
 const a=p[proj.accent];const names=titles[proj.file];
 return svg(510,415,`${proj.title} — ${proj.desc}`,p,
 rect(1,1,508,171,20,p.panel)+artwork(p,proj.kind)+mono(25,41,proj.n,26,a)+
 text(25,235,names[0],39,p.text,'font-weight="700" letter-spacing="-1.2"')+
 text(25,284,names[1],39,p.text,'font-weight="700" letter-spacing="-1.2"')+
 mono(26,370,proj.kind==='hydro'?'NODE.JS / GIS':proj.kind==='gis'?'JAVASCRIPT / GIS':proj.kind==='data'?'TYPESCRIPT':'FLUTTER / DART',20,a)+arrow(471,365,a),{css:motion});
}
function mobileStack(p){
 const groups=[['code','Web & APIs','JavaScript · Node.js · Express'],['mobile','Mobile','Flutter · Dart · Firebase'],['map','Geospatial','GeoServer · GIS · PostgreSQL'],['data','Data & analysis','Python · pandas · Jupyter'],['cloud','Build & deploy','Docker · Git · AWS · GCP'],['ai','AI in the workflow','Codex · Claude · Antigravity']];
 return svg(510,624,'The toolkit',p,groups.map(([k,t,d],i)=>{
 const y=25+i*100;return rect(24,y,46,46,12,p.tint)+icon(k,47,y+23,p.accent)+text(88,y+21,t,21,p.text,'font-weight="700"')+text(88,y+52,d,16,p.muted)+(i<5?line(24,y+81,486,y+81,p.line):'');}).join(''));
}
function mobileSection(p,n,title){return svg(510,78,title,p,mono(6,50,n,16,p.accent)+text(43,52,title,29,p.text,'font-weight="700"'),{frame:false});}
function mobileFooter(p){return svg(510,155,'Always building. Explore repositories.',p,text(24,45,'Always building. Always learning.',22,p.text,'font-weight="700" letter-spacing="-.5"')+rect(24,72,462,55,27,p.accent)+text(48,107,'Explore repositories',20,p.ink,'font-weight="700"')+arrow(453,100,p.ink));}

await mkdir('assets',{recursive:true});
for(const [name,p] of Object.entries(themes)){
 const files={'banner':banner(p),'section-work':section(p,'01','Selected work','WEB / MOBILE / GEOSPATIAL'),'section-stack':section(p,'02','The toolkit','BUILT WITH CURIOSITY'),'section-metrics':section(p,'03','On GitHub','PUBLIC REPOSITORIES'),'toolkit':stack(p),'footer':footer(p),
 'banner-mobile':mobileBanner(p),'section-work-mobile':mobileSection(p,'01','Selected work'),'section-stack-mobile':mobileSection(p,'02','The toolkit'),'section-metrics-mobile':mobileSection(p,'03','On GitHub'),'toolkit-mobile':mobileStack(p),'footer-mobile':mobileFooter(p)};
 for(const proj of projects){files[`project-${proj.file}`]=project(p,proj);files[`project-${proj.file}-mobile`]=mobileProject(p,proj);}
 for(const [file,content] of Object.entries(files))await writeFile(`assets/${file}-${name}.svg`,content);
}
console.log('Rendered desktop and mobile artwork in both themes');
