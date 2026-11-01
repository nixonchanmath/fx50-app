// Copy a fresh build of fx50-live into this repo for GitHub Pages.
// Usage (from this repo's root):
//   node ../fx50-live/variants/standard/check.mjs && node ../fx50-live/variants/standard/prepare-publish.mjs
//   node tools/sync-from-source.mjs ../fx50-live/variants/standard/public
// GitHub Pages serves this site under /fx50-app/, so root-absolute paths
// ("/icons/...", "/manifest.webmanifest") are rewritten to relative ones.
// The icons in ./icons-src are the published icons and replace the build's.
import {cpSync,readdirSync,readFileSync,writeFileSync,rmSync,existsSync,statSync} from 'node:fs';
import {join} from 'node:path';
const src=process.argv[2];
if(!src||!existsSync(join(src,'index.html')))throw Error('Pass the built public/ folder of fx50-live');
const keep=new Set(['.git','.nojekyll','README.md','tools','icons-src']);
for(const n of readdirSync('.'))if(!keep.has(n))rmSync(n,{recursive:true,force:true});
cpSync(src,'.',{recursive:true});
cpSync('icons-src','icons',{recursive:true});
const ICON_V='2';
const fix=(file,up)=>{let h=readFileSync(file,'utf8');
  h=h.replace(/(href|src)="\/icons\/([^"?]+)(\?v=[^"]*)?"/g,(_,a,f)=>`${a}="${up}icons/${f}?v=${ICON_V}"`)
     .replace(/href="\/manifest\.webmanifest"/g,`href="${up}manifest.webmanifest"`);
  if(/(href|src)="\/[^/]/.test(h))throw Error('Root-absolute path left in '+file);
  writeFileSync(file,h);};
for(const n of readdirSync('.'))if(n.endsWith('.html'))fix(n,'');
for(const n of readdirSync('dist'))if(n.endsWith('.html'))fix(join('dist',n),'../');
const m=JSON.parse(readFileSync('manifest.webmanifest','utf8'));
m.id='./';m.start_url='./';m.scope='./';
m.icons=m.icons.map(i=>({...i,src:i.src.replace(/^\//,'')}));
writeFileSync('manifest.webmanifest',JSON.stringify(m,null,2)+'\n');
console.log('Synced', JSON.parse(readFileSync('release.json','utf8')).version);
