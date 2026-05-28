// نستورد useEffect لتشغيل المؤقت
// ونستورد useState لتخزين بيانات اللعبة المتغيرة
import { useEffect, useState } from "react";

// نستورد useNavigate للرجوع إلى صفحة الألعاب
import { useNavigate } from "react-router-dom";



/* =========================
    دوال مساعدة خارج المكوّن
    حتى لا تسبب مشكلة purity
========================= */


// دالة ترجع رقم عشوائي
function getRandomIndex(length) {
  return Math.floor(Math.random() * length);
}


// دالة تخلط ترتيب عناصر Array
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


// دالة تختار كلمة عشوائية من قائمة كلمات
function pickRandomWord(words) {
  const randomIndex = getRandomIndex(words.length);

  return words[randomIndex];
}


// دالة تنشئ جولات عشوائية
function buildRounds(players, words) {
  const shuffledGuests = shuffleArray(players);

  const shuffledHosts = shuffleArray(players);

  const newRounds = shuffledGuests.map((guest, index) => {
    let host = shuffledHosts[index];

    if (host === guest) {
      host = players.find((player) => player !== guest);
    }

    return {
      guest,
      host,
      word: pickRandomWord(words)
    };
  });

  return newRounds;
}



// لعبة كلمة ممنوعة
export default function ForbiddenWord() {
  const navigate = useNavigate();



  /* =========================
      قراءة اللاعبين
  ========================= */

  const savedPlayers = localStorage.getItem("current-players");

  const players = savedPlayers ? JSON.parse(savedPlayers) : [];



  /* =========================
      الحالات المتغيرة
  ========================= */

  const [phase, setPhase] = useState("category");

  const [, setCategory] = useState(null);

  const [rounds, setRounds] = useState([]);

  const [roundIndex, setRoundIndex] = useState(0);

  const [hostPlayer, setHostPlayer] = useState("");

  const [guestPlayer, setGuestPlayer] = useState("");

  const [forbiddenWord, setForbiddenWord] = useState("");

  const [seconds, setSeconds] = useState(0);

  const [isRunning, setIsRunning] = useState(false);

  const [roundResults, setRoundResults] = useState([]);



  /* =========================
      فئات الكلمات
  ========================= */

  const categories = {
    food: {
      title: "الأكل والمشروبات 🍔",
      words: [
        "قهوة",
        "بيتزا",
        "شاورما",
        "مطعم",
        "جوع",
        "عصير",
        "حلى",
        "سبايسي"
      ]
    },

    feelings: {
      title: "العلاقات والمشاعر 💔",
      words: [
        "حب",
        "زواج",
        "غيرة",
        "بلوك",
        "كراش",
        "زعل",
        "صداقة",
        "إعجاب",
        "اهتمام",
        "اهمال"
      ]
    },

    tech: {
      title: "الألعاب والتقنية 🎮",
      words: [
        "جوال",
        "شاحن",
        "تيك توك",
        "إنترنت",
        "تصوير",
        "لايف",
        "بلايستيشن",
        "سماعة",
        "ستوري",
        "الستريك"
      ]
    },

    daily: {
      title: "الحياة اليومية 🏫",
      words: [
        "دوام",
        "نوم",
        "تأخير",
        "اختبار",
        "مدرسة",
        "جامعة",
        "واجب",
        "مشوار",
        "زيارة",

      ]
    },

    travel: {
      title: "السفر والترفيه ✈️",
      words: [
        "سفر",
        "مطار",
        "بحر",
        "فندق",
        "إجازة",
        "سيارة",
        "طلعة",
        "تصوير"
      ]
    }
  };



  /* =========================
      المؤقت
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



  /* =========================
      تنسيق الوقت
  ========================= */

  function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);

    const secs = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }



  /* =========================
      إنشاء الجولات
  ========================= */

  function createRounds(categoryKey) {
    const words = categories[categoryKey].words;

    const newRounds = buildRounds(players, words);

    setCategory(categoryKey);

    setRounds(newRounds);

    setRoundIndex(0);

    setGuestPlayer(newRounds[0].guest);

    setHostPlayer(newRounds[0].host);

    setForbiddenWord(newRounds[0].word);

    setSeconds(0);

    setIsRunning(false);

    setPhase("roundIntro");
  }



  /* =========================
      بدء المؤقت
  ========================= */

  function startTimer() {
    setSeconds(0);

    setIsRunning(true);
  }



  /* =========================
      إيقاف المؤقت
  ========================= */

  function stopTimer() {
    setIsRunning(false);

    const result = {
      host: hostPlayer,
      guest: guestPlayer,
      word: forbiddenWord,
      time: seconds
    };

    setRoundResults([...roundResults, result]);

    setPhase("roundResult");
  }



  /* =========================
      الجولة التالية
  ========================= */

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
      إذا ما فيه لاعبين
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
      اختيار الفئة
  ========================= */

  if (phase === "category") {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>الكلمة ممنوعة 🤫</h1>

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
      مقدمة الجولة
  ========================= */

  if (phase === "roundIntro") {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <p style={textStyle}>
            الجولة {roundIndex + 1} من {rounds.length}
          </p>

          <h1 style={titleStyle}>الجولة بين</h1>

          <div style={roleCardStyle}>
            <p style={roleLabelStyle}>المحاور</p>

            <h2 dir="auto">{hostPlayer}</h2>
          </div>

          <div style={roleCardStyle}>
            <p style={roleLabelStyle}>الضيف</p>

            <h2 dir="auto">{guestPlayer}</h2>
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
      تعليمات المحاور
  ========================= */

  if (phase === "hostBrief") {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h2 style={titleStyle}>مهمتك 🎤</h2>

          <p style={textStyle}>
            استدرج الضيف ليقول الكلمة الممنوعة
          </p>

          <div style={wordCardStyle}>
            <p style={roleLabelStyle}>الكلمة الممنوعة</p>

            <h1 style={forbiddenWordStyle}>{forbiddenWord}</h1>
          </div>

          <p style={textStyle}>
            عندما يبدأ الحوار اضغط ابدأ
          </p>

          <button
            style={greenButton}
            onClick={() => {
              startTimer();
              setPhase("playing");
            }}
          >
            ابدأ
          </button>
        </div>
      </div>
    );
  }



  /* =========================
      اللعب والمؤقت
  ========================= */

  if (phase === "playing") {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h2 style={titleStyle}>الحوار مستمر 🎤</h2>

          <p style={textStyle}>
            المحاور: <span dir="auto">{hostPlayer}</span>
            <br />
            الضيف: <span dir="auto">{guestPlayer}</span>
          </p>

          <div style={timerStyle}>{formatTime(seconds)}</div>

          <button style={dangerButton} onClick={stopTimer}>
            توقف
          </button>
        </div>
      </div>
    );
  }



  /* =========================
      نتيجة الجولة
  ========================= */

  if (phase === "roundResult") {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>انتهت الجولة 😭</h1>

          <p style={textStyle}>
            استغرق المحاور
          </p>

          <h2 dir="auto" style={{ margin: "6px 0" }}>
            {hostPlayer}
          </h2>

          <p style={textStyle}>
            مدة <strong>{formatTime(seconds)}</strong>
          </p>

          <p style={textStyle}>
            في استدراج الضيف
          </p>

          <h2 dir="auto" style={{ margin: "6px 0" }}>
            {guestPlayer}
          </h2>

          <p style={textStyle}>
            للكلمة الممنوعة
          </p>

          <button style={mainButton} onClick={nextRound}>
            الجولة التالية
          </button>
        </div>
      </div>
    );
  }



  /* =========================
      النتائج النهائية
  ========================= */

  if (phase === "finalResults") {
    const sortedByGuestTime = [...roundResults].sort(
      (a, b) => b.time - a.time
    );

    const sortedByHostSpeed = [...roundResults].sort(
      (a, b) => a.time - b.time
    );

    const bestGuest = sortedByGuestTime[0];

    const bestHost = sortedByHostSpeed[0];

    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>انتهت اللعبة 🏆</h1>

          <div style={winnerGridStyle}>
            <div style={winnerCardStyle}>
              <div style={winnerIconStyle}>🎤👑</div>

              <p style={roleLabelStyle}>أفضل محاور</p>

              <h2 dir="auto">{bestHost.host}</h2>

              <p style={textStyle}>
                أسقط الضيف خلال {formatTime(bestHost.time)}
              </p>
            </div>

            <div style={winnerCardStyle}>
              <div style={winnerIconStyle}>🛡️👑</div>

              <p style={roleLabelStyle}>أفضل ضيف</p>

              <h2 dir="auto">{bestGuest.guest}</h2>

              <p style={textStyle}>
                صمد {formatTime(bestGuest.time)}
              </p>
            </div>
          </div>

          <h3 style={{ marginTop: "24px" }}>
            تفاصيل الجولات
          </h3>

          {roundResults.map((result, index) => (
            <div key={index} style={resultItemStyle}>
              <span>الجولة {index + 1}: </span>

              <span dir="auto">{result.host}</span>

              <span> استدرج </span>

              <span dir="auto">{result.guest}</span>

              <span> خلال {formatTime(result.time)}</span>
            </div>
          ))}

          <button style={mainButton} onClick={() => navigate("/games")}>
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

const pageStyle = {
  minHeight: "100vh",
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
  padding: 5,
  fontSize: "25px",
  fontWeight: 700,
  fontFamily: "Cairo, sans-serif",
};

const textStyle = {
  color: "#777",
  lineHeight: 1.8
};

const mainButton = {
  width: "100%",
  marginTop: "14px",
  padding: "14px",
  background: "#6C4CF1",
  color: "white",
  border: "none",
  borderRadius: "14px",
  fontSize: "17px",
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "Cairo, sans-serif"
};

const greenButton = {
  ...mainButton,
  background: "#2f9e44"
};

const dangerButton = {
  ...mainButton,
  background: "#ff4d6d"
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
  marginBottom: "6px"
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
  margin: "24px 0"
};

const resultItemStyle = {
  background: "#f7f5ff",
  padding: "14px",
  borderRadius: "14px",
  marginTop: "10px",
  fontWeight: 700,
  lineHeight: 1.8
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
  textAlign: "center"
};

const winnerIconStyle = {
  fontSize: "34px",
  marginBottom: "6px"
};