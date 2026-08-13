"use client";

import { useMemo, useState } from "react";
import { CORE_QUESTIONS, buildQuestionPath, evaluateDiagnostic, type AnswerRecord, type Question as EngineQuestion } from "./diagnostic-engine";

type Gap = "DIRECTION" | "AUDIENCE_OFFER" | "MESSAGE_CONTENT" | "CONVERSION_PATH" | "REACH" | "CAPACITY";
type Answer = { label: string; scores: Partial<Record<Gap, number>>; unknown?: boolean };
type Question = { eyebrow: string; title: string; answers: Answer[] };

const legacyQuestions: Question[] = [
  { eyebrow: "המטרה שלך", title: "מה הדבר המרכזי שהיית רוצה שישתנה בשיווק של העסק בתקופה הקרובה?", answers: [
    { label: "לקבל יותר פניות מלקוחות שמתאימים לי", scores: {} },
    { label: "להגדיל מכירות של שירות או מוצר קיים", scores: {} },
    { label: "לקדם שירות או מוצר מסוים", scores: {} },
    { label: "לבנות זרם קבוע ויציב יותר של לקוחות", scores: {} },
    { label: "להגיע ליותר אנשים מתאימים", scores: {} },
    { label: "להחזיר את השיווק למסלול אחרי תקופה לא עקבית", scores: { CAPACITY: 6 } },
    { label: "להוריד ממני עומס ולהצליח להתמיד", scores: { CAPACITY: 15 } },
    { label: "לעשות סדר בבסיס לפני שאני משקיעה יותר", scores: { DIRECTION: 15 } },
  ]},
  { eyebrow: "כיוון ופוקוס", title: "עד כמה ברור לך מה בדיוק את מוכרת ולמי?", answers: [
    { label: "ברור לי מאוד מה אני מקדמת ולמי", scores: { DIRECTION: -18, AUDIENCE_OFFER: -18 } },
    { label: "ברור לי מה אני מוכרת, אבל הקהל רחב מדי", scores: { AUDIENCE_OFFER: 22 } },
    { label: "הקהל ברור, אבל ההצעה עדיין לא מספיק חדה", scores: { AUDIENCE_OFFER: 22 } },
    { label: "אני מנסה לקדם כמה דברים במקביל", scores: { DIRECTION: 25, CAPACITY: 6 } },
    { label: "אני לא בטוחה במה נכון להתמקד עכשיו", scores: { DIRECTION: 28 } },
  ]},
  { eyebrow: "מקור הפניות", title: "מאיפה מגיעות אלייך היום רוב הפניות או הלקוחות?", answers: [
    { label: "בעיקר מהמלצות ומפה לאוזן", scores: { REACH: 8 } },
    { label: "בעיקר מתוכן ברשתות החברתיות", scores: {} },
    { label: "בעיקר מקמפיינים ממומנים", scores: {} },
    { label: "בעיקר מגוגל, אתר או חיפוש", scores: {} },
    { label: "מכמה מקורות שונים", scores: { REACH: -8 } },
    { label: "מגיעות מעט מאוד פניות כרגע", scores: {} },
    { label: "אני לא באמת יודעת מאיפה הן מגיעות", scores: {}, unknown: true },
  ]},
  { eyebrow: "מה קורה אחרי החשיפה", title: "כשאנשים נחשפים לשיווק שלך, מה בדרך כלל קורה אחר כך?", answers: [
    { label: "מגיעות פניות מתאימות באופן סביר", scores: { AUDIENCE_OFFER: -14, CONVERSION_PATH: -10 } },
    { label: "מגיעות פניות, אבל הרבה מהן לא מתאימות", scores: { AUDIENCE_OFFER: 24, MESSAGE_CONTENT: 12, REACH: -30 } },
    { label: "יש צפיות או עניין, אבל מעט פניות", scores: { CONVERSION_PATH: 24, MESSAGE_CONTENT: 7 } },
    { label: "יש מעט מאוד תגובה בכלל", scores: { MESSAGE_CONTENT: 18, REACH: 8 } },
    { label: "מגיעות פניות, אבל מעט מהן הופכות ללקוחות", scores: { CONVERSION_PATH: 27 } },
    { label: "זה משתנה מאוד מתקופה לתקופה", scores: { CAPACITY: 14 } },
    { label: "אני לא באמת יודעת", scores: {}, unknown: true },
  ]},
  { eyebrow: "יכולת והתמדה", title: "מה הכי מקשה עלייך להחזיק את השיווק לאורך זמן?", answers: [
    { label: "אני לא תמיד יודעת מה נכון לעשות", scores: { DIRECTION: 24 } },
    { label: "קשה לי לדעת מה לפרסם", scores: { MESSAGE_CONTENT: 21, DIRECTION: 7 } },
    { label: "אני מנסה לעשות יותר מדי דברים", scores: { CAPACITY: 22, DIRECTION: 8 } },
    { label: "אין לי מספיק זמן", scores: { CAPACITY: 24 } },
    { label: "אני מתחילה תוכניות ולא מצליחה להתמיד", scores: { CAPACITY: 20 } },
    { label: "השיווק עקבי, הבעיה היא בתוצאות", scores: { CAPACITY: -20, MESSAGE_CONTENT: 8, CONVERSION_PATH: 8 } },
    { label: "אני לא בטוחה מה בדיוק הבעיה", scores: {}, unknown: true },
  ]},
  { eyebrow: "המסר והתוכן", title: "עד כמה התוכן שלך מחובר למה שאת רוצה לקדם עכשיו?", answers: [
    { label: "בצורה ברורה מאוד", scores: { MESSAGE_CONTENT: -20 } },
    { label: "חלק גדול ממנו מחובר", scores: { MESSAGE_CONTENT: -8 } },
    { label: "רק חלק קטן ממנו מחובר", scores: { MESSAGE_CONTENT: 22 } },
    { label: "אני מעלה תוכן טוב, אבל לא תמיד יש קשר להצעה", scores: { MESSAGE_CONTENT: 20 } },
    { label: "אני לא בטוחה", scores: {}, unknown: true },
  ]},
  { eyebrow: "הדרך לפנייה", title: "אם מישהי מתעניינת, עד כמה ברור לה מה לעשות עכשיו?", answers: [
    { label: "ברור מאוד — יש פעולה אחת פשוטה", scores: { CONVERSION_PATH: -20 } },
    { label: "בדרך כלל ברור", scores: { CONVERSION_PATH: -8 } },
    { label: "יש כמה אפשרויות שונות", scores: { CONVERSION_PATH: 15 } },
    { label: "לפעמים יש הנעה לפעולה ולפעמים לא", scores: { CONVERSION_PATH: 20 } },
    { label: "לא ממש ברור", scores: { CONVERSION_PATH: 25 } },
  ]},
  { eyebrow: "חשיפה לקהל חדש", title: "האם יש לך דרך קבועה להגיע לאנשים חדשים?", answers: [
    { label: "כן, ויש ערוץ שעובד באופן די יציב", scores: { REACH: -22 } },
    { label: "כן, אבל לא בעקביות", scores: { REACH: 10, CAPACITY: 8 } },
    { label: "בעיקר דרך המלצות", scores: { REACH: 16 } },
    { label: "רק מדי פעם דרך שיתוף פעולה או קמפיין", scores: { REACH: 17 } },
    { label: "כמעט שאין לי דרך קבועה להגיע לקהל חדש", scores: { REACH: 25 } },
  ]},
];

const results: Record<string, { title: string; why: string; impact: string; focus: string; first: string; not: string; summary: string }> = {
  DIRECTION: { title: "חסר כיוון שיווקי ברור", why: "נראה שכמה מטרות או פעולות מתחרות כרגע על תשומת הלב שלך, בלי החלטה אחת שמארגנת את השיווק.", impact: "יותר התלבטויות, קפיצה בין רעיונות ותחושה שצריך לעשות הכול.", focus: "לבחור מטרה אחת והצעה מרכזית אחת לתקופה הקרובה.", first: "כתבי מה את רוצה שיקרה, מה את מקדמת כדי שזה יקרה ולמי.", not: "לא לפתוח עוד ערוץ ולא לרוץ לקמפיין חדש.", summary: "את לא צריכה לעשות יותר שיווק — את צריכה להחליט לאן הוא אמור לקחת את העסק." },
  AUDIENCE_OFFER: { title: "הקהל או ההצעה עדיין לא מספיק מדויקים", why: "הכיוון קיים, אבל החיבור בין הלקוחה הנכונה, הצורך שלה וההצעה שלך עדיין אינו חד מספיק.", impact: "יותר פניות לא מתאימות, יותר הסברים ותגובה חלשה גם כשהשיווק פעיל.", focus: "לחדד למי ההצעה מתאימה במיוחד ומה היא פותרת עבורה עכשיו.", first: "בחרי לקוחה אמיתית ורשמי מה היא רצתה לפתור ולמה השירות שלך התאים.", not: "לא להגדיל חשיפה לפני שהחיבור בין הקהל להצעה ברור.", summary: "את לא צריכה להגיע ליותר אנשים — את צריכה שהאנשים הנכונים יבינו שזה בשבילם." },
  MESSAGE_CONTENT: { title: "המסר והתוכן לא מספיק מחוברים למטרה", why: "יש פעילות ותוכן, אבל לא תמיד ברור איך כל פרסום מחזק את מה שאת רוצה לקדם.", impact: "הרבה יצירה בלי ודאות שהיא מייצרת הבנה, עניין או תנועה עסקית.", focus: "לחבר כל תוכן למסר אחד ולמטרה אחת.", first: "הגדירי 2–3 מסרים שהקהל חייב להבין לפני שיבחר בהצעה שלך.", not: "לא לפרסם יותר רק כדי להיות עקבית ולא להוסיף עוד פורמטים.", summary: "את לא צריכה יותר תוכן — את צריכה שכל תוכן יעשה עבודה ברורה." },
  CONVERSION_PATH: { title: "הדרך מהשיווק לפנייה לא מספיק ברורה", why: "כבר נוצר עניין, אבל המעבר ממנו לפנייה או מהפנייה לשלב הבא אינו חלק מספיק.", impact: "אנשים מתעניינים או אפילו פונים, אבל חלק מהם הולכים לאיבוד בדרך.", focus: "לפשט את הדרך מהעניין לפנייה ולוודא שיש המשך ברור.", first: "בחרי פעולה אחת שאת רוצה שמתעניינת תעשה ובדקי שהיא בולטת ופשוטה.", not: "לא להזרים עוד תנועה למסלול לפני שמתקנים אותו.", summary: "את לא צריכה להביא יותר אנשים — את צריכה שמי שמתעניין ידע בדיוק איך להתקדם." },
  REACH: { title: "הבסיס קיים — עכשיו חסרה חשיפה", why: "הכיוון והמסלול נראים תקינים יחסית, אבל לא נכנסים מספיק אנשים חדשים ורלוונטיים למערכת.", impact: "השיווק עובד כשפוגשים אותך, אבל אין מספיק הזדמנויות חדשות לקצב יציב.", focus: "להגדיל כניסה של אנשים רלוונטיים בלי לפרק את מה שכבר עובד.", first: "בחרי ערוץ חשיפה אחד שאפשר להפעיל בעקביות ולמדוד.", not: "לא לבנות מחדש את המיתוג או להחליף הצעה שעובדת.", summary: "את לא צריכה לבנות הכול מחדש — את צריכה להביא יותר מהאנשים הנכונים למה שכבר עובד." },
  CAPACITY: { title: "השיווק דורש ממך יותר ממה שאפשר להחזיק", why: "התוכנית דורשת יותר זמן, פעולות או אנרגיה ממה שיש בפועל.", impact: "תחושה שאת מאחור, מתחילה מחדש או בוחרת בין העבודה עצמה לבין השיווק.", focus: "לצמצם למה שבאמת חשוב ולבנות דרך עבודה שאפשר להתמיד בה.", first: "חלקי משימות ל׳חייב לקרות׳, ׳אפשר להעביר׳ ו׳אפשר להפסיק׳.", not: "לא להוסיף פלטפורמה, תדירות או משימות חדשות.", summary: "את לא צריכה יותר משמעת — את צריכה שיווק שמתאים לזמן ולאנרגיה שבאמת יש לך." },
  INSUFFICIENT_EVIDENCE: { title: "עוד מוקדם לקבוע מה באמת מעכב את השיווק שלך", why: "כרגע אין מספיק מידע עקבי כדי לזהות בביטחון צוואר בקבוק אחד. זה לא אומר שהשיווק לא עובד — אלא שעוד אין בסיס טוב להחלטה מה לשנות.", impact: "החלטות שמבוססות על תחושה במקום על מה שקורה בפועל.", focus: "לא לשנות עדיין. קודם לאסוף מינימום מידע במשך 14 יום.", first: "עקבי אחרי מקור כל פנייה, מה גרם לה לפנות, האם היא מתאימה ומה קרה בסוף.", not: "לא לשנות אסטרטגיה, להגדיל תקציב או להוסיף ערוצים לפני שיש בסיס להחלטה.", summary: "את לא צריכה כרגע לנחש מה לשפר — את צריכה מספיק מידע כדי לדעת מה באמת דורש שיפור." },
};

export default function Home() {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const coreAnswers = answers.filter(a => CORE_QUESTIONS.some(q => q.id === a.questionId));
  const branchQuestions = coreAnswers.length === CORE_QUESTIONS.length ? buildQuestionPath(coreAnswers) : [];
  const questions: EngineQuestion[] = [...CORE_QUESTIONS, ...branchQuestions];
  const done = step >= questions.length && coreAnswers.length === CORE_QUESTIONS.length;
  const calculation = useMemo(() => evaluateDiagnostic(answers), [answers]);
  const choose = (i: number) => { const q=questions[step], option=q.options[i]; setAnswers([...answers, {questionId:q.id,optionId:option.id}]); setStep(step + 1); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const back = () => { if (step === 0) setStarted(false); else { setStep(step - 1); setAnswers(answers.slice(0,-1)); } };
  const restart = () => { setStarted(false); setStep(0); setAnswers([]); };
  const result = results[calculation.primaryBottleneck];
  const confidenceLabel = calculation.confidence === "HIGH" ? "גבוהה" : calculation.confidence === "MEDIUM" ? "בינונית" : "אין מספיק מידע";

  return <main dir="rtl">
    <header className="topbar">
      <a className="brand" href="#" onClick={(e) => { e.preventDefault(); restart(); }} aria-label="טלי רוזנברג — התחלה">
        <img src="/tali-logo.png" alt="טלי רוזנברג — שיווק דיגיטלי חכם לעסקים קטנים" />
      </a>
      <div className="brand-promise"><span>שיווק דיגיטלי</span><strong>״חכם״</strong><span>לעסקים קטנים</span></div>
      <a className="card-link" href="https://tali-digicard.vercel.app" target="_blank" rel="noreferrer"><span className="button-copy"><small>רוצים שיווק שעובד בשביל העסק?</small>בואו נכיר</span><b>←</b></a>
    </header>

    {!started ? <section className="hero">
      <div className="hero-copy">
        <span className="kicker"><i /> מנוע אבחון שיווקי אסטרטגי • כ־4 דקות</span>
        <h1>השיווק שלך לא צריך<br/><em>עוד רעש. הוא צריך דיוק.</em></h1>
        <p>אני לא מאמינה שעסק קטן צריך לעשות הכול. הוא צריך לדעת מה נכון לו עכשיו. האבחון הזה יעזור לך לזהות את צוואר הבקבוק שמגביל את הצמיחה — ולהבין איפה להשקיע ועל מה אפשר לוותר.</p>
        <button className="primary" onClick={() => setStarted(true)}><span className="button-copy">גלי מה מעכב אותך</span><b>←</b></button>
        <div className="trust"><span>חשיבה אסטרטגית</span><span>תוצאה מותאמת</span><span>צעד מעשי אחד</span></div>
        <p className="expert-note"><strong>אני טלי רוזנברג, ונעים להכיר.</strong><br/>אני מחברת אסטרטגיה, תוכן, אוטומציה ו־AI כדי לבנות לעסקים קטנים שיווק מדויק שאפשר באמת להחזיק.</p>
      </div>
      <div className="hero-art" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="core"><span>?</span><small>הפער<br/>המרכזי</small></div><div className="signal-card signal-one"><b>01</b><span>מזהות<br/>את החסם</span></div><div className="signal-card signal-two"><b>02</b><span>בוחרות<br/>מיקוד</span></div><div className="signal-card signal-three"><b>03</b><span>מתקדמות<br/>חכם</span></div><div className="dot d1"/><div className="dot d2"/><div className="dot d3"/></div>
    </section> : !done ? <section className="quiz-wrap">
      <div className="progress-head"><span>שאלה {step + 1} מתוך {questions.length}</span><span>{Math.round(((step + 1)/questions.length)*100)}%</span></div>
      <div className="progress"><i style={{width: `${((step + 1)/questions.length)*100}%`}} /></div>
      <article className="question-card">
        <span className="question-number">0{step + 1}</span>
        <p className="eyebrow">{questions[step].eyebrow}</p>
        <h2>{questions[step].title}</h2>
        <div className="answers">{questions[step].options.map((a,i) => <button key={a.id} onClick={() => choose(i)}><i>{String.fromCharCode(1488+i)}</i><span>{a.label}</span></button>)}</div>
      </article>
      <button className="back" onClick={back}>→ חזרה</button>
    </section> : <section className="result-wrap">
      <div className="result-intro"><span className="kicker"><i /> האבחון שלך מוכן</span><p>{calculation.primaryBottleneck === "INSUFFICIENT_EVIDENCE" ? "התוצאה שלך כרגע" : "הפער המרכזי שלך כרגע"}</p><h1>{result.title}</h1><div className="confidence">רמת ודאות: <strong>{confidenceLabel}</strong></div></div>
      <div className="result-grid">
        <article className="result-main"><h3>למה זה כנראה מה שמעכב אותך</h3><p>{result.why}</p><div className="impact"><small>מה זה יוצר בשיווק</small><p>{result.impact}</p></div><blockquote>{result.summary}</blockquote></article>
        <aside><div className="focus-box"><small>המיקוד שלך עכשיו</small><h3>{result.focus}</h3></div><div className="step-box"><span>01</span><div><small>הצעד הראשון</small><p>{result.first}</p></div></div><div className="not-box"><span>×</span><div><small>מה כרגע לא צריך</small><p>{result.not}</p></div></div>{calculation.secondaryBottleneck && <div className="secondary-box"><small>פער משני</small><p>יש גם סימן ל־{results[calculation.secondaryBottleneck].title}, אבל כרגע {calculation.whyPrimaryComesFirst}.</p></div>}</aside>
      </div>
      <div className="tali-note"><div className="mini-mark"><img src="/tali-mark.png" alt="הסמל של טלי רוזנברג" /></div><div><small>רגע לפני שאת ממשיכה — ממני אלייך</small><p>אל תנסי לתקן הכול בבת אחת. אם תטפלי קודם במה שבאמת מגביל אותך, גם שאר השיווק יתחיל לעבוד חכם יותר. בדיוק בשביל זה בניתי את האבחון הזה.</p><strong>טלי</strong></div></div>
      <div className="result-cta"><div><small>האבחון הוא נקודת ההתחלה. הדיוק קורה בעבודה משותפת.</small><h2>אם התוצאה פגשה בדיוק את מה שקורה בעסק שלך — בואי נהפוך אותה לתוכנית שעובדת.</h2></div><a href="https://tali-digicard.vercel.app" target="_blank" rel="noreferrer">בואי נכיר <span>←</span></a></div>
      <button className="restart" onClick={restart}>↻ להתחיל אבחון מחדש</button>
    </section>}
    <footer><span>© 2026 טלי רוזנברג • שיווק דיגיטלי <b>״חכם״</b> לעסקים קטנים</span><a href="https://tali-digicard.vercel.app" target="_blank" rel="noreferrer">tali-digicard.vercel.app</a></footer>
  </main>;
}
