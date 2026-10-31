// Analysis markers describe uncertainty; they must never become generated lettering.
export const hasUnknownLettering=value=>typeof value==='string'&&/\[\s*(?:unreadable|illegible|unknown)\s*\]/i.test(value);
export const usableLogoTitle=value=>typeof value==='string'&&!!value.trim()&&value.trim().length<=60&&!hasUnknownLettering(value);
export function suggestedLogoTitle(job){
 const texts=(job.plan?.plan?.texts||[]).filter(t=>['logo','title'].includes(t.role));
 for(const role of ['logo','title']){const text=texts.find(t=>t.role===role&&usableLogoTitle(t.text));if(text)return text.text.trim();}
 // An unreadable visual title is not evidence that the project/file name is correct.
 return !texts.length&&usableLogoTitle(job.title)?job.title.trim():'';
}
