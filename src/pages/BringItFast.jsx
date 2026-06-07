import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

/* =========================
   إعدادات عامة
========================= */

// الحد الأقصى للاعبين
const MAX_PLAYERS = 12;

// ألوان اللاعبين
const COLORS = [
  "#FF3B30", // أحمر
  "#007AFF", // أزرق
  "#34C759", // أخضر
  "#FFD60A", // أصفر
  "#AF52DE", // بنفسجي
  "#FF9500", // برتقالي
  "#EA87D1", // وردي
  "#8E8E93", // رمادي
  "#5AC8FA", // سماوي
  "#8B5E3C", // بني
  "#000000", // أسود
  "#00FF7F", // أخضر نعناعي
];

// المهام (مجموعة كبيرة ومتنوعة، معظمها متوفر في أي منزل أو جلسة)
const TASKS = [
  "جيب قلم",
  "جيب مفتاح",
  "جيب شيء أحمر",
  "جيب شيء أزرق",
  "جيب كوب",
  "جيب كتاب",
  "جيب شيء دائري",
  "جيب منديل",
  "جيب شاحن",
  "جيب شيء صغير",
  "جيب شيء أسود",
  "جيب شيء ناعم",
  "جيب شيء تلبسه",
  "جيب شيء من المطبخ",
  "جيب شيء فيه كتابة",
  "جيب عطر",
  "جيب قارورة موية",
  "جيب نظارة",

  // 🆕 إضافات جديدة وممتعة
  "جيب جورب",
  "جيب ملعقة",
  "جيب شوكة",
  "جيب ساعة",
  "جيب وسادة",
  "جيب لعبة",
  "جيب شيء شفاف",
  "جيب شيء فيه أزرار",
  "جيب شيء خشبي",
  "جيب شيء بلاستيك",
  "جيب شيء طري",
  "جيب حذاء",
  "جيب قبعة",
  "جيب مشط",
  "جيب فرشاة أسنان",
  "جيب صابون",
  "جيب كيس",
  "جيب ورقة",
  "جيب بطارية",
  "جيب منشفة",
  "جيب ربطة شعر",
  "جيب محفظة",
  "جيب عملة",
  "جيب مغناطيس",
  "جيب صورة",
  "جيب شيء تأكله",
  "جيب شيء مثلث",
  "جيب شيء مربع",
  "جيب شيء من غرفة النوم",
  "جيب شيء له غطاء",
  "جيب شيء تستخدمه في الصباح",
  "جيب شيء ملمسه خشن",
  "جيب شيء ملمسه أملس",
  "جيب شيء بارد",
  "جيب شيء فيه ألوان متعددة",
  "جيب شيء فيه أرقام",
  "جيب شيء له رائحة حلوة",
  "جيب شيء على شكل نجمة",
  "جيب شيء يفتح ويقفل",
];

/* =========================
   دوال مساعدة
========================= */

// قراءة اللاعبين من localStorage
function getSavedPlayers() {
  try {
    const savedPlayers = localStorage.getItem("current-players");
    return savedPlayers ? JSON.parse(savedPlayers) : [];
  } catch {
    return [];
  }
}

// الوقت الحالي بالمللي ثانية
function getCurrentTime() {
  return Date.now();
}

// خلط مصفوفة (خوارزمية Fisher‑Yates)
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[randomIndex];
    shuffled[randomIndex] = temp;
  }
  return shuffled;
}

// إنشاء قائمة لاعبين بألوان فريدة (بدون تكرار)
function createPlayersWithColors(players) {
  const shuffledColors = shuffleArray(COLORS);
  return players.map((player, index) => ({
    name: player,
    color: shuffledColors[index],
  }));
}

// ============= تحسين الصوت (أقرب للبشر) =============

let bestArabicVoice = null;

// جلب أفضل صوت عربي متاح
function getBestArabicVoice() {
  if (!window.speechSynthesis) return null;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  // 1. صوت طبيعي (يحوي natural أو premium)
  let naturalVoice = voices.find(
    (v) =>
      v.lang.startsWith("ar") &&
      (v.name.toLowerCase().includes("natural") ||
        v.name.toLowerCase().includes("premium"))
  );

  // 2. أصوات عربية معروفة بجودتها العالية
  if (!naturalVoice) {
    naturalVoice = voices.find(
      (v) =>
        v.lang.startsWith("ar") &&
        (v.name.includes("Zayd") ||
          v.name.includes("Maged") ||
          v.name.includes("Tarik") ||
          v.name.includes("Salma") ||
          v.name.includes("Laila"))
    );
  }

  // 3. أي صوت عربي
  if (!naturalVoice) {
    naturalVoice = voices.find((v) => v.lang.startsWith("ar"));
  }

  return naturalVoice || voices[0];
}

// دالة نطق داخلية
function speakInternal(text, lowVolume = false) {
  if (!window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "ar-SA";
  speech.rate = 0.9;   // أبطأ قليلاً للوضوح
  speech.pitch = 1.0;  // نبرة طبيعية
  speech.volume = lowVolume ? 0.01 : 1;

  if (bestArabicVoice) {
    speech.voice = bestArabicVoice;
  }

  setTimeout(() => {
    window.speechSynthesis.speak(speech);
  }, 200);
}

// تهيئة الصوت بعد أول ضغطة من المستخدم
function prepareSpeech() {
  if (!window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  if (!bestArabicVoice) {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      bestArabicVoice = getBestArabicVoice();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        bestArabicVoice = getBestArabicVoice();
        speakInternal("جاهزين", true);
      };
      return;
    }
  }

  speakInternal("جاهزين", true);
}

// نطق المهمة بوضوح
function speakArabic(text) {
  speakInternal(text, false);
}

// ============= دوال التنسيق والإحصائيات =============

function formatTime(seconds) {
  return `${seconds.toFixed(2)} ثانية`;
}

function getWinsText(wins) {
  if (wins === 0) return "ما فاز بأي جولة";
  if (wins === 1) return "فاز بجولة واحدة 🎯";
  if (wins === 2) return "فاز بجولتين 🎯🎯";
  if (wins === 3) return "فاز بثلاث جولات 🏆";
  return `فاز بـ ${wins} جولات 🏆`;
}

function calculateFinalStats(players, results) {
  const stats = {};
  players.forEach((player) => {
    stats[player] = { wins: 0, totalTime: 0 };
  });

  results.forEach((result) => {
    stats[result.winner].wins += 1;
    stats[result.winner].totalTime += result.time;
  });

  return Object.entries(stats).sort((a, b) => {
    const playerA = a[1];
    const playerB = b[1];
    if (playerB.wins !== playerA.wins) {
      return playerB.wins - playerA.wins;
    }
    const averageA = playerA.wins === 0 ? Infinity : playerA.totalTime / playerA.wins;
    const averageB = playerB.wins === 0 ? Infinity : playerB.totalTime / playerB.wins;
    return averageA - averageB;
  });
}

/* =========================
   مكوّن اللعبة
========================= */

export default function BringItFast() {
  const navigate = useNavigate();

  // =========================
  // مشاركة اللعبة
  // =========================
  async function shareGame() {
    const gameUrl = `${window.location.origin}/play/bring-it-fast/setup`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "ونسنّا ⚡",
          text: "جربوا لعبة جيبها بسرعة في ونسنّا 🎮",
          url: gameUrl,
        });
      } else {
        await navigator.clipboard.writeText(gameUrl);
        alert("تم نسخ رابط اللعبة ✅");
      }
    } catch (error) {
      console.log(error);
    }
  }

  // اللاعبون وألوانهم
  const players = getSavedPlayers();
  const [playersWithColors] = useState(() => createPlayersWithColors(players));

  // مراحل اللعبة
  const [phase, setPhase] = useState("setup");
  const [roundCount, setRoundCount] = useState(3);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentTask, setCurrentTask] = useState("");
  const [countdown, setCountdown] = useState(3);

  // ✅ تمت إزالة isRoundFinished state نهائياً
  // نعتمد فقط على المرجع الذري (useRef) لمنع السباق
  const isRoundFinishedRef = useRef(false);

  const [results, setResults] = useState([]);
  const startTimeRef = useRef(null);

  // ============= إدارة المهام بدون تكرار =============
  const tasksPoolRef = useRef([]);

  // إعادة بناء قائمة المهام (خلط جديد)
  function reshuffleTasksPool() {
    tasksPoolRef.current = shuffleArray(TASKS);
  }

  // سحب مهمة عشوائية بدون تكرار
  function getNextTask() {
    if (tasksPoolRef.current.length === 0) {
      reshuffleTasksPool();
    }
    return tasksPoolRef.current.shift();
  }

  /* =========================
     دوال التحكم
  ========================= */

  function startCountdown() {
    prepareSpeech();

    // إعادة تعيين حالة الجولة
    isRoundFinishedRef.current = false;
    // ✅ لم نعد نحتاج setIsRoundFinished

    setCountdown(3);
    setPhase("countdown");
  }

  function finishRound(player) {
    // ✅ المرجع الذري يمنع تماماً أكثر من فائز
    if (isRoundFinishedRef.current) return;

    isRoundFinishedRef.current = true;

    const endTime = getCurrentTime();
    const timeInSeconds = (endTime - startTimeRef.current) / 1000;

    const newResult = {
      round: currentRound,
      winner: player.name,
      color: player.color,
      task: currentTask,
      time: timeInSeconds,
    };

    setResults((prev) => [...prev, newResult]);
    setPhase("roundResult");
  }

  function goToNextRound() {
    if (currentRound >= roundCount) {
      setPhase("finalResults");
      return;
    }

    isRoundFinishedRef.current = false;
    setCurrentRound((prev) => prev + 1);
    setPhase("ready");
  }

  function playAgain() {
    isRoundFinishedRef.current = false;
    reshuffleTasksPool();
    setCurrentRound(1);
    setResults([]);
    setCurrentTask("");
    setPhase("setup");
  }

  // ============= تأثيرات الصوت والتنظيف =============

  useEffect(() => {
    if (phase !== "countdown") return;

    if (countdown > 1) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      const task = getNextTask();
      setCurrentTask(task);
      setPhase("playing");

      speakArabic(task);
      startTimeRef.current = getCurrentTime();
    }, 1000);

    return () => clearTimeout(timer);
    // ✅ getNextTask ثابتة ولا تحتاج أن تكون تبعية
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, countdown]);

  // تنظيف الصوت عند مغادرة مرحلة اللعب أو الخروج
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, [phase]);

  // ============= حالات الحافة: لا لاعبين أو أكثر من 12 =============

  if (players.length === 0) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>ما فيه لاعبين محفوظين</h1>
          <button style={mainButton} onClick={() => navigate("/games")}>
            رجوع للألعاب
          </button>
        </div>
      </div>
    );
  }

  if (players.length > MAX_PLAYERS) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>عذرًا 💜</h1>
          <p style={textStyle}>
            لعبة "جيبها بسرعة" تدعم حتى 12 لاعبًا فقط.
          </p>
          <p style={textStyle}>
            حتى يحصل كل لاعب على لون مختلف وواضح بدون تكرار.
          </p>
          <button style={mainButton} onClick={() => navigate("/games")}>
            رجوع للألعاب
          </button>
        </div>
      </div>
    );
  }

  /* =========================
     شاشة الإعداد
  ========================= */
  if (phase === "setup") {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>جيبها بسرعة ⚡</h1>
          <p style={textStyle}>
            كل لاعب يحفظ لونه، وبعد ظهور المهمة يرجع ويضغط لونه بسرعة.
          </p>

          <div style={colorsListStyle}>
            {playersWithColors.map((player) => (
              <div key={player.name} style={playerColorRowStyle}>
                <div
                  style={{
                    ...smallColorCircleStyle,
                    background: player.color,
                  }}
                />
                <span style={playerNameStyle}>{player.name}</span>
              </div>
            ))}
          </div>

          <label style={labelStyle}>عدد الجولات</label>
          <input
            type="number"
            min="1"
            max="10"
            value={roundCount}
            onChange={(e) => setRoundCount(Number(e.target.value))}
            style={inputStyle}
          />

          <button
            style={mainButton}
            onClick={() => {
              reshuffleTasksPool();
              setPhase("ready");
            }}
          >
            حفظنا ألواننا
          </button>
        </div>
      </div>
    );
  }

  /* =========================
     شاشة الاستعداد
  ========================= */
  if (phase === "ready") {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <p style={roundTextStyle}>
            الجولة {currentRound} من {roundCount}
          </p>
          <h1 style={titleStyle}>استعدوا 🎯</h1>
          <p style={textStyle}>
            حطوا الجوال في مكان واضح للجميع، واستعدوا تركضون وتجيبون المطلوب.
          </p>
          <button style={mainButton} onClick={startCountdown}>
            جاهزين؟ ابدأ
          </button>
        </div>
      </div>
    );
  }

  /* =========================
     شاشة العد التنازلي
  ========================= */
  if (phase === "countdown") {
    return (
      <div style={pageStyle}>
        <div
          style={countdownCircleStyle}
          aria-live="assertive"
          aria-atomic="true"
        >
          <span style={countdownTextStyle}>{countdown}</span>
        </div>
      </div>
    );
  }

  /* =========================
     شاشة اللعب
  ========================= */
  if (phase === "playing") {
    return (
      <div style={playPageStyle}>
        <style>
          {`
            @keyframes floatBall {
              0% { transform: translateY(0px) scale(1); }
              50% { transform: translateY(-8px) scale(1.05); }
              100% { transform: translateY(0px) scale(1); }
            }
          `}
        </style>

        <div style={taskHeaderStyle}>
          <p style={roundTextStyle}>
            الجولة {currentRound} من {roundCount}
          </p>
          <h1 style={taskTextStyle}>{currentTask}</h1>
          <p style={hintStyle}>ارجع واضغط لونك بسرعة!</p>
        </div>

        <div style={ballsGridStyle}>
          {playersWithColors.map((player, index) => (
            <button
              key={player.name}
              aria-label={player.name}
              onClick={() => finishRound(player)}
              style={{
                ...colorBallStyle,
                background: player.color,
                animationDelay: `${index * 0.12}s`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  /* =========================
     شاشة نتيجة الجولة
  ========================= */
  if (phase === "roundResult") {
    const lastResult = results[results.length - 1];

    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>فاز الأسرع 🏆</h1>
          <div style={{ ...winnerColorStyle, background: lastResult.color }} />
          <h2 style={winnerNameStyle}>{lastResult.winner}</h2>
          <p style={textStyle}>المهمة: {lastResult.task}</p>
          <p style={timeStyle}>{formatTime(lastResult.time)}</p>
          <button style={mainButton} onClick={goToNextRound}>
            {currentRound >= roundCount ? "عرض النتائج" : "الجولة التالية"}
          </button>
        </div>
      </div>
    );
  }

  /* =========================
     شاشة النتائج النهائية
  ========================= */
  if (phase === "finalResults") {
    const finalStats = calculateFinalStats(players, results);
    const topWinner = finalStats[0];

    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>النتائج النهائية 🏆</h1>
          <h2 style={winnerNameStyle}>الفائز: {topWinner[0]}</h2>
          <p style={textStyle}>{getWinsText(topWinner[1].wins)}</p>

          <div style={resultsListStyle}>
            {finalStats.map(([player, stat]) => (
              <div key={player} style={resultItemStyle}>
                <strong style={resultPlayerStyle}>{player}</strong>
                <span style={resultDetailsStyle}>{getWinsText(stat.wins)}</span>
              </div>
            ))}
          </div>

          <h3 style={subTitleStyle}>تفاصيل الجولات</h3>
          {results.map((result) => (
            <div key={result.round} style={roundResultItemStyle}>
              <span style={roundResultTextStyle}>
                الجولة {result.round}: {result.winner} — {formatTime(result.time)}
              </span>
            </div>
          ))}

          <button style={mainButton} onClick={playAgain}>
            العب مرة ثانية
          </button>

          <div style={{ marginTop: "18px", marginBottom: "10px" }}>
            <p
              style={{
                color: "#777",
                fontSize: "15px",
                fontWeight: "700",
                marginBottom: "10px",
                fontFamily: "Cairo, sans-serif",
              }}
            >
              أعجبتك اللعبة؟ شاركها مع أصدقائك 🎮
            </p>
            <button
              style={{ ...mainButton, background: "#6DD086", marginTop: 0 }}
              onClick={shareGame}
            >
              😎 شارك اللعبة
            </button>
          </div>

          <button
            style={{ ...mainButton, background: "#888" }}
            onClick={() => navigate("/games")}
          >
            رجوع للألعاب
          </button>
        </div>
      </div>
    );
  }
}

/* =========================
   التنسيقات
========================= */

const cairoFont = "Cairo, sans-serif";

const pageStyle = {
  minHeight: "100dvh",
  background: "#F7F5FF",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "30px",
  paddingBottom: "60px",
  boxSizing: "border-box",
  fontFamily: cairoFont,
};

const cardStyle = {
  background: "#ffffff",
  width: "100%",
  maxWidth: "550px",
  padding: "28px",
  borderRadius: "32px",
  textAlign: "center",
  boxShadow: "0 8px 20px rgba(190, 182, 182, 0.35)",
  fontFamily: cairoFont,
};

const titleStyle = {
  color: "#6C4CF1",
  marginTop: 0,
  marginBottom: "18px",
  fontSize: "36px",
  fontWeight: "900",
  lineHeight: 1.3,
  fontFamily: cairoFont,
};

const textStyle = {
  color: "#777",
  fontSize: "17px",
  fontWeight: "700",
  lineHeight: 1.8,
  fontFamily: cairoFont,
};

const roundTextStyle = {
  color: "#6C4CF1",
  fontSize: "17px",
  fontWeight: "900",
  margin: "0 0 12px",
  fontFamily: cairoFont,
};

const mainButton = {
  width: "100%",
  minHeight: "70px",
  marginTop: "14px",
  padding: "14px",
  background: "#6C4CF1",
  color: "white",
  border: "none",
  borderRadius: "24px",
  fontSize: "18px",
  fontWeight: "900",
  cursor: "pointer",
  fontFamily: cairoFont,
  boxShadow: "0 8px 18px rgba(108,76,241,0.18)",
};

const colorsListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  margin: "24px 0",
  fontFamily: cairoFont,
};

const playerColorRowStyle = {
  background: "#F7F5FF",
  borderRadius: "22px",
  padding: "12px 16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  color: "#444",
  fontFamily: cairoFont,
};

const smallColorCircleStyle = {
  width: "34px",
  height: "34px",
  borderRadius: "50%",
  border: "2px solid white",
  boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
};

const playerNameStyle = {
  fontSize: "18px",
  fontWeight: "800",
  color: "#444",
  fontFamily: cairoFont,
};

const labelStyle = {
  display: "block",
  color: "#6C4CF1",
  fontSize: "17px",
  fontWeight: "900",
  marginBottom: "8px",
  fontFamily: cairoFont,
};

const inputStyle = {
  width: "100%",
  padding: "14px",
  borderRadius: "20px",
  border: "2px solid #E4DDFB",
  fontSize: "20px",
  fontWeight: "900",
  textAlign: "center",
  fontFamily: cairoFont,
  boxSizing: "border-box",
};

const countdownCircleStyle = {
  width: "220px",
  height: "220px",
  borderRadius: "50%",
  background: "#6C4CF1",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  boxShadow: "0 15px 40px rgba(108,76,241,0.25)",
  fontFamily: cairoFont,
};

const countdownTextStyle = {
  color: "white",
  fontSize: "96px",
  fontWeight: "900",
  fontFamily: cairoFont,
};

const playPageStyle = {
  minHeight: "100dvh",
  background: "#F7F5FF",
  padding: "30px",
  paddingBottom: "60px",
  boxSizing: "border-box",
  fontFamily: cairoFont,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const taskHeaderStyle = {
  width: "100%",
  maxWidth: "560px",
  textAlign: "center",
  marginBottom: "28px",
  fontFamily: cairoFont,
};

const taskTextStyle = {
  color: "#6C4CF1",
  fontSize: "38px",
  fontWeight: "900",
  margin: "10px 0",
  lineHeight: 1.4,
  fontFamily: cairoFont,
};

const hintStyle = {
  color: "#777",
  fontSize: "16px",
  fontWeight: "800",
  fontFamily: cairoFont,
};

const ballsGridStyle = {
  flex: 1,
  width: "100%",
  maxWidth: "560px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(82px, 1fr))",
  gap: "22px",
  alignContent: "center",
  justifyItems: "center",
  fontFamily: cairoFont,
};

const colorBallStyle = {
  width: "86px",
  height: "86px",
  borderRadius: "26px",
  border: "3px solid white",
  cursor: "pointer",
  animation: "floatBall 1.2s ease-in-out infinite",
  boxShadow: "0 10px 22px rgba(0,0,0,0.18)",
  fontFamily: cairoFont,
};

const winnerColorStyle = {
  width: "110px",
  height: "110px",
  borderRadius: "32px",
  margin: "20px auto",
  border: "3px solid white",
  boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
};

const winnerNameStyle = {
  color: "#444",
  fontSize: "30px",
  fontWeight: "900",
  margin: "10px 0",
  fontFamily: cairoFont,
};

const timeStyle = {
  color: "#6C4CF1",
  fontSize: "24px",
  fontWeight: "900",
  fontFamily: cairoFont,
};

const resultsListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  marginTop: "20px",
  fontFamily: cairoFont,
};

const resultItemStyle = {
  background: "#F7F5FF",
  borderRadius: "20px",
  padding: "14px",
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  color: "#555",
  fontFamily: cairoFont,
};

const resultPlayerStyle = {
  fontSize: "18px",
  fontWeight: "900",
  color: "#444",
  fontFamily: cairoFont,
};

const resultDetailsStyle = {
  fontSize: "15px",
  fontWeight: "800",
  color: "#777",
  fontFamily: cairoFont,
};

const subTitleStyle = {
  color: "#6C4CF1",
  marginTop: "26px",
  fontSize: "20px",
  fontWeight: "900",
  fontFamily: cairoFont,
};

const roundResultItemStyle = {
  background: "#FFF3C7",
  borderRadius: "18px",
  padding: "12px",
  marginTop: "10px",
  fontFamily: cairoFont,
};

const roundResultTextStyle = {
  color: "#555",
  fontSize: "15px",
  fontWeight: "800",
  fontFamily: cairoFont,
};