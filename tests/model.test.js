import test from 'node:test';
import assert from 'node:assert/strict';
import {makeRound,parseSyllables,dinosaurs,pieceAt,regionAt} from '../model.js';
test('separators preserve original spelling',()=>assert.deepEqual(parseSyllables('ма, МО\nРы\tСА'),['ма','МО','Ры','СА']));
test('empty input cannot start',()=>assert.deepEqual(makeRound(' , \n'),[]));
test('short lists cycle exactly ten times',()=>assert.deepEqual(makeRound('ма МО'),['ма','МО','ма','МО','ма','МО','ма','МО','ма','МО']));
test('extra syllables excluded',()=>assert.deepEqual(makeRound('1 2 3 4 5 6 7 8 9 10 11'),['1','2','3','4','5','6','7','8','9','10']));
test('every soil point belongs to one of ten connected-order regions',()=>{const counts=Array(10).fill(0);for(let y=0;y<530;y++)for(let x=0;x<1360;x++){let n=regionAt(x,y,1360,530);assert.ok(n>=0&&n<10);counts[n]++}assert.equal(counts.reduce((a,b)=>a+b),1360*530);assert.ok(counts.every(n=>n>60000))});
test('each dinosaur has eight distinct anatomical regions',()=>{for(const d of dinosaurs){const ids=new Set();for(let y=0;y<100;y++)for(let x=0;x<100;x++)ids.add(pieceAt(x/100,y/100,d));assert.equal(ids.size,8)}});
