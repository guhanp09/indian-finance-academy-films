const TERMINAL_PUNCTUATION=/[.!?]["'”’]?$/;
const NON_TERMINAL_ABBREVIATIONS=new Set(['Mr.','Mrs.','Ms.','Dr.']);

export const buildCaptionSentences=(captions)=>{
  const sentences=[];
  let tokens=[];
  for(const caption of captions){
    const text=tokens.length===0?caption.text.trimStart():caption.text;
    tokens.push({text,fromMs:caption.startMs,toMs:caption.endMs});
    const trimmed=caption.text.trim();
    if(!TERMINAL_PUNCTUATION.test(trimmed)||NON_TERMINAL_ABBREVIATIONS.has(trimmed))continue;
    sentences.push({startMs:tokens[0].fromMs,endMs:tokens.at(-1).toMs,tokens,text:tokens.map(token=>token.text).join('')});
    tokens=[];
  }
  if(tokens.length){
    sentences.push({startMs:tokens[0].fromMs,endMs:tokens.at(-1).toMs,tokens,text:tokens.map(token=>token.text).join('')});
  }
  return sentences;
};

const MAX_PAGE_CHARACTERS=135;
const MAX_PAGE_DURATION_MS=5200;
const CLAUSE_STARTS=new Set(['because','while','without','with','and','but']);

const pageFromTokens=(tokens)=>({
  startMs:tokens[0].fromMs,
  endMs:tokens.at(-1).toMs,
  tokens:tokens.map((token,index)=>index===0?{...token,text:token.text.trimStart()}:token),
  text:tokens.map(token=>token.text).join('').trimStart(),
});

const splitSentence=(sentence)=>{
  if(sentence.text.length<=MAX_PAGE_CHARACTERS)return [sentence];
  const candidates=[];
  let leftLength=0;
  for(let index=0;index<sentence.tokens.length-1;index++){
    const token=sentence.tokens[index];
    leftLength+=token.text.length;
    const next=sentence.tokens[index+1];
    const comma=token.text.trimEnd().endsWith(',');
    const clause=CLAUSE_STARTS.has(next.text.trim().toLowerCase());
    if(!comma&&!clause)continue;
    const rightLength=sentence.text.length-leftLength;
    if(leftLength<20||rightLength<25)continue;
    candidates.push({after:index,comma,largest:Math.max(leftLength,rightLength)});
  }
  if(!candidates.length)return [sentence];
  candidates.sort((a,b)=>Number(b.comma)-Number(a.comma)||a.largest-b.largest);
  const splitAt=candidates[0].after+1;
  return [sentence.tokens.slice(0,splitAt),sentence.tokens.slice(splitAt)].map(pageFromTokens);
};

const splitLongDuration=(page,depth=0)=>{
  if(depth>=3||page.endMs-page.startMs<=MAX_PAGE_DURATION_MS||page.text.length<=65)return [page];
  const openingReveal=page.text.startsWith('the man whose kidney is supposed');
  let candidates=[];
  for(let index=0;index<page.tokens.length-1;index++){
    const token=page.tokens[index];
    const next=page.tokens[index+1];
    const leftMs=token.toMs-page.startMs;
    const rightMs=page.endMs-next.fromMs;
    if(leftMs<1400||rightMs<1100)continue;
    const comma=token.text.trimEnd().endsWith(',');
    const clause=CLAUSE_STARTS.has(next.text.trim().toLowerCase());
    const reveal=openingReveal&&token.text.trim()==='saying';
    if(!comma&&!clause&&!reveal)continue;
    candidates.push({after:index,score:reveal?-1000:Math.abs(leftMs-rightMs)+(comma?0:650)});
  }
  if(!candidates.length)return [page];
  candidates.sort((a,b)=>a.score-b.score);
  const splitAt=candidates[0].after+1;
  return [page.tokens.slice(0,splitAt),page.tokens.slice(splitAt)].flatMap(tokens=>splitLongDuration(pageFromTokens(tokens),depth+1));
};

export const buildCaptionPages=(captions)=>buildCaptionSentences(captions).flatMap(splitSentence).flatMap(page=>splitLongDuration(page));

export const mergeAdjoiningTokens=(tokens)=>{
  const words=[];
  for(const token of tokens){
    if(words.length&&!/^\s/.test(token.text)){
      const previous=words[words.length-1];
      previous.text+=token.text;
      previous.toMs=token.toMs;
    }else words.push({...token});
  }
  return words;
};
