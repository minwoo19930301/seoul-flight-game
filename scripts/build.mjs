// An offline static build with an explicit public payload allowlist.
// No deployment, authentication, dependency download or browser operation.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const root=fileURLToPath(new URL('../',import.meta.url)),out=path.join(root,'dist');
const modules=fs.readdirSync(root).filter(name=>name.endsWith('.mjs'));
for(const file of modules)execFileSync(process.execPath,['--check',path.join(root,file)]);
const files=['index.html','index-seoul-flight.html','seoul-flight.css','README.md',...modules,'vendor','assets/landmarks','assets/full-seoul','scripts/generic-window-original.png','docs'];
if(fs.existsSync(path.join(root,'LICENSE')))files.push('LICENSE');
fs.mkdirSync(out,{recursive:true});
for(const name of files){const destination=path.join(out,name);fs.mkdirSync(path.dirname(destination),{recursive:true});fs.cpSync(path.join(root,name),destination,{recursive:true});}
for(const file of modules){
  const text=fs.readFileSync(path.join(out,file),'utf8');
  for(const match of text.matchAll(/(?:from\s*|import\s*|new URL\s*\(\s*)['"](\.\.?\/[^'"]+)['"]/g))assertLocal(match[1],file);
}
function assertLocal(url,owner){if(!fs.existsSync(path.resolve(out,path.dirname(owner),url.split('?')[0])))throw Error('Missing static module: '+url+' from '+owner);}
function inventory(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(f=>f.isDirectory()?inventory(path.join(dir,f.name)):[{path:path.relative(out,path.join(dir,f.name)),bytes:fs.statSync(path.join(dir,f.name)).size}]);}
const inventoryFiles=inventory(out);for(const f of inventoryFiles)if(f.bytes>=100*1024*1024)throw Error('Oversized public file '+f.path);
for(const old of ['assets/seoul-scene-data.json','assets/seoul-raster-map.png','assets/city/manifest.json'])if(fs.existsSync(path.join(out,old)))throw Error('Legacy central-city payload in static build: '+old);
console.log(JSON.stringify({status:'PASS',syntaxModules:modules.length,files:inventoryFiles.length,bytes:inventoryFiles.reduce((s,f)=>s+f.bytes,0),largestFile:inventoryFiles.sort((a,b)=>b.bytes-a.bytes)[0],notes:'CPU/static build only, no browser or GPU test. Source databases are retained but are never startup fetches.'},null,2));
