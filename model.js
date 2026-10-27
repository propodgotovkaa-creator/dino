export function parseSyllables(raw){return raw.split(/[\s,]+/u).filter(Boolean)}
export function makeRound(raw){const words=parseSyllables(raw);return words.length?Array.from({length:10},(_,i)=>words[i%Math.min(10,words.length)]):[]}
export const dinosaurs=[
 {id:'rex',name:'Тираннозавр',latin:'Tyrannosaurus rex',place:'Сухая каменистая долина',tint:'rgba(108,83,40,.10)'},
 {id:'triceratops',name:'Трицератопс',latin:'Triceratops',place:'Песчаный карьер',tint:'rgba(222,184,94,.12)'},
 {id:'stegosaurus',name:'Стегозавр',latin:'Stegosaurus',place:'Красные песчаники',tint:'rgba(151,52,20,.22)'},
 {id:'velociraptor',name:'Велоцираптор',latin:'Velociraptor',place:'Песчаная пустыня',tint:'rgba(235,204,133,.16)'}
];
// Each pixel of the same fossil image is assigned exactly once. Species-specific
// boundaries preserve skull, neck, ribs, pelvis, tail and substantial limb groups.
export function pieceAt(x,y,d){
 if(d.id==='rex'){
  if(x<.175)return 0;
  if(x>.47&&y<.49)return 4;
  if(x<.24&&y<.34)return 1;
  if(x<.28&&y>=.34&&y<.60)return 5;
  if(x<.36&&y<.54)return 2;
  if(y<.49)return 3;
  return x<.40?6:7;
 }
 if(d.id==='velociraptor'){
  if(x<.145)return 0;
  if(x>.47&&y<.49)return 4;
  if(x<.215&&y<.40)return 1;
  if(x<.32&&y>=.49&&y<.76)return 5;
  if(x<.36&&y<.52)return 2;
  if(y<.50)return 3;
  return x<.415?6:7;
 }
 if(d.id==='triceratops'){
  if(x<.37)return 0;
  if(x<.425&&y<.52)return 1;
  if(x>.78&&y<.72)return 4;
  if(y>=.59&&x<.53)return 5;
  if(y>=.59&&x<.68)return 6;
  if(y>=.59)return 7;
  return x<.64?2:3;
 }
 // Stegosaurus: dorsal plates are a separate characteristic skeletal element.
 if(x<.11)return 0;
 if(x<.235&&y>.43)return 1;
 if(y<.36)return 3;
 if(x>.69)return 4;
 if(y>.62&&x<.36)return 5;
 if(y>.62&&x<.53)return 6;
 if(y>.62)return 7;
 return 2;
}
export function regionAt(x,y,w,h){const row=y<h/2?0:1;let col=Math.max(0,Math.min(4,Math.floor((x+24*Math.sin(y/47))/ (w/5))));return row===0?col:9-col}
