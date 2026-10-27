import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import * as model from '../model.js';
const require=createRequire(import.meta.url);
const {createCanvas,loadImage}=require(process.env.CANVAS_MODULE||'@napi-rs/canvas');
const root=path.resolve(import.meta.dirname,'..');
class Element {
 constructor(id){this.id=id;this.value='';this.textContent='';this.style={};this.handlers={};this.children=[];this.disabled=false;this.classes=new Set();this.classList={add:n=>this.classes.add(n),remove:n=>this.classes.delete(n),toggle:()=>{}}}
 addEventListener(n,f){(this.handlers[n]??=[]).push(f)}
 dispatch(n,e){for(const f of this.handlers[n]||[])f(e)}
 setAttribute(){} focus(){} append(...v){this.children.push(...v)} replaceChildren(...v){this.children=v}
}
function fixture(){let time=0,raf=[],elements={};const get=id=>elements[id]??=new Element(id);for(const [id,w,h]of [['earth',1536,650],['assembly',1480,660]]){const c=createCanvas(w,h);Object.assign(c,new Element(id));c.addEventListener=Element.prototype.addEventListener;c.dispatch=Element.prototype.dispatch;c.setPointerCapture=()=>{};c.getBoundingClientRect=()=>({left:0,top:0,width:w,height:h});elements[id]=c}
 const document={getElementById:get,querySelectorAll:()=>[],createElement:n=>n==='canvas'?createCanvas(1,1):new Element(n)};
 const context=vm.createContext({...model,document,innerWidth:1600,innerHeight:900,addEventListener(){},localStorage:{getItem(){return null},setItem(){}},window:{},performance:{now:()=>time},requestAnimationFrame:f=>{raf.push(f);return raf.length},cancelAnimationFrame(){},console});
 let source=fs.readFileSync(path.join(root,'game.js'),'utf8').replace(/^import[^\n]+\n/,'').replace(/load\(\);\s*$/,'');
 vm.runInContext(source+`;globalThis.engine={state,images,prepareEarth,updateReading,show,erase,measure,createPieces,fit,getLayers:()=>layers,getParts:()=>parts};`,context);
 return{e:context.engine,get,tick(ms=1000){time+=ms;const q=raf;raf=[];q.forEach(f=>f(time))},advance(ms=150){time+=ms}};
}
const event=(x,y,id=1)=>({clientX:x,clientY:y,pointerId:id,preventDefault(){}});
test('all four rounds: gated excavation, persistent masks, 40 thresholds, wrong drops, 32 correct placements, museum and restart',async()=>{
 const f=fixture(),e=f.e;for(const id of ['rex','triceratops','stegosaurus','velociraptor','soil'])e.images[id]=await loadImage(path.join(root,'assets',id+'.webp'));
 const results=[];
 f.get('syllables').value='ма, МО\nРы';
 for(let round=0;round<4;round++){
  assert.equal(e.state.round,round);f.get('begin').onclick();assert.equal(e.state.screen,'dig');
  const first=e.getLayers()[0].mid.getContext('2d'),before=Buffer.from(first.getImageData(0,0,1536,650).data);
  f.get('earth').dispatch('pointerdown',event(60,60));f.get('earth').dispatch('pointermove',event(200,200));
  assert.deepEqual(Buffer.from(first.getImageData(0,0,1536,650).data),before,'locked brush must not erase');
  for(let step=0;step<10;step++){
   assert.equal(e.state.step,step);assert.equal(e.state.unlocked,false);assert.equal(f.get('syllable').textContent,['ма','МО','Ры'][step%3]);
   assert.equal(f.get('syllable').classes.has('hidden'),false);assert.equal(f.get('syllable').style.top,`${step<5?162.5:487.5}px`);
   f.get('read').onclick();assert.equal(f.get('syllable').classes.has('hidden'),true);const col=step<5?step:9-step,y0=step<5?0:325;
   for(let pass=0;pass<3&&e.state.unlocked;pass++){
    f.get('earth').dispatch('pointerdown',event(col*307.2+3,y0+3));
    for(let y=y0+3;y<y0+325&&e.state.unlocked;y+=14){f.advance();for(let x=col*307.2+3;x<Math.min(1536,(col+1)*307.2+20)&&e.state.unlocked;x+=9)f.get('earth').dispatch('pointermove',event(x,y));}
    f.get('earth').dispatch('pointerup',event(col*307.2+3,y0+320));
   }
   assert.equal(e.state.transition,true,`round ${round} step ${step} must reach 80%`);f.tick();assert.equal(e.getLayers()[step].done,true);e.fit();assert.equal(e.getLayers()[step].done,true,'resize preserves cleared region');
  }
  assert.equal(e.state.screen,'discovery');f.get('assemble').onclick();assert.equal(e.state.screen,'puzzle');
  const parts=e.getParts();assert.equal(parts.length,8);assert.ok(parts.every(p=>p.img.width>0&&p.img.height>0));
  const p=parts[0];f.get('assembly').dispatch('pointerdown',event(p.sx+p.sw/2,p.sy+p.sh/2));f.get('assembly').dispatch('pointermove',event(1400,620));f.get('assembly').dispatch('pointerup',event(1400,620));assert.equal(e.state.placed,0);
  for(const p of parts){f.get('assembly').dispatch('pointerdown',event(p.sx+p.sw/2,p.sy+p.sh/2));f.get('assembly').dispatch('pointermove',event(p.tx+p.tw/2,p.ty+p.th/2));f.get('assembly').dispatch('pointerup',event(p.tx+p.tw/2,p.ty+p.th/2));assert.equal(p.placed,true)}
  assert.equal(e.state.placed,8);results.push({round:round+1,pieces:parts.map(p=>[p.img.width,p.img.height])});f.get('next').onclick();assert.equal(f.get('syllables').value,'ма, МО\nРы');
 }
 assert.equal(e.state.screen,'final');assert.equal(f.get('exhibits').children.length,4);f.get('again').onclick();assert.equal(e.state.screen,'setup');assert.equal(e.state.round,0);console.log(JSON.stringify(results));
});
