import test from"node:test";import assert from"node:assert/strict";import fs from"node:fs";import vm from"node:vm";import ts from"typescript";import{createRequire}from"node:module";
const source=fs.readFileSync(new URL("../app/diagnostic-engine.ts",import.meta.url),"utf8"),js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText,require=createRequire(import.meta.url),mod={exports:{}},sandbox={module:mod,exports:mod.exports,require,Set,Map,Object,Math};vm.createContext(sandbox);vm.runInContext(js,sandbox);const{CORE_QUESTIONS,DIAGNOSTIC_AREAS,evaluateDiagnostic,getQuestionsForAnswers}=mod.exports;
const base={goal:"new_clients",focus:"one",audience:"fit",response:"good",message:"clear",reach:"steady",consistency:"routine"};const run=x=>evaluateDiagnostic(Object.entries({...base,...x}).map(([questionId,optionId])=>({questionId,optionId})));
test("המבנה כולל שבעה שלבים קבועים",()=>{assert.equal(CORE_QUESTIONS.length,7);assert.equal([...DIAGNOSTIC_AREAS].join("|"),"goal|focus|audience|response|message|reach|consistency");assert.equal(CORE_QUESTIONS.map(q=>q.stage).join("|"),"מטרה|מיקוד|קהל|תגובה לשיווק|מסר|קהל חדש|התמדה")});
test("בכל שאלה יש שלוש עד חמש תשובות מובחנות",()=>{for(const q of CORE_QUESTIONS){assert.ok(q.options.length>=3&&q.options.length<=5);assert.equal(new Set(q.options.map(o=>o.label)).size,q.options.length)}});
const cases=[
["מיקוד קודם למסר",{focus:"undecided",message:"scattered"},"focus"],
["הבהרה מכריעה בין מיקוד למסר",{focus:"parallel",message:"field_only",focus_message_decision:"message_root"},"message"],
["קהל ופניות לא מתאימות",{audience:"bad_leads",response:"bad_leads"},"audience"],
["תגובה חלשה כשהבסיס תקין",{response:"interest_no_lead"},"response"],
["פניות מתאימות שלא נסגרות",{response:"post_lead"},"response"],
["מסר חלש לפני חשיפה",{message:"scattered",reach:"none"},"message"],
["קהל חדש רק כשהבסיס תקין",{reach:"none"},"reach"],
["התמדה כשיש מיקוד",{consistency:"time"},"consistency"],
["עומס עם חוסר מיקוד",{focus:"parallel",consistency:"too_many"},"focus"],
["קהל רחב קודם למסר",{audience:"broad",message:"scattered"},"audience"]
];for(const[n,input,expected]of cases)test(n,()=>assert.equal(run(input).primary,expected));
test("שאלת הכרעה מופיעה רק כשיש צורך אמיתי",()=>{const answers=Object.entries({...base,focus:"parallel",message:"field_only"}).map(([questionId,optionId])=>({questionId,optionId}));assert.equal(getQuestionsForAnswers(answers).length,8);assert.equal(getQuestionsForAnswers(Object.entries(base).map(([questionId,optionId])=>({questionId,optionId}))).length,7)});
test("תשובות לא מספקות מחזירות תוצאה זהירה",()=>{const r=evaluateDiagnostic([{questionId:"goal",optionId:"new_clients"}]);assert.equal(r.primary,null);assert.equal(r.confidence,"INSUFFICIENT")});
test("התוצאות מכילות את כל שכבות האבחון והתכנית",()=>{for(const[,input]of cases){const r=run(input);assert.ok(r.evidence.length>=1);assert.equal(r.actionMap.length,3);assert.equal(r.plan.length,4);assert.ok(r.plan.every(w=>w.goal&&w.action&&w.output&&w.check));assert.ok(r.businessImpact.length>=2);assert.ok(r.progressSignals.length>=3);assert.equal(Object.keys(r.states).length,7)}});
test("אבחונים שונים מקבלים מפות ותוכניות שונות",()=>{const focus=run({focus:"undecided",message:"scattered"}),reach=run({reach:"none"}),response=run({response:"post_lead"});assert.notEqual(focus.plan[0].action,reach.plan[0].action);assert.notEqual(reach.avoid.join("|"),response.avoid.join("|"));assert.notEqual(focus.firstAction,response.firstAction)});
test("אין מקף ארוך בטקסטי המנוע",()=>assert.doesNotMatch(source,/—/));
