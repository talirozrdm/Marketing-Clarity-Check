"use client";
/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react";
import { CORE_QUESTIONS, buildQuestionPath, evaluateDiagnostic, type AnswerRecord, type Bottleneck, type Primary, type Question } from "./diagnostic-engine";

type ResultCopy = { title:string; summary:string; impact:string; notNow:string };
const results:Record<Primary,ResultCopy>={
 DIRECTION:{title:"חסר כיוון שיווקי ברור",summary:"כרגע השיווק שלך נתקע בעיקר כי אין מטרה אחת והצעה אחת שמובילות את שאר הפעולות.",impact:"זה יוצר יותר התלבטויות, מעבר תכוף בין רעיונות ותחושה שצריך לעשות הכול." ,notNow:"לא לפתוח עוד ערוץ ולא להתחיל קמפיין חדש. קודם מייצרים כיוון שמארגן את הפעולות הקיימות."},
 AUDIENCE_OFFER:{title:"הקהל או ההצעה עדיין לא מספיק מדויקים",summary:"הכיוון קיים, אבל החיבור בין הלקוחה הנכונה, הצורך שלה וההצעה עדיין אינו חד מספיק.",impact:"התוצאה היא יותר פניות לא מתאימות, צורך בהסברים רבים ותגובה חלשה גם כשהשיווק פעיל.",notNow:"לא להגדיל חשיפה לפני שהחיבור בין הקהל להצעה ברור. חשיפה נוספת עלולה רק להגדיל את חוסר הדיוק."},
 MESSAGE_CONTENT:{title:"המסר שלך לא מספיק מחובר להצעה שאת רוצה לקדם",summary:"יש פעילות ותוכן, אבל לא תמיד ברור איך כל פרסום מחזק את מה שאת רוצה לקדם.",impact:"נוצרת הרבה עשייה בלי ודאות שהיא מייצרת הבנה, עניין או תנועה עסקית.",notNow:"לא לפרסם יותר רק כדי להיות עקבית ולא להוסיף עוד פורמטים. קודם מחברים את התוכן למסר מרכזי אחד."},
 CONVERSION_PATH:{title:"העניין קיים, אבל הדרך לפנייה נעצרת",summary:"כבר נוצר עניין, אבל המעבר ממנו לפנייה או מהפנייה לשלב הבא אינו פשוט ועקבי מספיק.",impact:"אנשים מתעניינים או אפילו פונים, אבל חלק מהם הולכים לאיבוד לפני שהעניין הופך ללקוחה.",notNow:"לא להזרים עוד תנועה למסלול לפני שמתקנים אותו. עוד חשיפה לא תפתור נקודת עצירה בדרך לפנייה."},
 REACH:{title:"הבסיס קיים. עכשיו חסרה חשיפה",summary:"הכיוון, הקהל והדרך לפנייה נראים תקינים יחסית, אבל לא נכנסים מספיק אנשים חדשים ורלוונטיים.",impact:"השיווק יכול לעבוד היטב כשפוגשים אותך, אך אין מספיק הזדמנויות חדשות ליצירת קצב יציב.",notNow:"לא לבנות מחדש את המיתוג ולא להחליף הצעה שעובדת. המיקוד הוא להביא אליה יותר מהקהל הנכון."},
 CAPACITY:{title:"השיווק דורש ממך יותר ממה שאפשר להחזיק",summary:"התוכנית דורשת יותר זמן, פעולות או אנרגיה ממה שיש בפועל, גם כשברור מה צריך לעשות.",impact:"נוצרת תחושה שאת תמיד מאחור, מתחילה מחדש או נאלצת לבחור בין העבודה עצמה לבין השיווק.",notNow:"לא להוסיף פלטפורמה, תדירות או משימות חדשות. קודם בונים קצב שאפשר לקיים לאורך זמן."},
 INSUFFICIENT_EVIDENCE:{title:"עדיין אין מספיק מידע כדי להכריע",summary:"התשובות מצביעות על יותר מאפשרות אחת, ולכן אבחנה חד משמעית עכשיו לא תהיה אמינה מספיק.",impact:"החלטה מהירה מדי עלולה לגרום לך לתקן את הדבר הלא נכון ולהשקיע במקום שלא באמת מגביל את השיווק.",notNow:"לא לשנות אסטרטגיה או להגדיל תקציב על בסיס תחושה בלבד. קודם אוספים מידע בסיסי במשך 14 יום."}
};

const areaLabels:Record<Bottleneck,string>={DIRECTION:"כיוון",AUDIENCE_OFFER:"קהל והצעה",MESSAGE_CONTENT:"מסר ותוכן",CONVERSION_PATH:"מסלול לפנייה",REACH:"חשיפה",CAPACITY:"יכולת התמדה"};
const mapAreas=(Object.entries(areaLabels) as [Bottleneck,string][]).map(([id,label])=>({id,label}));

function LineIcon({name}:{name:"search"|"target"|"forward"|"pause"|"node"}){return <span className={`line-icon icon-${name}`} aria-hidden="true"><i /></span>}
function DiagnosticMap({primary,secondary,preview=false}:{primary?:Primary;secondary?:Bottleneck|null;preview?:boolean}){return <div className={`diagnostic-map ${preview?"map-preview":"map-result"}`} role="img" aria-label={preview?"מפת תחומי האבחון השיווקי":"מפת האבחון שלך"}><div className="map-route" aria-hidden="true"/>{mapAreas.map((area,index)=><div key={area.id} className={`map-node node-${index+1}${primary===area.id?" is-primary":""}${secondary===area.id?" is-secondary":""}`}><span className="node-point">{primary===area.id?"?":""}</span><small>{area.label}</small></div>)}{preview&&<div className="bottleneck-label"><i>?</i><span>צוואר הבקבוק?</span></div>}<div className="map-arrow" aria-hidden="true">←</div></div>}

export default function Home(){
 const[started,setStarted]=useState(false),[step,setStep]=useState(0),[answers,setAnswers]=useState<AnswerRecord[]>([]),[selected,setSelected]=useState<string|null>(null);
 const coreAnswers=answers.filter(answer=>CORE_QUESTIONS.some(question=>question.id===answer.questionId));
 const branchQuestions=coreAnswers.length===CORE_QUESTIONS.length?buildQuestionPath(coreAnswers):[];
 const questions:Question[]=[...CORE_QUESTIONS,...branchQuestions];
 const done=coreAnswers.length===CORE_QUESTIONS.length&&step>=questions.length;
 const calculation=useMemo(()=>evaluateDiagnostic(answers),[answers]);
 const result=results[calculation.primaryBottleneck];
 const actionMap=calculation.diagnosticDetail.actionMap;
 const confidenceLabel=calculation.confidence==="HIGH"?"גבוהה":calculation.confidence==="MEDIUM"?"בינונית":"עדיין אין מספיק מידע";
 const evidence=calculation.diagnosticDetail.evidence.length?calculation.diagnosticDetail.evidence:["נאסף מידע חלקי מכמה אזורים בשיווק","יש יותר מהסבר אפשרי אחד למצב הנוכחי"];
 const restart=()=>{setStarted(false);setStep(0);setAnswers([]);setSelected(null)};
 const choose=(optionId:string)=>{if(selected)return;const question=questions[step];setSelected(optionId);window.setTimeout(()=>{setAnswers(current=>[...current,{questionId:question.id,optionId}]);setStep(current=>current+1);setSelected(null);window.scrollTo({top:0,behavior:"smooth"})},130)};
 const back=()=>{if(step===0){setStarted(false);return}setStep(current=>current-1);setAnswers(current=>current.slice(0,-1));setSelected(null)};
 const secondaryText=calculation.secondaryBottleneck?`יש גם סימנים באזור ${areaLabels[calculation.secondaryBottleneck]}. לפי התשובות שלך, כדאי להתחיל באזור המרכזי ולבדוק לאחר מכן אם הפער הנוסף עדיין קיים.`:null;
 return <main dir="rtl">
  <header className="topbar"><button className="brand" onClick={restart} aria-label="חזרה לעמוד הפתיחה"><img src="/tali-mark.png" alt=""/></button><div className="tool-name"><strong>בדיקת השיווק החכם</strong><span>אבחון ממוקד לעסקים קטנים</span></div></header>
  {!started?<section className="hero">
   <div className="hero-copy"><span className="kicker"><i/>אבחון שיווקי ממוקד</span><h1>מה באמת מעכב את <em>השיווק שלך עכשיו?</em></h1><p>תוך כמה דקות תגלי איפה השיווק שלך נתקע כרגע, ומה הדבר האחד שכדאי לבדוק לפני שעושים עוד.</p><div className="hero-actions"><button className="primary" onClick={()=>setStarted(true)}>בדקי מה מעכב אותך <b>←</b></button><a href="https://tali-digicard.vercel.app/" target="_blank" rel="noreferrer">בואי נכיר <span>↗</span></a></div><ul className="hero-meta" aria-label="פרטי האבחון"><li>כ־4 דקות</li><li>בלי הרשמה</li><li>תוצאה אישית מיד בסיום</li></ul></div>
   <div className="hero-art"><DiagnosticMap preview/></div>
  </section>:!done?<section className="quiz-wrap" aria-live="polite">
   <div className="progress-head"><strong>שאלה {step+1} מתוך {questions.length}</strong><span>{Math.round((step/questions.length)*100)}% הושלמו</span></div><div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={step}><span style={{width:`${(step/questions.length)*100}%`}}/></div>
   <article key={questions[step].id} className="question-card"><p className="eyebrow"><LineIcon name={step<2?"target":step<5?"search":"node"}/>{questions[step].eyebrow}</p><h2>{questions[step].title}</h2><div className="answers">{questions[step].options.map(option=><button key={option.id} type="button" className={selected===option.id?"selected":""} aria-pressed={selected===option.id} disabled={selected!==null} onClick={()=>choose(option.id)}><span>{option.label}</span><i aria-hidden="true">{selected===option.id?"✓":""}</i></button>)}</div></article>
   <button className="back" type="button" onClick={back}>→ חזרה</button>
  </section>:<section className="result-wrap">
   <section className="result-hero-card" aria-labelledby="result-title">
    <header className="result-intro"><p>האבחון שלך</p><h1 id="result-title">{result.title}</h1><div className="confidence">רמת ודאות: <strong>{confidenceLabel}</strong></div><p className="result-summary">{result.summary}</p>{calculation.primaryBottleneck==="INSUFFICIENT_EVIDENCE"&&<div className="candidate-areas" aria-label="שני האזורים שכדאי לבדוק">{calculation.candidateBottlenecks.slice(0,2).map(area=><span key={area}>{areaLabels[area]}</span>)}</div>}</header>
    <div className="result-map-wrap"><div className="result-map-title"><span>מפת האבחון שלך</span><small>האזור המודגש הוא נקודת המיקוד</small></div><DiagnosticMap primary={calculation.primaryBottleneck} secondary={calculation.secondaryBottleneck}/></div>
   </section>
   <div className="result-content">
    <section className="insights-section" aria-labelledby="insights-title"><div className="section-title"><LineIcon name="search"/><div><small>העדויות מהתשובות שלך</small><h2 id="insights-title">מה זיהינו</h2></div></div><div className="insight-list">{evidence.slice(0,4).map((item,index)=><article key={item}><span>{index+1}</span><p>{item}</p></article>)}</div>{calculation.diagnosticDetail.contradictions.length>0&&<p className="contradiction-note">מצאנו גם תשובות שממתנות את המסקנה, והן נלקחו בחשבון ברמת הוודאות.</p>}{secondaryText&&<p className="secondary-insight"><LineIcon name="node"/>{secondaryText}</p>}</section>
    <section className="impact-section" aria-labelledby="impact-title"><div className="section-title"><LineIcon name="forward"/><div><small>המשמעות העסקית</small><h2 id="impact-title">מה זה יוצר בפועל</h2></div></div><p>{result.impact}</p></section>
    <section className="action-map" aria-labelledby="action-title"><div className="section-heading"><div><small>מכאן מתחילים</small><h2 id="action-title">מפת הפעולה שלך</h2></div><span>שלושה צעדים ממוקדים</span></div><ol>{[["מה לבדוק",actionMap.check],["מה להחליט",actionMap.decide],["מה ליישם",actionMap.implement]].map(([label,text],index)=><li key={label}><b>{index+1}</b><div><small>צעד {index+1}</small><h3>{label}</h3><p>{text}</p></div></li>)}</ol></section>
    <section className="not-now-section" aria-labelledby="not-now-title"><LineIcon name="pause"/><div><small>כדי לא לבזבז זמן או כסף</small><h2 id="not-now-title">מה לא כדאי לעשות עדיין</h2><p>{result.notNow}</p></div></section>
   </div>
   <div className="result-cta"><div><small>אם תרצי, השלב הבא הוא להפוך את המפה הזאת לתוכנית עבודה מסודרת</small><p>אפשר לעבור יחד על מה שנכון לשנות קודם, ולבנות דרך פעולה שמתאימה לעסק בלי להעמיס עוד שיווק.</p></div><a href="https://tali-digicard.vercel.app" target="_blank" rel="noreferrer">בואי נכיר <span>←</span></a></div>
   <button className="restart" type="button" onClick={restart}>להתחיל מחדש</button>
  </section>}
  <footer>© טלי רוזנברג · שיווק דיגיטלי חכם לעסקים קטנים</footer>
 </main>
}
