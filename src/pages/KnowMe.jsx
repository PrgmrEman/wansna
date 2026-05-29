// نستورد useState عشان نخزن البيانات المتغيرة
import { useState } from "react";

// نستورد useNavigate عشان نقدر نرجع لصفحة الألعاب
import { useNavigate } from "react-router-dom";


// دالة خارج المكوّن تخلط ترتيب الخيارات
// وضعناها خارج المكوّن حتى لا تسبب مشاكل purity في React
function shuffleOptions(options) {
  // ننسخ المصفوفة عشان ما نعدل الأصل
  const shuffled = [...options];

  // خلط Fisher-Yates
  for (let i = shuffled.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));

    const temp = shuffled[i];
    shuffled[i] = shuffled[randomIndex];
    shuffled[randomIndex] = temp;
  }

  return shuffled;
}


// دالة تبني خيارات السؤال وتخلطها
function createAnswerOptions(question) {
  return shuffleOptions([
    question.correctAnswer,
    question.wrong1,
    question.wrong2
  ]);
}


// صفحة لعبة مين يعرفني أكثر
export default function KnowMe() {
  // أداة التنقل
  const navigate = useNavigate();

  // قراءة اللاعبين المحفوظين من صفحة إعداد اللاعبين
  const savedPlayers = localStorage.getItem("current-players");

  // تحويل اللاعبين من JSON إلى Array
  const players = savedPlayers ? JSON.parse(savedPlayers) : [];


  /* =========================
      STATES
  ========================= */

  // المرحلة الحالية
  // choose = اختيار اللاعب الأساسي
  // questions = كتابة الأسئلة
  // answering = إجابات اللاعبين
  // prediction = توقع اللاعب الأساسي
  // results = النتائج
  const [phase, setPhase] = useState("choose");

  // اللاعب الأساسي الذي ستكون الجولة عنه
  const [mainPlayer, setMainPlayer] = useState(null);

  // الأسئلة التي يكتبها اللاعب الأساسي
  const [questions, setQuestions] = useState([
    {
      question: "",
      correctAnswer: "",
      wrong1: "",
      wrong2: ""
    }
  ]);

  // اللاعب الحالي الذي يجيب
  const [answeringIndex, setAnsweringIndex] = useState(0);

  // السؤال الحالي
  const [questionIndex, setQuestionIndex] = useState(0);

  // نقاط اللاعبين
  const [scores, setScores] = useState({});

  // شاشة تمرير الجوال
  const [showPassScreen, setShowPassScreen] = useState(true);

  // خيارات السؤال الحالية بعد الخلط
  const [answerOptions, setAnswerOptions] = useState([]);

  // توقع اللاعب الأساسي: مين يعرفه أكثر؟
  const [predictedPlayer, setPredictedPlayer] = useState(null);


  // اللاعبين الذين سيجيبون
  // نستبعد اللاعب الأساسي
  const answerPlayers = players.filter((player) => player !== mainPlayer);


  /* =========================
      اختيار اللاعب الأساسي
  ========================= */

  function chooseRandomPlayer() {
    const randomIndex = Math.floor(Math.random() * players.length);

    const selectedPlayer = players[randomIndex];

    setMainPlayer(selectedPlayer);

    setPhase("questions");
  }


  /* =========================
      تعديل الأسئلة
  ========================= */

  function updateQuestion(index, field, value) {
    const updatedQuestions = [...questions];

    updatedQuestions[index][field] = value;

    setQuestions(updatedQuestions);
  }


  /* =========================
      إضافة سؤال
  ========================= */

  function addQuestion() {
    if (questions.length >= 5) {
      alert("الحد الأقصى 5 أسئلة");
      return;
    }

    setQuestions([
      ...questions,
      {
        question: "",
        correctAnswer: "",
        wrong1: "",
        wrong2: ""
      }
    ]);
  }


  /* =========================
      بدء مرحلة الإجابات
  ========================= */

  function saveQuestions() {
    // تنظيف الأسئلة من الفراغات
    const cleanQuestions = questions.map((item) => ({
      question: item.question.trim(),
      correctAnswer: item.correctAnswer.trim(),
      wrong1: item.wrong1.trim(),
      wrong2: item.wrong2.trim()
    }));

    // أقل شيء 4 أسئلة
    if (cleanQuestions.length < 4) {
      alert("لازم تضيف 4 أسئلة على الأقل");
      return;
    }

    // التأكد أن كل الحقول معبأة
    const hasEmptyField = cleanQuestions.some(
      (item) =>
        item.question === "" ||
        item.correctAnswer === "" ||
        item.wrong1 === "" ||
        item.wrong2 === ""
    );

    if (hasEmptyField) {
      alert("عبّي كل الحقول");
      return;
    }

    // حفظ الأسئلة المنظفة
    setQuestions(cleanQuestions);

    // تجهيز النقاط
    const initialScores = {};

    answerPlayers.forEach((player) => {
      initialScores[player] = 0;
    });

    setScores(initialScores);

    // نبدأ من أول لاعب وأول سؤال
    setAnsweringIndex(0);
    setQuestionIndex(0);

    // نجهز خيارات أول سؤال بترتيب عشوائي
    setAnswerOptions(createAnswerOptions(cleanQuestions[0]));

    // نبدأ مرحلة الإجابات
    setPhase("answering");

    // نعرض شاشة تمرير الجوال
    setShowPassScreen(true);
  }


  /* =========================
      اختيار إجابة
  ========================= */

  function selectAnswer(answer) {
    const currentQuestion = questions[questionIndex];

    const currentPlayer = answerPlayers[answeringIndex];

    const isCorrect = answer === currentQuestion.correctAnswer;

    // إذا الإجابة صحيحة نزيد نقطة
    if (isCorrect) {
      setScores((previousScores) => ({
        ...previousScores,
        [currentPlayer]: previousScores[currentPlayer] + 1
      }));
    }

    // هل يوجد لاعب بعده لنفس السؤال؟
    const hasNextPlayer = answeringIndex < answerPlayers.length - 1;

    if (hasNextPlayer) {
      const nextIndex = answeringIndex + 1;

      setAnsweringIndex(nextIndex);

      // نعيد خلط نفس خيارات السؤال للاعب التالي
      setAnswerOptions(createAnswerOptions(currentQuestion));

      setShowPassScreen(true);
      return;
    }

    // إذا انتهى كل اللاعبين من هذا السؤال
    const hasNextQuestion = questionIndex < questions.length - 1;

    if (hasNextQuestion) {
      const nextQuestionIndex = questionIndex + 1;
      const nextQuestion = questions[nextQuestionIndex];

      setQuestionIndex(nextQuestionIndex);

      // نرجع لأول لاعب
      setAnsweringIndex(0);

      // نجهز خيارات السؤال الجديد بترتيب عشوائي
      setAnswerOptions(createAnswerOptions(nextQuestion));

      setShowPassScreen(true);
      return;
    }

    // إذا انتهت كل الأسئلة ننتقل لمرحلة توقع اللاعب الأساسي
    setPhase("prediction");
    setShowPassScreen(true);
  }


  /* =========================
      توقع اللاعب الأساسي
  ========================= */

  function choosePrediction(player) {
    setPredictedPlayer(player);
    setPhase("results");
  }


  /* =========================
      لا يوجد لاعبين
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
      شاشة اختيار اللاعب الأساسي
  ========================= */

  if (phase === "choose") {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>مين يعرفني أكثر؟ 👀</h1>

          <p style={textStyle}>
            التطبيق بيختار شخص، وهو يكتب أسئلة عن نفسه.
          </p>

          <button style={mainButton} onClick={chooseRandomPlayer}>
            اختيار لاعب عشوائي
          </button>
        </div>
      </div>
    );
  }


  /* =========================
      شاشة كتابة الأسئلة
  ========================= */

  if (phase === "questions") {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h2 style={titleStyle}>مرروا الجوال إلى</h2>

          <h1 style={{ color: "#6C4CF1" }}>{mainPlayer}</h1>

          <p style={textStyle}>
            اكتب 4 أو 5 أسئلة عن نفسك، ومع كل سؤال إجابة صحيحة وخيارين غلط.
          </p>

          {questions.map((item, index) => (
            <div key={index} style={questionCardStyle}>
              <input
                type="text"
                placeholder="السؤال"
                value={item.question}
                onChange={(e) =>
                  updateQuestion(index, "question", e.target.value)
                }
                style={inputStyle}
              />

              <input
                type="text"
                placeholder="الإجابة الصحيحة"
                value={item.correctAnswer}
                onChange={(e) =>
                  updateQuestion(index, "correctAnswer", e.target.value)
                }
                style={inputStyle}
              />

              <input
                type="text"
                placeholder="إجابة غلط 1"
                value={item.wrong1}
                onChange={(e) =>
                  updateQuestion(index, "wrong1", e.target.value)
                }
                style={inputStyle}
              />

              <input
                type="text"
                placeholder="إجابة غلط 2"
                value={item.wrong2}
                onChange={(e) =>
                  updateQuestion(index, "wrong2", e.target.value)
                }
                style={inputStyle}
              />
            </div>
          ))}

          <button style={secondaryButton} onClick={addQuestion}>
            + إضافة سؤال
          </button>

          <button style={mainButton} onClick={saveQuestions}>
            بدء اللعبة
          </button>
        </div>
      </div>
    );
  }


  /* =========================
      شاشة إجابة اللاعبين
  ========================= */

  if (phase === "answering") {
    const currentQuestion = questions[questionIndex];

    const currentPlayer = answerPlayers[answeringIndex];

    return (
      <div style={pageStyle}>
        {showPassScreen && (
          <PassOverlay
            playerName={currentPlayer}
            message="مرروا الجوال إلى"
            buttonText="نعم هذا أنا"
            onConfirm={() => setShowPassScreen(false)}
          />
        )}

        <div style={cardStyle}>
          <p style={textStyle}>
            السؤال {questionIndex + 1} من {questions.length}
          </p>

          <h2 style={titleStyle}>{currentQuestion.question}</h2>

          {answerOptions.map((option) => (
            <button
              key={option}
              style={mainButton}
              onClick={() => selectAnswer(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  }


  /* =========================
      شاشة توقع اللاعب الأساسي
  ========================= */

  if (phase === "prediction") {
    return (
      <div style={pageStyle}>
        {showPassScreen && (
          <PassOverlay
            playerName={mainPlayer}
            message="مرروا الجوال إلى"
            buttonText="جاهز أشوف"
            onConfirm={() => setShowPassScreen(false)}
          />
        )}

        <div style={cardStyle}>
          <h2 style={titleStyle}>مين تتوقع يعرفك أكثر؟ 👀</h2>

          <p style={textStyle}>
            اختار الشخص اللي تتوقع أنه جاوب أكثر إجابات صحيحة عنك.
          </p>

          {answerPlayers.map((player) => (
            <button
              key={player}
              style={mainButton}
              onClick={() => choosePrediction(player)}
            >
              {player}
            </button>
          ))}
        </div>
      </div>
    );
  }


  /* =========================
      شاشة النتائج
  ========================= */

  if (phase === "results") {
    const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);

    const highestScore = Math.max(...sortedScores.map(([, score]) => score));

    const winners = sortedScores
      .filter(([, score]) => score === highestScore)
      .map(([player]) => player);

    const predictionIsCorrect = winners.includes(predictedPlayer);

    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>النتائج 🏆</h1>

          <p style={textStyle}>
            توقع {mainPlayer}: {predictedPlayer}
          </p>

          {predictionIsCorrect ? (
            <p style={{ ...textStyle, color: "#2f9e44", fontWeight: 700 }}>
              توقع صحيح 👀✨
            </p>
          ) : (
            <p style={{ ...textStyle, color: "#d6336c", fontWeight: 700 }}>
              مفاجأة! أكثر شخص يعرفك: {winners.join(" و ")}
            </p>
          )}

          {sortedScores.map(([player, score]) => (
            <div key={player} style={resultItemStyle}>
              {winners.includes(player) && highestScore > 0 ? "👑 " : ""}
              {player} — {score} نقطة
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
    مكون شاشة تمرير الجوال
========================= */

function PassOverlay({ playerName, message, buttonText, onConfirm }) {
  return (
    <div style={overlayStyle}>
      <div style={overlayCardStyle}>
        <h2 style={titleStyle}>{message}</h2>

        <h1>{playerName}</h1>

        <p style={textStyle}>
          لا تفتح الشاشة إلا لما يكون الجوال معه 👀
        </p>

        <button style={mainButton} onClick={onConfirm}>
          {buttonText}
        </button>
      </div>
    </div>
  );
}


/* =========================
    التنسيقات
========================= */

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
  maxWidth: "600px",
  padding: "28px",
  borderRadius: "24px",
  textAlign: "center",
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
};

const titleStyle = {
  color: "#6C4CF1",
  marginTop: 0
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

const secondaryButton = {
  width: "100%",
  marginTop: "14px",
  padding: "14px",
  background: "#eee8ff",
  color: "#6C4CF1",
  border: "none",
  borderRadius: "14px",
  fontSize: "17px",
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "Cairo, sans-serif"
};

const questionCardStyle = {
  background: "#f7f5ff",
  padding: "16px",
  borderRadius: "18px",
  marginTop: "18px"
};

const inputStyle = {
  width: "100%",
  marginTop: "10px",
  padding: "12px",
  borderRadius: "12px",
  border: "1px solid #ddd",
  fontSize: "16px",
  fontFamily: "Cairo, sans-serif",
  boxSizing: "border-box"
};

const resultItemStyle = {
  background: "#f7f5ff",
  padding: "14px",
  borderRadius: "14px",
  marginTop: "10px",
  fontWeight: 700
};

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(20,16,40,0.55)",
  backdropFilter: "blur(8px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "24px",
  zIndex: 100
};

const overlayCardStyle = {
  background: "white",
  width: "100%",
  maxWidth: "420px",
  padding: "28px",
  borderRadius: "24px",
  textAlign: "center"
};