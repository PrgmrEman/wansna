// نستورد الأدوات المطلوبة
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

// عدد الأرقام الذهبية في اللعبة
const NUMBER_COUNT = 4;

/* =========================
   دوال مساعدة خارج المكوّن
========================= */

// توليد 4 أرقام عشوائية بدون تكرار داخل مدى محدد
function generateSecretNumbers(min, max) {
  const numbers = [];
  while (numbers.length < NUMBER_COUNT) {
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    if (!numbers.includes(randomNumber)) {
      numbers.push(randomNumber);
    }
  }
  return numbers;
}

// حساب كم رقم من التخمين موجود ضمن الأرقام الذهبية
function countGoldenNumbers(secretNumbers, guessNumbers) {
  return guessNumbers.filter((num) => secretNumbers.includes(num)).length;
}

// صياغة رسالة النتيجة
function getResultMessage(count) {
  if (count === 0) return "لا يوجد لديك أرقام ذهبية";
  if (count === 1) return "لديك رقم واحد ذهبي";
  if (count === 2) return "لديك رقمين ذهبيين";
  if (count === 3) return "لديك ثلاث أرقام ذهبية";
  return "مبروك! اكتشفت جميع الأرقام الذهبية";
}

// إرجاع أيقونة حسب نتيجة المحاولة
function getResultIcon(count, type) {
  if (type === "withdraw") return "🚪";
  if (count === 0) return "❌";
  if (count === 1) return "🟡";
  if (count === 2) return "🟡🟡";
  if (count === 3) return "🟡🟡🟡";
  return "🏆";
}

// تنسيق الوقت
function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/* =========================
   مكوّن اللعبة الرئيسي
========================= */

export default function GoldenNumbers() {
  const navigate = useNavigate();

  // قراءة اللاعبين من صفحة الإعدادات
  const savedPlayers = localStorage.getItem("current-players");
  const players = savedPlayers ? JSON.parse(savedPlayers) : [];

  // قراءة نمط اللعبة المحفوظ
  const savedMode = localStorage.getItem("golden-numbers-mode");

  // إذا رجع المستخدم من إعدادات الجماعي ومعه لاعبين، نبدأ من شاشة المدى
  const initialPhase =
    savedMode === "group" && players.length > 0 ? "range" : "mode";

  // المرحلة الحالية
  const [phase, setPhase] = useState(initialPhase);

  // نمط اللعب: فردي أو جماعي
  const [mode, setMode] = useState(
    savedMode === "group" && players.length > 0 ? "group" : ""
  );

  // إدخال المدى
  const [minInput, setMinInput] = useState("1");
  const [maxInput, setMaxInput] = useState("100");

  // المدى المعتمد
  const [rangeMin, setRangeMin] = useState(1);
  const [rangeMax, setRangeMax] = useState(100);

  // الأرقام الذهبية
  const [secretNumbers, setSecretNumbers] = useState([]);

  // مربعات التخمين
  const [guessBoxes, setGuessBoxes] = useState(["", "", "", ""]);

  // سجل المحاولات
  const [attempts, setAttempts] = useState([]);

  // آخر رسالة نتيجة
  const [lastMessage, setLastMessage] = useState("");

  // الوقت
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  // اللاعبين النشطين في الجماعي
  const [activePlayers, setActivePlayers] = useState(players);

  // اللاعب الحالي
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentPlayerName, setCurrentPlayerName] = useState(players[0] || "");

  // اللاعب المنسحب مؤقتًا
  const [withdrawnPlayerName, setWithdrawnPlayerName] = useState("");

  // مراجع مربعات الإدخال
  const inputRefs = useRef([]);

  /* =========================
     تشغيل المؤقت أثناء اللعب
  ========================= */

  useEffect(() => {
    if (phase === "playing") {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  /* =========================
     اختيار نمط اللعب
  ========================= */

  function chooseMode(selectedMode) {
    // الجماعي يذهب أولاً لصفحة إعداد اللاعبين
    if (selectedMode === "group") {
      localStorage.setItem("golden-numbers-mode", "group");
      navigate("/play/golden-numbers/setup");
      return;
    }

    // الفردي يذهب مباشرة لشاشة المدى مع شرح اللعبة
    localStorage.setItem("golden-numbers-mode", "solo");
    setMode("solo");
    setPhase("range");
  }

  /* =========================
     بدء اللعبة بعد اختيار المدى
  ========================= */

  function startGame() {
    const min = Number(minInput);
    const max = Number(maxInput);

    if (!Number.isInteger(min) || !Number.isInteger(max)) {
      alert("اكتبي أرقام صحيحة في البداية والنهاية");
      return;
    }

    if (min >= max) {
      alert("رقم البداية لازم يكون أصغر من رقم النهاية");
      return;
    }

    if (max - min + 1 < NUMBER_COUNT) {
      alert(`المدى لازم يحتوي على ${NUMBER_COUNT} أرقام على الأقل`);
      return;
    }

    const generatedNumbers = generateSecretNumbers(min, max);

    setRangeMin(min);
    setRangeMax(max);
    setSecretNumbers(generatedNumbers);
    setGuessBoxes(["", "", "", ""]);
    setAttempts([]);
    setLastMessage("");
    setSeconds(0);

    // إذا كان جماعي ومعه لاعبين من صفحة الإعدادات
    if (savedMode === "group" && players.length > 0) {
      setMode("group");
      setActivePlayers(players);
      setCurrentPlayerIndex(0);
      setCurrentPlayerName(players[0]);
      setPhase("passPhone");
      return;
    }

    // الفردي يبدأ مباشرة
    setMode("solo");
    setPhase("playing");

    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  }

  /* =========================
     إعادة اللعبة بنفس المدى
  ========================= */

  function restartSameRange() {
    const generatedNumbers = generateSecretNumbers(rangeMin, rangeMax);

    setSecretNumbers(generatedNumbers);
    setGuessBoxes(["", "", "", ""]);
    setAttempts([]);
    setLastMessage("");
    setSeconds(0);

    if (mode === "group" && players.length > 0) {
      setActivePlayers(players);
      setCurrentPlayerIndex(0);
      setCurrentPlayerName(players[0]);
      setPhase("passPhone");
      return;
    }

    setPhase("playing");

    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  }

  /* =========================
     بدء دور اللاعب
  ========================= */

  function startPlayerTurn() {
    setGuessBoxes(["", "", "", ""]);
    setLastMessage("");
    setPhase("playing");

    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  }

  /* =========================
     الانتقال للاعب التالي
  ========================= */

  function moveToNextPlayer() {
    if (activePlayers.length === 0) {
      setPhase("giveup");
      return;
    }

    const nextIndex = (currentPlayerIndex + 1) % activePlayers.length;

    setCurrentPlayerIndex(nextIndex);
    setCurrentPlayerName(activePlayers[nextIndex]);
    setPhase("passPhone");
  }

  /* =========================
     تغيير رقم داخل مربع
     يقبل أكثر من خانة مثل 55
     ولا يتحقق من المدى أثناء الكتابة
  ========================= */

  function handleBoxChange(index, value) {
    // إذا كتب المستخدم فاصل مثل شرطة أو مسافة أو فاصلة
    // نستخدمه كإشارة للانتقال للمربع التالي
    const shouldMoveNext = /[\s,،-]/.test(value);

    // نسمح بالأرقام فقط ونحذف أي رموز
    const cleanedValue = value.replace(/[^\d]/g, "");

    // تحديث قيمة المربع الحالي
    const newBoxes = [...guessBoxes];
    newBoxes[index] = cleanedValue;
    setGuessBoxes(newBoxes);

    // الانتقال التلقائي للمربع التالي فقط عند كتابة فاصل
    if (shouldMoveNext && index < NUMBER_COUNT - 1) {
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
      }, 50);
    }
  }

  /* =========================
     التحكم بزر التالي والرجوع
  ========================= */

  function handleKeyDown(index, event) {
    // زر Enter أو Next في الجوال ينقل للمربع التالي
    if (event.key === "Enter" && index < NUMBER_COUNT - 1) {
      event.preventDefault();
      inputRefs.current[index + 1]?.focus();
      return;
    }

    // إذا ضغط Backspace والمربع فارغ، يرجع للمربع السابق
    if (event.key === "Backspace" && guessBoxes[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  /* =========================
     تثبيت التخمين
  ========================= */

  function submitGuess() {
    const guessNumbers = guessBoxes.map((item) => Number(item));

    // التأكد من تعبئة كل المربعات
    if (guessBoxes.some((item) => item === "")) {
      alert("اكتبي الأرقام الأربعة قبل التثبيت");
      return;
    }

    // التحقق من أن كل الأرقام داخل المدى
    const invalidNumber = guessNumbers.find(
      (number) => number < rangeMin || number > rangeMax
    );

    if (invalidNumber !== undefined) {
      alert(`الرقم ${invalidNumber} يجب أن يكون بين ${rangeMin} و ${rangeMax}`);
      return;
    }

    // منع تكرار نفس الرقم في المحاولة
    if (new Set(guessNumbers).size !== NUMBER_COUNT) {
      alert("لا تكررين نفس الرقم في المحاولة");
      return;
    }

    const goldenCount = countGoldenNumbers(secretNumbers, guessNumbers);
    const message = getResultMessage(goldenCount);

    const newAttempt = {
      number: attempts.length + 1,
      player: mode === "group" ? currentPlayerName : "",
      guess: guessNumbers,
      goldenCount,
      message,
      type: "guess"
    };

    const newAttempts = [...attempts, newAttempt];
    setAttempts(newAttempts);
    setLastMessage(message);
    setGuessBoxes(["", "", "", ""]);

    if (goldenCount === NUMBER_COUNT) {
      setPhase("winner");
      return;
    }

    if (mode === "group") {
      setPhase("turnResult");
      return;
    }

    // فردي: ابق في شاشة اللعب
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  }

  /* =========================
     نطق نتيجة محاولة الجماعي
  ========================= */

  function speakAttemptResult() {
    const lastAttempt = attempts[attempts.length - 1];
    if (!lastAttempt) return;

    if (!("speechSynthesis" in window)) {
      alert("المتصفح لا يدعم النطق الصوتي");
      return;
    }

    const numbersText = lastAttempt.guess.join(" و ");
    const text = `محاولة ${lastAttempt.player}. الأرقام هي ${numbersText}. ${lastAttempt.message}`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ar-SA";
    utterance.rate = 0.9;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  /* =========================
     انسحاب لاعب في الجماعي
  ========================= */

  function withdrawCurrentPlayer() {
    const confirmed = window.confirm(
      "هل تريد الانسحاب؟ ستظهر لك الأرقام الذهبية، ثم تكمل اللعبة مع باقي اللاعبين."
    );
    if (!confirmed) return;

    const withdrawAttempt = {
      number: attempts.length + 1,
      player: currentPlayerName,
      guess: [],
      goldenCount: 0,
      message: "انسحب من اللعبة",
      type: "withdraw"
    };

    setAttempts((prev) => [...prev, withdrawAttempt]);
    setWithdrawnPlayerName(currentPlayerName);
    setPhase("playerWithdraw");
  }

  /* =========================
     متابعة اللعبة بعد انسحاب لاعب
  ========================= */

  function continueAfterWithdraw() {
    const remainingPlayers = activePlayers.filter(
      (player) => player !== withdrawnPlayerName
    );

    if (remainingPlayers.length === 0) {
      setActivePlayers([]);
      setPhase("giveup");
      return;
    }

    const nextIndex =
      currentPlayerIndex >= remainingPlayers.length ? 0 : currentPlayerIndex;

    setActivePlayers(remainingPlayers);
    setCurrentPlayerIndex(nextIndex);
    setCurrentPlayerName(remainingPlayers[nextIndex]);
    setWithdrawnPlayerName("");
    setPhase("passPhone");
  }

  /* =========================
     انسحاب فردي أو كشف كامل
  ========================= */

  function revealAndEnd() {
    const confirmed = window.confirm("هل تريد كشف الأرقام الذهبية؟");
    if (!confirmed) return;
    setPhase("giveup");
  }

  /* =========================
     مشاركة اللعبة
  ========================= */

  async function shareGame() {
    const shareText =
      "جربت لعبة الأرقام الذهبية في ونسنّا 🔒✨ لعبة تخمين واستنتاج ممتعة!";
    try {
      if (navigator.share) {
        await navigator.share({
          title: "الأرقام الذهبية",
          text: shareText,
          url: `${window.location.origin}/play/golden-numbers`
        });
      } else {
        await navigator.clipboard.writeText(
          `${window.location.origin}/play/golden-numbers`
        );
        alert("تم نسخ رابط اللعبة");
      }
    } catch {
      // تجاهل إلغاء المشاركة
    }
  }

  /* =========================
     الرجوع لاختيار النمط من البداية
  ========================= */

  function resetGame() {
    localStorage.removeItem("golden-numbers-mode");
    setPhase("mode");
    setMode("");
    setMinInput("1");
    setMaxInput("100");
    setRangeMin(1);
    setRangeMax(100);
    setSecretNumbers([]);
    setGuessBoxes(["", "", "", ""]);
    setAttempts([]);
    setLastMessage("");
    setSeconds(0);
    setActivePlayers(players);
    setCurrentPlayerIndex(0);
    setCurrentPlayerName("");
    setWithdrawnPlayerName("");
  }

  /* =========================
     عرض الشاشات المختلفة
  ========================= */

  // ============ شاشة اختيار النمط ============
  if (phase === "mode") {
    return (
      <>
        <Helmet>
          <title>الأرقام الذهبية - اختر النمط | ونسنا</title>
          <meta name="description" content="اختار نمط لعبة الأرقام الذهبية: فردي أو جماعي. اكتشف الأرقام السرية بأقل عدد من المحاولات." />
          <link rel="canonical" href="https://wansna.vercel.app/play/golden-numbers" />
        </Helmet>
        <div style={pageStyle}>
          <h1 style={headerStyle}>🔒 الأرقام الذهبية</h1>
          <div style={cardStyle}>
            <h2 style={titleStyle}>اختاري طريقة اللعب</h2>
            <button style={secondaryButton} onClick={() => chooseMode("solo")}>
              👤 لعبة فردية
              <small>النظام يختار الأرقام وأنت تخمنين</small>
            </button>
            <button style={secondaryButton} onClick={() => chooseMode("group")}>
              👥 لعبة جماعية
              <small>أضيفوا اللاعبين ثم العبوا بالتناوب</small>
            </button>
            <button style={backButton} onClick={() => navigate("/games")}>
              رجوع للألعاب
            </button>
          </div>
        </div>
      </>
    );
  }

  // ============ شاشة اختيار المدى ============
  if (phase === "range") {
    return (
      <>
        <Helmet>
          <title>الأرقام الذهبية - حدد المدى | ونسنا</title>
          <meta name="description" content="حدد مدى الأرقام الذي سيبحث فيه النظام عن الأرقام الذهبية السرية." />
          <link rel="canonical" href="https://wansna.vercel.app/play/golden-numbers" />
        </Helmet>
        <div style={pageStyle}>
          <h1 style={headerStyle}>🔒 الأرقام الذهبية</h1>
          <div style={cardStyle}>
            <h2 style={titleStyle}>اختاري مدى الأرقام</h2>
            <p style={textStyle}>
              حددي بداية ونهاية الأرقام التي سيختار منها النظام الأرقام الذهبية.
            </p>
            <div style={rangeRowStyle}>
              <div>
                <label style={labelStyle}>إلى</label>
                <input
                  style={inputStyle}
                  value={maxInput}
                  onChange={(e) => setMaxInput(e.target.value)}
                  inputMode="numeric"
                  placeholder="100"
                />
              </div>
              <div>
                <label style={labelStyle}>من</label>
                <input
                  style={inputStyle}
                  value={minInput}
                  onChange={(e) => setMinInput(e.target.value)}
                  inputMode="numeric"
                  placeholder="1"
                />
              </div>
            </div>
            <button style={mainButton} onClick={startGame}>
              بداية اللعبة
            </button>
            {mode === "solo" && (
              <button
                style={secondaryButton}
                onClick={() => setPhase("explain")}
              >
                شرح اللعبة
              </button>
            )}
            <button style={backButton} onClick={resetGame}>
              اختيار نمط جديد
            </button>
          </div>
        </div>
      </>
    );
  }

  // ============ شاشة الشرح ============
  if (phase === "explain") {
    return (
      <>
        <Helmet>
          <title>شرح لعبة الأرقام الذهبية | ونسنا</title>
          <meta name="description" content="تعلم طريقة لعب الأرقام الذهبية: خمن 4 أرقام سرية يعطيك النظام عدد الأرقام الصحيحة كل مرة." />
          <link rel="canonical" href="https://wansna.vercel.app/play/golden-numbers" />
        </Helmet>
        <div style={pageStyle}>
          <h1 style={headerStyle}>🔒 الأرقام الذهبية</h1>
          <div style={cardStyle}>
            <h2 style={titleStyle}>طريقة اللعب</h2>
            <div style={explainBoxStyle}>
              <p>النظام يختار 4 أرقام ذهبية سرية من المدى الذي تم تحديده</p>
              <p>اكتب 4 أرقام في المربعات</p>
              <p>بعد كل محاولة سيخبرك النظام كم رقمًا ذهبيًا اكتشفت</p>
              <p>الترتيب لا يهم، المهم معرفة الأرقام الأربعة</p>
              <p>كل محاولة تُحفظ بالأسفل بدون عرض الأرقام</p>
            </div>
            <button style={mainButton} onClick={startGame}>
              بداية اللعبة
            </button>
            <button style={backButton} onClick={() => setPhase("range")}>
              رجوع
            </button>
          </div>
        </div>
      </>
    );
  }

  // ============ شاشة تمرير الجوال ============
  if (phase === "passPhone") {
    return (
      <>
        <Helmet>
          <title>دور {currentPlayerName} - الأرقام الذهبية | ونسنا</title>
          <meta name="description" content={`مرر الجوال إلى ${currentPlayerName}. حان دوره لتخمين الأرقام الذهبية.`} />
          <link rel="canonical" href="https://wansna.vercel.app/play/golden-numbers" />
        </Helmet>
        <div style={pageStyle}>
          <h1 style={headerStyle}>🔒 الأرقام الذهبية</h1>
          <div style={cardStyle}>
            <div style={rightTextStyle}>
              <p style={textStyle}>مرر الجوال إلى</p>
              <div style={playerNameStyle} dir="auto">
                {currentPlayerName}
              </div>
            </div>
            <p style={textStyle}>
              لا تبدأ المحاولة إلا عندما يكون الجوال مع اللاعب الصحيح.
            </p>
            <button style={mainButton} onClick={startPlayerTurn}>
              هذا أنا، ابدأ
            </button>
            <button style={dangerButton} onClick={withdrawCurrentPlayer}>
              انسحاب اللاعب
            </button>
            <button style={backButton} onClick={() => navigate("/games")}>
              رجوع للألعاب
            </button>
          </div>
        </div>
      </>
    );
  }

  // ============ شاشة اللعب ============
  if (phase === "playing") {
    return (
      <>
        <Helmet>
          <title>العب الآن - الأرقام الذهبية | ونسنا</title>
          <meta name="description" content={`${mode === "group" ? currentPlayerName + " - " : ""}خمن 4 أرقام بين ${rangeMin} و ${rangeMax}.`} />
          <link rel="canonical" href="https://wansna.vercel.app/play/golden-numbers" />
        </Helmet>
        <div style={pageStyle}>
          <h1 style={headerStyle}>🔒 الأرقام الذهبية</h1>
          <div style={cardStyle}>
            {mode === "group" && (
              <div style={turnBoxStyle}>
                <div>
                  <p style={smallLabelStyle}>دور اللاعب</p>
                  <h2 dir="auto" style={nameTitleStyle}>
                    {currentPlayerName}
                  </h2>
                </div>
              </div>
            )}

            <p style={textStyle}>
              اكتبي 4 أرقام من {rangeMin} إلى {rangeMax}
            </p>

            <div style={codeBoxContainerStyle}>
              {guessBoxes.map((value, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  style={codeInputStyle}
                  value={value}
                  onChange={(e) => handleBoxChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  inputMode="numeric"
                  enterKeyHint={index < NUMBER_COUNT - 1 ? "next" : "done"}
                  placeholder="؟"
                />
              ))}
            </div>

            <button style={mainButton} onClick={submitGuess}>
              تثبيت التخمين
            </button>

            {lastMessage && <div style={resultMessageStyle}>{lastMessage}</div>}

            <div style={attemptsBoxStyle}>
              <h3 style={attemptsTitleStyle}>سجل المحاولات</h3>
              {attempts.length === 0 ? (
                <p style={smallTextStyle}>لا توجد محاولات بعد</p>
              ) : (
                attempts.map((attempt) => (
                  <div key={attempt.number} style={attemptItemStyle}>
                    <div style={{ width: "100%" }}>
                      <div style={attemptNumberStyle}>
                        محاولة {attempt.number}
                      </div>
                      <div style={attemptIconStyle}>
                        {getResultIcon(attempt.goldenCount, attempt.type)}
                      </div>
                      {mode === "group" && (
                        <div dir="auto" style={attemptPlayerStyle}>
                          {attempt.player}
                        </div>
                      )}
                      <div style={attemptMessageStyle}>{attempt.message}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {mode === "group" ? (
              <button style={dangerButton} onClick={withdrawCurrentPlayer}>
                انسحاب اللاعب
              </button>
            ) : (
              <button style={dangerButton} onClick={revealAndEnd}>
                انسحاب وكشف الأرقام
              </button>
            )}

            <button style={backButton} onClick={() => navigate("/games")}>
              رجوع للألعاب
            </button>
          </div>
        </div>
      </>
    );
  }

  // ============ شاشة نتيجة محاولة الجماعي ============
  if (phase === "turnResult") {
    const lastAttempt = attempts[attempts.length - 1];
    return (
      <>
        <Helmet>
          <title>نتيجة المحاولة - الأرقام الذهبية | ونسنا</title>
          <meta name="description" content={`${lastAttempt?.player}: ${lastAttempt?.message}`} />
          <link rel="canonical" href="https://wansna.vercel.app/play/golden-numbers" />
        </Helmet>
        <div style={pageStyle}>
          <h1 style={headerStyle}>🔒 الأرقام الذهبية</h1>
          <div style={cardStyle}>
            <h2 style={titleStyle}>نتيجة المحاولة</h2>
            <div style={rightTextStyle}>
              <p style={textStyle}>صاحب المحاولة</p>
              <h2 dir="auto" style={nameTitleStyle}>
                {lastAttempt?.player}
              </h2>
            </div>
            <div style={guessVisibleStyle}>
              {lastAttempt?.guess.join(" - ")}
            </div>
            <div style={resultMessageStyle}>{lastAttempt?.message}</div>
            <button style={secondaryButton} onClick={speakAttemptResult}>
              🔊 أعلن النتيجة
            </button>
            <button style={mainButton} onClick={moveToNextPlayer}>
              اللاعب التالي
            </button>
            <button style={dangerButton} onClick={withdrawCurrentPlayer}>
              انسحاب اللاعب
            </button>
            <button style={backButton} onClick={() => navigate("/games")}>
              رجوع للألعاب
            </button>
          </div>
        </div>
      </>
    );
  }

  // ============ شاشة انسحاب لاعب ============
  if (phase === "playerWithdraw") {
    return (
      <>
        <Helmet>
          <title>انسحب {withdrawnPlayerName} - الأرقام الذهبية | ونسنا</title>
          <meta name="description" content={`${withdrawnPlayerName} انسحب. واصل مع باقي اللاعبين.`} />
          <link rel="canonical" href="https://wansna.vercel.app/play/golden-numbers" />
        </Helmet>
        <div style={pageStyle}>
          <h1 style={headerStyle}>🔒 الأرقام الذهبية</h1>
          <div style={cardStyle}>
            <h2 style={titleStyle}>انسحب اللاعب</h2>
            <div style={rightTextStyle}>
              <p style={textStyle}>اللاعب المنسحب</p>
              <h2 dir="auto" style={nameTitleStyle}>
                {withdrawnPlayerName}
              </h2>
            </div>
            <p style={textStyle}>الأرقام الذهبية الصحيحة:</p>
            <div style={secretNumbersStyle}>
              {secretNumbers.join(" - ")}
            </div>
            <button style={mainButton} onClick={continueAfterWithdraw}>
              متابعة مع باقي اللاعبين
            </button>
            <button style={backButton} onClick={() => navigate("/games")}>
              رجوع للألعاب
            </button>
          </div>
        </div>
      </>
    );
  }

  // ============ شاشة الفوز ============
  if (phase === "winner") {
    const winnerAttempt = attempts[attempts.length - 1];
    return (
      <>
        <Helmet>
          <title>🏆 فائز! - الأرقام الذهبية | ونسنا</title>
          <meta name="description" content={`${mode === "group" ? winnerAttempt?.player + " " : ""}اكتشف الأرقام الذهبية في ${attempts.length} محاولات.`} />
          <link rel="canonical" href="https://wansna.vercel.app/play/golden-numbers" />
        </Helmet>
        <div style={pageStyle}>
          <h1 style={headerStyle}>🔒 الأرقام الذهبية</h1>
          <div style={cardStyle}>
            <div style={winnerIconStyle}>🏆</div>
            <br />
            <h2 style={titleStyle}>مبروكـ</h2>
            {mode === "group" && (
              <div>
                <p style={textStyle}>الفائز</p>
                <h2 dir="auto" style={nameTitleStyle}>
                  {winnerAttempt?.player}
                </h2>
                <br />
              </div>
            )}
            <p style={textStyle}>لقد تم اكتشاف جميع الأرقام الذهبية</p>
            <p style={textStyle}>الأرقام الذهبية الصحيحة</p>
            <div style={secretNumbersStyle}>
              {secretNumbers.join(" - ")}
            </div>
            <div style={summaryBoxStyle}>
              <p>عدد المحاولات: {attempts.length}</p>
              <p>الوقت: {formatTime(seconds)}</p>
            </div>
            <button style={share} onClick={shareGame}>
              أعجبتني اللعبة، أود مشاركتها
            </button>
            <button style={secondaryButton} onClick={restartSameRange}>
              أعد اللعبة بنفس المدى
            </button>
            <button style={backButton} onClick={() => navigate("/games")}>
              رجوع للألعاب
            </button>
          </div>
        </div>
      </>
    );
  }

  // ============ شاشة كشف الأرقام ============
  if (phase === "giveup") {
    return (
      <>
        <Helmet>
          <title>كشف الأرقام - الأرقام الذهبية | ونسنا</title>
          <meta name="description" content="تم كشف الأرقام الذهبية. حاول مرة أخرى!" />
          <link rel="canonical" href="https://wansna.vercel.app/play/golden-numbers" />
        </Helmet>
        <div style={pageStyle}>
          <h1 style={headerStyle}>🔒 الأرقام الذهبية</h1>
          <div style={cardStyle}>
            <h2 style={titleStyle}>تم كشف الأرقام</h2>
            <p style={textStyle}>الأرقام الذهبية الصحيحة</p>
            <div style={secretNumbersStyle}>
              {secretNumbers.join(" - ")}
            </div>
            <div style={summaryBoxStyle}>
              <p>عدد المحاولات: {attempts.length}</p>
              <p>الوقت: {formatTime(seconds)}</p>
            </div>
            <button style={secondaryButton} onClick={restartSameRange}>
              أعد اللعبة بنفس المدى
            </button>
            <button style={backButton} onClick={() => navigate("/games")}>
              رجوع للألعاب
            </button>
          </div>
        </div>
      </>
    );
  }

  // افتراضي (لا يحدث)
  return null;
}

/* =========================
   التنسيقات
========================= */

const pageStyle = {
  minHeight: "100dvh",
  background: "#f7f5ff",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "48px 20px 24px",
  boxSizing: "border-box",
  fontFamily: "Cairo, sans-serif"
};

const headerStyle = {
  color: "#6C4CF1",
  fontSize: "36px",
  fontWeight: 900,
  marginBottom: "28px",
  textAlign: "center",
  fontFamily: "Cairo, sans-serif"
};

const cardStyle = {
  width: "100%",
  maxWidth: "520px",
  background: "white",
  borderRadius: "24px",
  padding: "28px",
  textAlign: "center",
  boxShadow: "0 12px 35px rgba(108, 76, 241, 0.12)"
};

const titleStyle = {
  color: "#111",
  fontSize: "28px",
  fontWeight: 900,
  margin: "0 0 18px",
  fontFamily: "Cairo, sans-serif"
};

const textStyle = {
  color: "#666",
  lineHeight: 1.8,
  fontSize: "16px"
};

const rightTextStyle = {
  textAlign: "right",
  direction: "rtl"
};

const smallLabelStyle = {
  margin: 0,
  color: "#6C4CF1",
  fontWeight: 900,
  fontSize: "20px",
  fontFamily: "Cairo, sans-serif"
};

const nameTitleStyle = {
  margin: "6px 0 0",
  color: "#111",
  fontSize: "20px",
  fontWeight: 700,
  fontFamily: "Cairo, sans-serif"
};

const mainButton = {
  width: "100%",
  minHeight: "68px",
  padding: "12px",
  background: "#6C4CF1",
  color: "white",
  border: "none",
  borderRadius: "16px",
  fontSize: "18px",
  fontWeight: 900,
  cursor: "pointer",
  fontFamily: "Cairo, sans-serif",
  marginTop: "12px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  gap: "4px",
  lineHeight: 1.5
};

const share = {
  ...mainButton,
  background: "#14B537",
  color: "white"
};

const secondaryButton = {
  ...mainButton,
  background: "#E6DDF7",
  color: "#6C4CF1"
};

const backButton = {
  ...mainButton,
  background: "#fff0f6",
  color: "#d6336c"
};

const dangerButton = {
  ...mainButton,
  background: "#ff4d6d"
};

const rangeRowStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
  marginTop: "16px"
};

const labelStyle = {
  display: "block",
  color: "#6C4CF1",
  fontWeight: 900,
  marginBottom: "6px",
  textAlign: "right"
};

const inputStyle = {
  width: "100%",
  minHeight: "58px",
  padding: "12px",
  boxSizing: "border-box",
  borderRadius: "16px",
  border: "2px solid #eee",
  fontSize: "18px",
  fontFamily: "Cairo, sans-serif",
  textAlign: "center",
  outline: "none"
};

const explainBoxStyle = {
  background: "#f7f5ff",
  padding: "16px",
  borderRadius: "18px",
  color: "#555",
  lineHeight: 1.8,
  textAlign: "right",
  direction: "rtl"
};

const playerNameStyle = {
  background: "#f7f5ff",
  color: "#6C4CF1",
  padding: "18px",
  borderRadius: "18px",
  fontSize: "28px",
  fontWeight: 900,
  margin: "16px 0",
  textAlign: "center"
};

const turnBoxStyle = {
  background: "#f7f5ff",
  color: "#6C4CF1",
  padding: "14px",
  borderRadius: "16px",
  fontWeight: 900,
  marginBottom: "14px"
};

const codeBoxContainerStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: "10px",
  margin: "20px 0",
  direction: "rtl"
};

const codeInputStyle = {
  width: "100%",
  height: "72px",
  borderRadius: "18px",
  border: "3px solid #6C4CF1",
  textAlign: "center",
  fontSize: "24px",
  fontWeight: 900,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "Cairo, sans-serif",
  background: "#f7f5ff",
  color: "#111",
  direction: "ltr"
};

const resultMessageStyle = {
  background: "#D8F3F1",
  color: "#111",
  padding: "16px",
  borderRadius: "18px",
  fontWeight: 900,
  marginTop: "16px",
  lineHeight: 1.8
};

const attemptsBoxStyle = {
  marginTop: "20px",
  background: "#f7f5ff",
  borderRadius: "18px",
  padding: "16px",
  textAlign: "right",
  direction: "rtl"
};

const attemptsTitleStyle = {
  marginTop: 0,
  color: "#555"
};

const attemptItemStyle = {
  background: "white",
  borderRadius: "14px",
  padding: "12px",
  marginTop: "10px",
  fontSize: "15px",
  lineHeight: 1.7,
  textAlign: "right",
  direction: "rtl"
};

const attemptNumberStyle = {
  color: "#888",
  fontSize: "13px",
  fontWeight: 700
};

const attemptIconStyle = {
  fontSize: "22px",
  marginTop: "4px",
  lineHeight: 1.4
};

const attemptPlayerStyle = {
  color: "#6C4CF1",
  fontWeight: 900,
  marginTop: "4px"
};

const attemptMessageStyle = {
  color: "#111",
  fontWeight: 900,
  marginTop: "4px"
};

const smallTextStyle = {
  color: "#888",
  fontSize: "14px"
};

const guessVisibleStyle = {
  background: "#111827",
  color: "#D8F3F1",
  padding: "16px",
  borderRadius: "18px",
  fontSize: "24px",
  fontWeight: 900,
  letterSpacing: "2px",
  margin: "16px 0",
  direction: "ltr"
};

const winnerIconStyle = {
  fontSize: "52px",
  marginBottom: "10px",
  marginTop: "10px",
  borderRadius: "50%"
};

const summaryBoxStyle = {
  background: "#f7f5ff",
  padding: "16px",
  borderRadius: "18px",
  color: "#555",
  fontWeight: 900,
  margin: "18px 0",
  textAlign: "right",
  direction: "rtl"
};

const secretNumbersStyle = {
  background: "#111827",
  color: "#D8F3F1",
  padding: "20px",
  borderRadius: "18px",
  fontSize: "28px",
  fontWeight: 900,
  letterSpacing: "2px",
  margin: "18px 0",
  direction: "ltr"
};