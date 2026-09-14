import test from"node:test";import assert from"node:assert/strict";import fs from"node:fs";import vm from"node:vm";import ts from"typescript";import{createRequire}from"node:module";
const source=fs.readFileSync(new URL("../app/diagnostic-engine.ts",import.meta.url),"utf8"),js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText,require=createRequire(import.meta.url),mod={exports:{}},sandbox={module:mod,exports:mod.exports,require,Set,Map,Object,Math};vm.createContext(sandbox);vm.runInContext(js,sandbox);const{CORE_QUESTIONS,DIAGNOSTIC_AREAS,evaluateDiagnostic}=mod.exports;const base={goal:"more_leads",focus:"clear",audience:"clear",response:"good",message:"clear",reach:"steady",consistency:"consistent"},run=x=>evaluateDiagnostic(Object.entries({...base,...x}).map(([questionId,optionId])=>({questionId,optionId})));
test("המבנה כולל בדיוק שבע שאלות ושבעה תחומים",()=>{assert.equal(CORE_QUESTIONS.length,7);assert.equal([...DIAGNOSTIC_AREAS].join("|"),"goal|focus|audience|response|message|reach|consistency");assert.equal(CORE_QUESTIONS.map(q=>q.stage).join("|"),"מטרה|מיקוד|קהל|תגובה לשיווק|מסר|קהל חדש|התמדה")});
const scenarios=[
 ["A תגובה חלשה כשהבסיס תקין",{response:"interest_low_action"},"response"],
 ["B כיוון קודם למסר",{goal:"order",focus:"unsure",message:"scattered"},"focus"],
 ["C רק קהל חדש חלש",{reach:"none"},"reach"],
 ["D רק התמדה חלשה",{consistency:"no_time"},"consistency"],
 ["E קהל חלש ופניות לא מתאימות",{audience:"unsuitable",response:"bad_leads"},"audience"],
 ["F חשיפה קיימת בלי תגובה ומסר מפוזר",{response:"no_response",message:"scattered"},"message"],
 ["G פניות נכנסות ואינן נסגרות",{response:"postlead"},"response"],
 ["H קהל קודם למסר כששניהם חלשים",{audience:"broad",message:"scattered"},"audience"],
 ["I מסר חלש פוסל אבחון חשיפה",{message:"disconnected",reach:"none"},"message"],
 ["J חוסר בהירות קודם לעומס",{goal:"order",focus:"several",consistency:"dont_know"},"focus"]
];for(const[name,input,expected]of scenarios)test(name,()=>assert.equal(run(input).primary,expected));
test("עשרה תרחישים מייצרים מגוון אבחונים",()=>{const found=new Set(scenarios.map(([,x])=>run(x).primary));assert.ok(found.size>=6)});
test("כל תוצאה מכילה דפוס, עדויות, היררכיה ותכנית אישית",()=>{for(const[,x]of scenarios){const r=run(x);assert.ok(r.headline.length>35);assert.ok(r.summary.length>45);assert.ok(r.evidence.length>=1);assert.equal(r.steps.length,3);assert.equal(r.plan.length,4);assert.equal(r.avoid.length,3);assert.equal(Object.keys(r.states).length,7)}});
test("הרבה תשובות לא ידועות מחזירות מידע לא מספיק",()=>{const r=run({audience:"unknown",response:"unknown",message:"unknown",reach:"unknown"});assert.equal(r.primary,null);assert.equal(r.confidence,"INSUFFICIENT")});
test("אין מקף ארוך בטקסטי המנוע",()=>assert.doesNotMatch(source,/—/));
