// نستورد useEffect, useState, useRef من React
import { useEffect, useState, useRef } from "react";
// نستورد useNavigate للتنقل بين الصفحات
import { useNavigate } from "react-router-dom";

// مدة الجولة: دقيقتان = 120 ثانية
const ROUND_LIMIT = 120;



// ====== كائن الصوت العام (سيتم إنشاؤه عند الحاجة) ======
let audioCtx = null;

// ====== دوال الصوت ======

// تجهيز AudioContext (يُستدعى عند أول تفاعل)
function prepareAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // تشغيل صوت صامت لتفعيل الإذن في المتصفح، خصوصًا الجوال
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    gain.gain.value = 0;

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(0);
    osc.stop(0.001);
  } else if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

// تشغيل جرس ناعم
// volume يتحكم بقوة الصوت
// مثال: 0.12 تنبيه خفيف، 0.22 نهاية أوضح
function playSoftBell(volume = 0.15) {
  try {
    if (!audioCtx) return;
    if (audioCtx.state === "suspended") audioCtx.resume();

    const now = audioCtx.currentTime;

    // النغمة الأولى
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, now);

    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(volume, now + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);

    osc1.start(now);
    osc1.stop(now + 0.8);

    // نغمة ثانية خفيفة بعدها تعطي إحساس "دينغ" ناعم
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();

    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1320, now + 0.08);

    gain2.gain.setValueAtTime(0, now + 0.08);
    gain2.gain.linearRampToValueAtTime(volume * 0.6, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1);

    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);

    osc2.start(now + 0.08);
    osc2.stop(now + 1);
  } catch (e) {
    console.warn("الصوت غير متاح:", e);
  }
}

// تشغيل نغمة خلفية هادئة مستمرة
function startBackgroundTone() {
  if (!audioCtx) return;
  if (audioCtx.state === "suspended") audioCtx.resume();

  // إنشاء مذبذب بنغمة منخفضة وهادئة
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "sine"; // موجة ناعمة
  osc.frequency.value = 180; // نغمة منخفضة وهادئة

  // صوت منخفض جدًا حتى يكون مجرد إحساس خفيف بالخلفية
  gain.gain.value = 0.005;

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();

  // إرجاع العقدتين لنتمكن من إيقافها لاحقًا
  return { osc, gain };
}

/* =========================
    دوال مساعدة خارج المكوّن
========================= */

// إرجاع رقم عشوائي
function getRandomIndex(length) {
  return Math.floor(Math.random() * length);
}

// خلط عناصر المصفوفة
function shuffleArray(array) {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const randomIndex = getRandomIndex(i + 1);
    const temp = shuffled[i];

    shuffled[i] = shuffled[randomIndex];
    shuffled[randomIndex] = temp;
  }

  return shuffled;
}

// إنشاء جولات اللعبة
function buildRounds(players, words) {
  const shuffledGuests = shuffleArray(players);
  const shuffledHosts = shuffleArray(players);
  const shuffledWords = shuffleArray(words);

  return shuffledGuests.map((guest, index) => {
    let host = shuffledHosts[index];

    if (host === guest) {
      host = players.find((player) => player !== guest);
    }

    return {
      guest,
      host,
      word: shuffledWords[index % shuffledWords.length]
    };
  });
}

/* =========================
    مكوّن اللعبة الرئيسي
========================= */

export default function ForbiddenWord() {
  const navigate = useNavigate();

  // قراءة اللاعبين المحفوظين
  const savedPlayers = localStorage.getItem("current-players");
  const players = savedPlayers ? JSON.parse(savedPlayers) : [];

  // ======== حالات اللعبة ========
  const [phase, setPhase] = useState("category");
  const [rounds, setRounds] = useState([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [hostPlayer, setHostPlayer] = useState("");
  const [guestPlayer, setGuestPlayer] = useState("");
  const [forbiddenWord, setForbiddenWord] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [roundResults, setRoundResults] = useState([]);


  // مرجع لحفظ عقد الصوت الخلفي الحالي لإيقافه لاحقًا
  const bgSoundRef = useRef(null);

  /* =========================
      فئات الكلمات
  ========================= */

  const categories = {
    food: {
      title: "الأكل والمشروبات 🍔",
      words: [
        "قهوة", "بيتزا", "شاورما", "مطعم", "جوع", "عصير", "حلى", "سبايسي",
        "سناك", "فطور", "بيض", "ورق عنب", "غداء", "كبه", "عشاء", "مطبخ",
        "سفرة", "مقبلات", "مشروب غازي", "شوكلاته", "فواكه", "خضار", "لحم",
        "سمك", "دجاج", "مندي", "كبسه", "مقلقل", "جبن", "برياني", "فلافل",
        "حمص", "تبوله", "كشري", "رز", "معكرونة", "سوشي", "رامن", "كريب",
        "وافل", "آيس كريم", "بسكويت", "كعك", "فطيرة", "مربى", "رجيم",
        "زبدة", "قشطة", "لبن", "زبادي", "كاسترد", "مخلل", "سجق", "برجر",
        "هامبرغر", "ملوخية", "فتوش", "كفتة", "كباب", "شوربة", "سلطة",
        "عصير طبيعي", "ماء", "شاي"
      ]
    },

    feelings: {
      title: "العلاقات والمشاعر 💔",
      words: [
        "حب", "زواج", "غيرة", "بلوك", "كراش", "زعل", "صداقة", "إعجاب",
        "خيانة", "موعد", "حنين", "اشتياق", "تواصل", "تعارف", "هدية",
        "ارتباط", "طلاق", "تفاهم", "وفاء", "خجل", "ثقة", "احترام", "تقدير",
        "حنان", "شوق", "عاطفة", "تعلق", "تسامح", "تضحية", "عيد زواج",
        "كراهية", "خطوبة", "اهتمام", "إهمال", "اعتراف"
      ]
    },

    tech: {
      title: "الألعاب والتقنية 🎮",
      words: [
        "جوال", "شاحن", "تيك توك", "إنترنت", "تصوير", "لايف", "بلايستيشن",
        "سماعة", "كمبيوتر", "لاب توب", "تلفزيون", "سوشيال ميديا", "يوتيوب",
        "تويتر X", "فيسبوك", "إنستغرام", "تيمز", "زووم", "تطبيق", "موقع",
        "برمجة", "هاك", "روبوت", "ذكاء اصطناعي", "واقع افتراضي", "بلوتوث",
        "واي فاي", "سيلفي", "فيديو جيم", "بث مباشر", "تغريدة", "هاشتاق",
        "فلتر", "إيموجي", "ميمز", "تحدي تيك توك", "تطبيق توصيل", "بودكاست",
        "واتساب"
      ]
    },

    daily: {
      title: "الحياة اليومية 🏫",
      words: [
        "دوام", "نوم", "تأخير", "اختبار", "مدرسة", "جامعة", "واجب", "مشوار",
        "زحمة", "مواصلات", "سوق", "مطبخ", "ممطر", "مشمس", "تسوق", "عزيمة",
        "استيقاظ", "استحمام", "مواعيد", "عمل منزلي", "مكتب", "اجتماع", "تقويم",
        "تخطيط يومي", "صباح", "ليل", "استراحة", "تعب", "نشاط", "رياضة",
        "تمرين", "إجازة", "انتظار", "روتين", "سهره", "راتب", "مصعد", "حر",
        "برد", "ساعة"
      ]
    },

    travel: {
      title: "السفر والترفيه ✈️",
      words: [
        "سفر", "مطار", "بحر", "فندق", "إجازة", "سيارة", "طلعة", "تصوير",
        "تخييم", "رحلة", "شاطئ", "جبل", "منتجع", "تذكرة", "خريطة", "دليل سياحي",
        "مغامرة", "استكشاف", "تذكرة طيران", "حقيبة سفر", "جواز سفر", "تأشيرة",
        "رحلة بحرية", "سفاري", "تزلج", "متنزه", "متحف", "معالم سياحية", "كروز",
        "رحلة برية", "تسلق جبال", "غوص", "غطس", "رحلة قطار", "سباحة ",
        "تذكرة حفل", "مهرجان"
      ]
    }
  };

  /* =========================
      إدارة المؤقت
  ========================= */

  useEffect(() => {
    let timer;

    if (isRunning) {
      timer = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isRunning]);


  // مراقبة انتهاء الوقت
  useEffect(() => {
    if (isRunning && seconds >= ROUND_LIMIT) {
      // إيقاف النغمة الخلفية أولاً
      if (bgSoundRef.current) {
        const { osc, gain } = bgSoundRef.current;

        try {
          osc.stop();
        } catch (e) {
          console.warn("خطأ أثناء إيقاف صوت الخلفية:", e);
        }

        gain.disconnect();
        bgSoundRef.current = null;
      }

      // تشغيل جرس نهاية ناعم وأوضح
      playSoftBell(0.22);

      // إنهاء الجولة
      finishRound("timeup");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, isRunning]);

  // تنسيق الوقت MM:SS
  function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  /* =========================
      دوال بدء وإنهاء الجولات
  ========================= */

  function createRounds(categoryKey) {
    prepareAudio();

    const words = categories[categoryKey].words;
    const newRounds = buildRounds(players, words);

    setRounds(newRounds);
    setRoundIndex(0);
    setGuestPlayer(newRounds[0].guest);
    setHostPlayer(newRounds[0].host);
    setForbiddenWord(newRounds[0].word);
    setSeconds(0);
    setIsRunning(false);
    setRoundResults([]);
    setPhase("roundIntro");
  }

  // بدء الجولة: يبدأ النغمة الهادئة والمؤقت
  function startTimer() {
    prepareAudio();

    // بدء النغمة الهادئة المستمرة
    if (!bgSoundRef.current) {
      bgSoundRef.current = startBackgroundTone();
    }

    setSeconds(0);
    setIsRunning(true);
    setPhase("playing");
  }

  // إنهاء الجولة يدويًا أو تلقائيًا
  function finishRound(resultType) {
    // إيقاف النغمة الهادئة إن كانت شغالة
    if (bgSoundRef.current) {
      const { osc, gain } = bgSoundRef.current;

      try {
        osc.stop();
      } catch (e) {
        console.warn("خطأ أثناء إيقاف الصوت:", e);
      }

      gain.disconnect();
      bgSoundRef.current = null;
    }

    

    setIsRunning(false);

    const result = {
      host: hostPlayer,
      guest: guestPlayer,
      word: forbiddenWord,
      time: seconds,
      type: resultType
    };

    setRoundResults((prev) => [...prev, result]);
    setPhase("roundResult");
  }

  function nextRound() {
    const nextIndex = roundIndex + 1;

    if (nextIndex >= rounds.length) {
      setPhase("finalResults");
      return;
    }

    const nextRoundData = rounds[nextIndex];

    setRoundIndex(nextIndex);
    setGuestPlayer(nextRoundData.guest);
    setHostPlayer(nextRoundData.host);
    setForbiddenWord(nextRoundData.word);
    setSeconds(0);
    setIsRunning(false);
    setPhase("roundIntro");
  }

  /* =========================
      حالة عدم وجود لاعبين
  ========================= */

  if (players.length === 0) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h2>ما فيه لاعبين محفوظين</h2>
          <button style={mainButton} onClick={() => navigate("/games")}>
            رجوع للألعاب
          </button>
        </div>
      </div>
    );
  }

  /* =========================
      شاشة اختيار الفئة
  ========================= */

  if (phase === "category") {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>كلمة ممنوعة 🤫</h1>
          <p style={textStyle}>اختاروا موضوع اللعبة</p>

          {Object.entries(categories).map(([key, item]) => (
            <button
              key={key}
              style={mainButton}
              onClick={() => createRounds(key)}
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* =========================
      شاشة مقدمة الجولة
  ========================= */

  if (phase === "roundIntro") {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <p style={textStyle}>
            الجولة {roundIndex + 1} من {rounds.length}
          </p>

          <h1 style={titleStyle}>الجولة بين</h1>

          <div  style={roleCardStyle}>
            <p  style={roleLabelStyle}>المحاور</p>
            <h2 style={textH2} >{hostPlayer}</h2>
          </div>

          <div style={roleCardStyle}>
            <p style={roleLabelStyle}>الضيف</p>
            <h2 style={textH2}>{guestPlayer}</h2>
          </div>

          <p style={textStyle}>مرروا الجوال للمحاور</p>

          <button style={mainButton} onClick={() => setPhase("hostBrief")}>
            هذا أنا، ابدأ
          </button>
        </div>
      </div>
    );
  }

  /* =========================
      شاشة تعليمات المحاور
  ========================= */

  if (phase === "hostBrief") {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h2 style={titleStyle}>مهمتك 🎤</h2>

          <p style={textStyle}>استدرج الضيف أن يقول الكلمة الممنوعة</p>

          <div style={wordCardStyle}>
            <p style={roleLabelStyle}>الكلمة الممنوعة</p>
            <h1 style={forbiddenWordStyle}>{forbiddenWord}</h1>
          </div>

          <p style={textStyle}>عند بداية الحوار اضغط ابدأ. لديك دقيقتان.</p>

          <div style={buttonsContainerStyle}>
            <button style={greenButton} onClick={startTimer}>
              <strong>ابدأ</strong>
              <small>ابدأ احتساب وقت الحوار</small>
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =========================
      شاشة اللعب
  ========================= */

  if (phase === "playing") {
    const remainingSeconds = Math.max(ROUND_LIMIT - seconds, 0);

    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h2 style={titleStyle}>الحوار مستمر 🎤</h2>
        
          <p style={textStyle}>المحاور</p>
          <h2 style={textH2}>{hostPlayer}</h2>

          
          <p style={textStyle}>الضيف</p>
          <h2 style={textH2}>{guestPlayer}</h2>
        



          <div style={timerStyle}>{formatTime(remainingSeconds)}</div>

          <div style={buttonsContainerStyle}>
            <button style={dangerButton} onClick={() => finishRound("said")}>
              <strong>توقف</strong>
              <small>قال الضيف الكلمة الممنوعة</small>
            </button>

            <button style={orangeButton} onClick={() => finishRound("guessed")}>
              <strong>اكتشف الكلمة</strong>
              <small>عرف الضيف الكلمة الممنوعة</small>
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =========================
      شاشة نتيجة الجولة
  ========================= */

  if (phase === "roundResult") {
    const lastResult = roundResults[roundResults.length - 1];

    let resultMessage = "";

    if (lastResult?.type === "said") {
      resultMessage = "المحاور نجح في استدراج الضيف للكلمة الممنوعة.";
    } else if (lastResult?.type === "guessed") {
      resultMessage = "الضيف كان فطين واكتشف الكلمة الممنوعة.";
    } else if (lastResult?.type === "timeup") {
      resultMessage = "الضيف صمد حتى نهاية الوقت.";
    }

    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>انتهت الجولة 😭</h1>

          <p style={textStyle}>{resultMessage}</p>

          <p style={textStyle}>المحاور</p>
          <h2 dir="auto">{hostPlayer}</h2>

          <p style={textStyle}>الضيف</p>
          <h2 dir="auto">{guestPlayer}</h2>

          <p style={textStyle}>
            الوقت المستغرق:{" "}
            <strong>{formatTime(lastResult?.time || 0)}</strong>
          </p>

          <button style={mainButton} onClick={nextRound}>
            الجولة التالية
          </button>
        </div>
      </div>
    );
  }

  /* =========================
      شاشة النتائج النهائية
  ========================= */

  if (phase === "finalResults") {
    const hostWins = roundResults.filter((r) => r.type === "said");
    const smartGuests = roundResults.filter((r) => r.type === "guessed");

    function getAllTopResults(list, compareFn) {
      if (list.length === 0) return [];

      const sorted = [...list].sort(compareFn);
      const best = sorted[0];

      return sorted.filter((item) => compareFn(item, best) === 0);
    }

    const bestHosts =
      hostWins.length > 0
        ? getAllTopResults(hostWins, (a, b) => a.time - b.time)
        : [];

    const bestGuests = getAllTopResults(
      roundResults,
      (a, b) => b.time - a.time
    );

    const bestSmartGuests =
      smartGuests.length > 0
        ? getAllTopResults(smartGuests, (a, b) => a.time - b.time)
        : [];

    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>انتهت اللعبة 🏆</h1>

          <div style={winnerGridStyle}>
            <div style={winnerCardStyle}>
              <div style={winnerIconStyle}>🎤👑</div>
              <p style={roleLabelStyle}>أفضل محاور</p>
              <p style={winnerDescriptionStyle}>أسرع شخص أسقط ضيفًا</p>

              {bestHosts.length > 0 ? (
                bestHosts.map((h, i) => (
                  <div key={i}>
                    <h2 dir="auto">{h.host}</h2>
                    <p style={winnerTimeStyle}>{formatTime(h.time)}</p>
                  </div>
                ))
              ) : (
                <p style={textStyle}>ما أحد أسقط ضيفه 😭</p>
              )}
            </div>

            <div style={winnerCardStyle}>
              <div style={winnerIconStyle}>🛡️👑</div>
              <p style={roleLabelStyle}>أفضل ضيف</p>
              <p style={winnerDescriptionStyle}>
                أطول شخص صمد أمام المحاور
              </p>

              {bestGuests.map((g, i) => (
                <div key={i}>
                  <h2 dir="auto">{g.guest}</h2>
                  <p style={winnerTimeStyle}>{formatTime(g.time)}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={smartGuestCardStyle}>
            <div style={winnerIconStyle}>🧠✨</div>
            <p style={roleLabelStyle}>الضيف الفطين</p>
            <p style={winnerDescriptionStyle}>أسرع شخص اكتشف الكلمة</p>

            {bestSmartGuests.length > 0 ? (
              bestSmartGuests.map((s, i) => (
                <div key={i}>
                  <h2 dir="auto">{s.guest}</h2>
                  <p style={winnerTimeStyle}>{formatTime(s.time)}</p>
                </div>
              ))
            ) : (
              <p style={textStyle}>ما أحد اكتشف الكلمة هذه المرة</p>
            )}
          </div>

          <h3 style={{ marginTop: "24px" }}>تفاصيل الجولات</h3>

          {roundResults.map((result, index) => (
            <div key={index} style={resultItemStyle}>
              <span>الجولة {index + 1}: </span>
              <span dir="auto">{result.host}</span>
              <span> مع </span>
              <span dir="auto">{result.guest}</span>
              <span> — {formatTime(result.time)}</span>
            </div>
          ))}

          <br />

          <button style={mainButton} onClick={() => navigate("/games")}>
            رجوع للألعاب
          </button>
        </div>
      </div>
    );
  }
}

/* =========================
    التنسيقات (CSS-in-JS)
========================= */

const textH2 ={
  fontFamily: "Cairo, sans-serif",
  fontSize: "22px",
  fontWeight: "700",
  
}


const pageStyle = {
  minHeight: "100dvh",
  background: "#f7f5ff",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "24px",
  boxSizing: "border-box",
  fontFamily: "Cairo, sans-serif"
};

const cardStyle = {
  background: "white",
  width: "100%",
  maxWidth: "520px",
  padding: "28px",
  borderRadius: "24px",
  textAlign: "center",
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
};

const titleStyle = {
  color: "#6C4CF1",
  marginTop: 0,
  marginBottom: "12px",
  fontFamily: "Cairo, sans-serif",
  fontSize: "30px",
  fontWeight: 700,
  padding: "6px"
};

const textStyle = {
  color: "#777",
  lineHeight: 1.8
};

const mainButton = {
  width: "100%",
  minHeight: "76px",
  padding: "10px",
  background: "#6C4CF1",
  color: "white",
  border: "none",
  borderRadius: "14px",
  fontSize: "17px",
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "Cairo, sans-serif",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  gap: "4px",
  lineHeight: 1.4,
  marginBottom: "12px"
};

const greenButton = {
  ...mainButton,
  background: "#2f9e44"
};

const dangerButton = {
  ...mainButton,
  background: "#ff4d6d"
};

const orangeButton = {
  ...mainButton,
  background: "#f59f00"
};

const buttonsContainerStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  marginTop: "20px"
};

const roleCardStyle = {
  background: "#f7f5ff",
  padding: "16px",
  borderRadius: "18px",
  marginTop: "16px"
};

const roleLabelStyle = {
  color: "#6C4CF1",
  fontWeight: 700,
  marginBottom: "6px",
  fontFamily: "Cairo, sans-serif"
};

const wordCardStyle = {
  background: "#fff0f6",
  padding: "32px 22px",
  borderRadius: "22px",
  marginTop: "22px",
  border: "2px dashed #ff4d8d",
  minHeight: "120px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center"
};

const forbiddenWordStyle = {
  margin: 0,
  fontFamily: "Cairo, sans-serif",
  fontSize: "42px",
  lineHeight: 1.6,
  color: "#222",
  wordBreak: "break-word"
};

const timerStyle = {
  background: "#6C4CF1",
  color: "white",
  padding: "24px",
  borderRadius: "20px",
  fontSize: "48px",
  fontWeight: 700,
  margin: "24px 0",
  fontFamily: "Cairo, sans-serif"
};

const winnerGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
  marginTop: "20px"
};

const winnerCardStyle = {
  background: "#f7f5ff",
  padding: "16px",
  borderRadius: "18px",
  textAlign: "center",
  minHeight: "220px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between"
};

const smartGuestCardStyle = {
  background: "#fff8e1",
  padding: "16px",
  borderRadius: "18px",
  textAlign: "center",
  marginTop: "12px"
};

const winnerIconStyle = {
  fontSize: "34px",
  marginBottom: "6px"
};

const winnerDescriptionStyle = {
  color: "#888",
  fontSize: "14px",
  lineHeight: 1.6,
  minHeight: "45px",
  marginTop: "4px"
};

const winnerTimeStyle = {
  fontSize: "18px",
  fontWeight: "700",
  color: "#6C4CF1",
  marginTop: "8px",
  fontFamily: "Cairo, sans-serif"
};

const resultItemStyle = {
  background: "#f7f5ff",
  padding: "14px",
  borderRadius: "14px",
  marginTop: "10px",
  fontWeight: 700,
  lineHeight: 1.8
};