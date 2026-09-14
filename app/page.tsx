"use client";
/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react";
import { CORE_QUESTIONS, buildQuestionPath, evaluateDiagnostic, type AnswerRecord, type Bottleneck, type Primary, type Question } from "./diagnostic-engine";

type ResultCopy = { title:string; identified:string; impact:string; focus:string; first:string; notNow:string };
const results:Record<Primary,ResultCopy>={
 DIRECTION:{title:"חסר כיוון שיווקי ברור",identified:"כמה מטרות או פעולות מתחרות כרגע על תשומת הלב שלך, בלי החלטה אחת שמארגנת את השיווק.",impact:"התוצאה היא יותר התלבטויות, מעבר תכוף בין רעיונות ותחושה שצריך לעשות הכול.",focus:"לבחור מטרה אחת והצעה מרכזית אחת לתקופה הקרובה.",first:"כתבי מה את רוצה שיקרה, מה תקדמי כדי שזה יקרה ולמי.",notNow:"לא לפתוח עוד ערוץ ולא להתחיל קמפיין חדש."},
 AUDIENCE_OFFER:{title:"הקהל או ההצעה עדיין לא מספיק מדויקים",identified:"הכיוון קיים, אבל החיבור בין הלקוחה הנכונה, הצורך שלה וההצעה עדיין אינו חד מספיק.",impact:"זה יוצר יותר פניות לא מתאימות, צורך בהסברים רבים ותגובה חלשה גם כשהשיווק פעיל.",focus:"לחדד למי ההצעה מתאימה במיוחד ומה היא פותרת עבורה עכשיו.",first:"בחרי לקוחה אמיתית ורשמי מה היא רצתה לפתור ולמה השירות שלך התאים.",notNow:"לא להגדיל חשיפה לפני שהחיבור בין הקהל להצעה ברור."},
 MESSAGE_CONTENT:{title:"המסר והתוכן לא מספיק מחוברים למטרה",identified:"יש פעילות ותוכן, אבל לא תמיד ברור איך כל פרסום מחזק את מה שאת רוצה לקדם.",impact:"נוצרת הרבה עשייה בלי ודאות שהיא מייצרת הבנה, עניין או תנועה עסקית.",focus:"לחבר כל תוכן למסר מרכזי אחד ולהצעה אחת.",first:"הגדירי שניים או שלושה מסרים שהקהל חייב להבין לפני שיבחר בהצעה שלך.",notNow:"לא לפרסם יותר רק כדי להיות עקבית ולא להוסיף עוד פורמטים."},
 CONVERSION_PATH:{title:"הדרך מהשיווק לפנייה לא מספיק ברורה",identified:"כבר נוצר עניין, אבל המעבר ממנו לפנייה או מהפנייה לשלב הבא אינו חלק מספיק.",impact:"אנשים מתעניינים או אפילו פונים, אבל חלק מהם הולכים לאיבוד בדרך.",focus:"לפשט את הדרך מהעניין לפנייה ולוודא שיש המשך ברור.",first:"בחרי פעולה אחת שאת רוצה שמתעניינת תעשה ובדקי שהיא בולטת ופשוטה.",notNow:"לא להזרים עוד תנועה למסלול לפני שמתקנים אותו."},
 REACH:{title:"הבסיס קיים. עכשיו חסרה חשיפה",identified:"הכיוון, הקהל והדרך לפנייה נראים תקינים יחסית, אבל לא נכנסים מספיק אנשים חדשים ורלוונטיים.",impact:"השיווק יכול לעבוד היטב כשפוגשים אותך, אך אין מספיק הזדמנויות חדשות לקצב יציב.",focus:"להגדיל את הכניסה של אנשים רלוונטיים בלי לפרק את מה שכבר עובד.",first:"בחרי ערוץ חשיפה אחד שאפשר להפעיל בעקביות ולמדוד.",notNow:"לא לבנות מחדש את המיתוג ולא להחליף הצעה שעובדת."},
 CAPACITY:{title:"השיווק דורש ממך יותר ממה שאפשר להחזיק",identified:"התוכנית דורשת יותר זמן, פעולות או אנרגיה ממה שיש בפועל, גם כשברור מה צריך לעשות.",impact:"נוצרת תחושה שאת מאחור, מתחילה מחדש או נאלצת לבחור בין העבודה עצמה לבין השיווק.",focus:"לצמצם למה שבאמת חשוב ולבנות דרך עבודה שאפשר להתמיד בה.",first:"חלקי את המשימות למה שחייב לקרות, מה שאפשר להעביר ומה שאפשר להפסיק.",notNow:"לא להוסיף פלטפורמה, תדירות או משימות חדשות."},
 INSUFFICIENT_EVIDENCE:{title:"יש סימנים לשני אזורים, אבל עדיין אין מספיק מידע להכריע",identified:"התשובות מצביעות על יותר מאפשרות אחת, או שחלק מהמידע עדיין חסר. אבחנה חד משמעית עכשיו לא תהיה אמינה מספיק.",impact:"החלטה מהירה מדי עלולה לגרום לך לתקן את הדבר הלא נכון ולהשקיע במקום שלא באמת מגביל את השיווק.",focus:"לאסוף במשך 14 יום מידע בסיסי על מקור הפנייה, הסיבה לפנייה, התאמתה ומה קרה בסוף.",first:"פתחי טבלה פשוטה ותעדי בה כל פנייה חדשה במשך השבועיים הקרובים.",notNow:"לא לשנות אסטרטגיה או להגדיל תקציב על בסיס תחושה בלבד."}
};

const areaLabels:Record<Bottleneck,string>={DIRECTION:"כיוון",AUDIENCE_OFFER:"קהל והצעה",MESSAGE_CONTENT:"מסר ותוכן",CONVERSION_PATH:"מסלול פנייה",REACH:"חשיפה",CAPACITY:"יכולת ביצוע"};
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
 const confidenceLabel=calculation.confidence==="HIGH"?"גבוהה":calculation.confidence==="MEDIUM"?"בינונית":"עדיין אין מספיק מידע";
 const evidence=calculation.diagnosticDetail.evidence.length?calculation.diagnosticDetail.evidence:["נאסף מידע חלקי מכמה אזורים בשיווק","יש יותר מהסבר אפשרי אחד למצב הנוכחי"];
 const restart=()=>{setStarted(false);setStep(0);setAnswers([]);setSelected(null)};
 const choose=(optionId:string)=>{if(selected)return;const question=questions[step];setSelected(optionId);window.setTimeout(()=>{setAnswers(current=>[...current,{questionId:question.id,optionId}]);setStep(current=>current+1);setSelected(null);window.scrollTo({top:0,behavior:"smooth"})},130)};
 const back=()=>{if(step===0){setStarted(false);return}setStep(current=>current-1);setAnswers(current=>current.slice(0,-1));setSelected(null)};
 const secondaryText=calculation.secondaryBottleneck?`יש גם סימנים באזור ${areaLabels[calculation.secondaryBottleneck]}. לפי התשובות שלך, כדאי להתחיל באזור המרכזי ולבדוק לאחר מכן אם הפער הנוסף עדיין קיים.`:null;
 return <main dir="rtl">
  <header className="topbar"><button className="brand" onClick={restart} aria-label="חזרה לעמוד הפתיחה"><img src="/tali-mark.png" alt=""/></button><div className="tool-name"><strong>בדיקת השיווק החכם</strong><span>אבחון ממוקד לעסקים קטנים</span></div></header>
  {!started?<section className="hero">
   <div className="hero-copy"><span className="kicker"><i/>אבחון שיווקי ממוקד</span><h1>מה באמת מעכב את <em>השיווק שלך עכשיו?</em></h1><p>תוך כמה דקות תגלי איפה השיווק שלך נתקע כרגע, ומה הדבר האחד שכדאי לבדוק לפני שעושים עוד.</p><button className="primary" onClick={()=>setStarted(true)}>בדקי מה מעכב אותך <b>←</b></button><ul className="hero-meta" aria-label="פרטי האבחון"><li>כ־4 דקות</li><li>בלי הרשמה</li><li>תוצאה אישית מיד בסיום</li></ul></div>
   <div className="hero-art"><DiagnosticMap preview/></div>
  </section>:!done?<section className="quiz-wrap" aria-live="polite">
   <div className="progress-head"><strong>שאלה {step+1} מתוך {questions.length}</strong><span>{Math.round((step/questions.length)*100)}% הושלמו</span></div><div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={step}><span style={{width:`${(step/questions.length)*100}%`}}/></div>
   <article className="question-card"><p className="eyebrow">{questions[step].eyebrow}</p><h2>{questions[step].title}</h2><div className="answers">{questions[step].options.map(option=><button key={option.id} type="button" className={selected===option.id?"selected":""} aria-pressed={selected===option.id} disabled={selected!==null} onClick={()=>choose(option.id)}><span>{option.label}</span><i aria-hidden="true">{selected===option.id?"✓":""}</i></button>)}</div></article>
   <button className="back" type="button" onClick={back}>→ חזרה</button>
  </section>:<section className="result-wrap">
   <div className="result-map-wrap"><div className="result-map-title"><span>מפת האבחון שלך</span><small>שישה תחומים. מיקוד אחד.</small></div><DiagnosticMap primary={calculation.primaryBottleneck} secondary={calculation.secondaryBottleneck}/></div>
   <header className="result-intro"><p>מה כרגע מעכב את השיווק שלך</p><h1>{result.title}</h1><div className="confidence">רמת ודאות: <strong>{confidenceLabel}</strong></div></header>
   <div className="result-content">
    <section className="diagnosis-section"><h2><LineIcon name="search"/>מה זיהינו</h2><p>{result.identified}</p>{calculation.primaryBottleneck==="INSUFFICIENT_EVIDENCE"&&<div className="candidate-areas" aria-label="שני האזורים שכדאי לבדוק">{calculation.candidateBottlenecks.slice(0,2).map(area=><span key={area}>{areaLabels[area]}</span>)}</div>}<h3>מה בתשובות שלך הוביל למסקנה הזאת</h3><ul>{evidence.slice(0,3).map(item=><li key={item}>{item}</li>)}</ul>{calculation.diagnosticDetail.contradictions.length>0&&<p className="contradiction-note">לקחנו בחשבון גם תשובות שסתרו חלק מהכיוון הראשוני. לכן רמת הוודאות הותאמה בהתאם.</p>}</section>
    <section className="impact-section"><h2>מה זה יוצר בפועל</h2><p>{result.impact}</p></section>
    <section className="focus-box"><small><LineIcon name="target"/>במה כדאי להתמקד עכשיו</small><h2>{result.focus}</h2></section>
    <div className="action-pair"><section><LineIcon name="forward"/><div><small>צעד ראשון קטן שאפשר לבצע היום</small><p>{result.first}</p></div></section><section><LineIcon name="pause"/><div><small>מה לא כדאי לעשות עדיין</small><p>{result.notNow}</p></div></section></div>
    {secondaryText&&<section className="secondary-box"><small><LineIcon name="node"/>אזור נוסף שכדאי לשים לב אליו</small><p>{secondaryText}</p></section>}
   </div>
   <aside className="tali-note"><small>רגע לפני שאת ממשיכה</small><p>אל תנסי לתקן הכול בבת אחת. אם תטפלי קודם במה שבאמת מגביל אותך, גם שאר השיווק יתחיל לעבוד חכם יותר.</p><strong>טלי רוזנברג<span>שיווק דיגיטלי חכם לעסקים קטנים</span></strong></aside>
   <div className="result-cta"><div><small>רוצה להפוך את האבחון לתוכנית פעולה?</small><p>אם זיהית כאן משהו שמוכר לך מהעסק, אפשר לבדוק יחד מה נכון לשנות קודם ואיך לעשות את זה בלי להעמיס עוד שיווק.</p></div><a href="https://tali-digicard.vercel.app" target="_blank" rel="noreferrer">בואי נכיר <span>←</span></a></div>
   <button className="restart" type="button" onClick={restart}>להתחיל מחדש</button>
  </section>}
  <footer>© טלי רוזנברג · שיווק דיגיטלי חכם לעסקים קטנים</footer>
 </main>
}
