import { useReducer, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

// =========================
//    دوال مساعدة خارج المكوّن
// =========================

/** تخلط ترتيب المصفوفة عشوائياً */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/** تبني خيارات السؤال (الصحيحة + الخاطئتين) وتخلطها */
function createAnswerOptions(question) {
  return shuffleArray([question.correctAnswer, question.wrong1, question.wrong2]);
}

/** تنشئ سؤالاً فارغاً مع معرّف فريد */
function createEmptyQuestion() {
  return {
    id: crypto.randomUUID(),
    question: "",
    correctAnswer: "",
    wrong1: "",
    wrong2: "",
  };
}

/** تختار لاعباً عشوائياً مع إمكانية استبعاد لاعب معيّن */
function getRandomPlayerExcept(players, excludedPlayer) {
  const available = players.filter((p) => p !== excludedPlayer);
  return available[Math.floor(Math.random() * available.length)];
}

// =========================
//     مُخزّن الحالات (Reducer)
// =========================

const initialState = {
  phase: "choose",         // choose | questions | answering | prediction | results
  mainPlayer: null,
  questions: [
    createEmptyQuestion(),
    createEmptyQuestion(),
    createEmptyQuestion(),
  ],
  answeringIndex: 0,
  questionIndex: 0,
  scores: {},
  showPassScreen: true,
  answerOptions: [],
  predictedPlayer: null,
};

function gameReducer(state, action) {
  switch (action.type) {
    case "CHOOSE_MAIN_PLAYER": {
      const main = getRandomPlayerExcept(action.players, null);
      return { ...state, mainPlayer: main, phase: "questions" };
    }

    case "UPDATE_QUESTION": {
      const updated = state.questions.map((q) =>
        q.id === action.id ? { ...q, [action.field]: action.value } : q
      );
      return { ...state, questions: updated };
    }

    case "ADD_QUESTION": {
      if (state.questions.length >= 5) return state; // الحد الأقصى
      return { ...state, questions: [...state.questions, createEmptyQuestion()] };
    }

    case "DELETE_QUESTION": {
      const filtered = state.questions.filter((q) => q.id !== action.id);
      return { ...state, questions: filtered };
    }

    case "START_ANSWERING": {
      const clean = action.questions;
      const initialScores = {};
      action.answerPlayers.forEach((p) => (initialScores[p] = 0));
      return {
        ...state,
        questions: clean,
        scores: initialScores,
        answeringIndex: 0,
        questionIndex: 0,
        answerOptions: createAnswerOptions(clean[0]),
        phase: "answering",
        showPassScreen: true,
      };
    }

    case "SELECT_ANSWER": {
      const { isCorrect, currentPlayer, hasNextPlayer, nextPlayerIndex, hasNextQuestion, nextQuestionIndex, nextQuestion } = action;
      // تحديث النقاط
      const newScores = { ...state.scores };
      if (isCorrect) {
        newScores[currentPlayer] += 1;
      }

      if (hasNextPlayer) {
        // نفس السؤال للاعب التالي (نعيد خلط الخيارات)
        const currentQ = state.questions[state.questionIndex];
        return {
          ...state,
          scores: newScores,
          answeringIndex: nextPlayerIndex,
          answerOptions: createAnswerOptions(currentQ),
          showPassScreen: true,
        };
      }

      if (hasNextQuestion) {
        // السؤال التالي مع أول لاعب
        return {
          ...state,
          scores: newScores,
          questionIndex: nextQuestionIndex,
          answeringIndex: 0,
          answerOptions: createAnswerOptions(nextQuestion),
          showPassScreen: true,
        };
      }

      // انتهت جميع الأسئلة، انتقل للتوقع
      return {
        ...state,
        scores: newScores,
        phase: "prediction",
        showPassScreen: true,
      };
    }

    case "PREDICT": {
      return { ...state, predictedPlayer: action.player, phase: "results" };
    }

    case "HIDE_PASS_SCREEN": {
      return { ...state, showPassScreen: false };
    }

    case "NEW_ROUND": {
      const newMain = getRandomPlayerExcept(action.players, state.mainPlayer);
      const freshQuestions = [
        createEmptyQuestion(),
        createEmptyQuestion(),
        createEmptyQuestion(),
      ];
      return {
        ...initialState,
        questions: freshQuestions,
        mainPlayer: newMain,
        phase: "questions",
      };
    }

    default:
      return state;
  }
}

// =========================
//        المكون الرئيسي
// =========================

export default function KnowMe() {
  const navigate = useNavigate();

  // قراءة اللاعبين مرة واحدة عند التحميل
  const [players] = useState(() => {
    try {
      const saved = localStorage.getItem("current-players");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [state, dispatch] = useReducer(gameReducer, initialState);

  // اللاعبون الذين سيجيبون (باستثناء اللاعب الأساسي)
  const answerPlayers = players.filter((p) => p !== state.mainPlayer);

  // ============ دوال الأحداث ============

  const chooseRandomPlayer = useCallback(() => {
    dispatch({ type: "CHOOSE_MAIN_PLAYER", players });
  }, [players]);

  const updateQuestion = useCallback((id, field, value) => {
    dispatch({ type: "UPDATE_QUESTION", id, field, value });
  }, []);

  const addQuestion = useCallback(() => {
    dispatch({ type: "ADD_QUESTION" });
  }, []);

  const deleteQuestion = useCallback((id) => {
    dispatch({ type: "DELETE_QUESTION", id });
  }, []);

  const saveQuestions = useCallback(() => {
    // تنظيف الأسئلة من الفراغات
    const clean = state.questions.map((q) => ({
      ...q,
      question: q.question.trim(),
      correctAnswer: q.correctAnswer.trim(),
      wrong1: q.wrong1.trim(),
      wrong2: q.wrong2.trim(),
    }));

    if (clean.length < 3) {
      alert("لازم تضيف 3 أسئلة على الأقل");
      return;
    }

    const hasEmpty = clean.some(
      (q) => !q.question || !q.correctAnswer || !q.wrong1 || !q.wrong2
    );
    if (hasEmpty) {
      alert("عبّي كل الحقول");
      return;
    }

    const hasDuplicate = clean.some((q) => {
      const ans = [q.correctAnswer, q.wrong1, q.wrong2];
      return new Set(ans).size !== ans.length;
    });
    if (hasDuplicate) {
      alert("تأكد أن إجابات كل سؤال مختلفة");
      return;
    }

    dispatch({ type: "START_ANSWERING", questions: clean, answerPlayers });
  }, [state.questions, answerPlayers]);

  const selectAnswer = useCallback((answer) => {
    const currentQ = state.questions[state.questionIndex];
    const currentPlayer = answerPlayers[state.answeringIndex];
    const isCorrect = answer === currentQ.correctAnswer;

    const hasNextPlayer = state.answeringIndex < answerPlayers.length - 1;
    const nextPlayerIndex = state.answeringIndex + 1;

    const hasNextQuestion = state.questionIndex < state.questions.length - 1;
    const nextQuestionIndex = state.questionIndex + 1;
    const nextQuestion = hasNextQuestion ? state.questions[nextQuestionIndex] : null;

    dispatch({
      type: "SELECT_ANSWER",
      isCorrect,
      currentPlayer,
      hasNextPlayer,
      nextPlayerIndex,
      hasNextQuestion,
      nextQuestionIndex,
      nextQuestion,
    });
  }, [state, answerPlayers]);

  const choosePrediction = useCallback((player) => {
    dispatch({ type: "PREDICT", player });
  }, []);

  const startAnotherRound = useCallback(() => {
    dispatch({ type: "NEW_ROUND", players });
  }, [players]);

  const hidePassScreen = useCallback(() => {
    dispatch({ type: "HIDE_PASS_SCREEN" });
  }, []);

  // ============ التحقق من عدد اللاعبين ============
  if (players.length < 2) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h2>يلزم على الأقل لاعبَين اثنين للعب</h2>
          <button style={mainButton} onClick={() => navigate("/games")}>
            رجوع للألعاب
          </button>
        </div>
      </div>
    );
  }

  // ============ عرض المرحلة ============

  if (state.phase === "choose") {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>مين يعرفني أكثر؟ 👀</h1>
          <p style={textStyle}>التطبيق بيختار شخص، وهو يكتب أسئلة عن نفسه.</p>
          <button style={mainButton} onClick={chooseRandomPlayer}>
            اختيار لاعب عشوائي
          </button>
        </div>
      </div>
    );
  }

  if (state.phase === "questions") {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h2 style={titleStyle}>مرروا الجوال إلى</h2>
          <h1 style={{ color: "#6C4CF1" }}>{state.mainPlayer}</h1>
          <p style={textStyle}>
            اكتب من 3 إلى 5 أسئلة عن نفسك
            <br />
            ومع كل سؤال إجابة صحيحة واختيارين خاطئين
          </p>

          {state.questions.map((q, index) => (
            <div key={q.id} style={questionCardStyle}>
              <div style={questionHeaderStyle}>
                <strong>السؤال {index + 1}</strong>
                <button
                  onClick={() => deleteQuestion(q.id)}
                  style={deleteButtonStyle}
                >
                  حذف السؤال
                </button>
              </div>

              <input
                type="text"
                placeholder="السؤال"
                value={q.question}
                onChange={(e) => updateQuestion(q.id, "question", e.target.value)}
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="الإجابة الصحيحة"
                value={q.correctAnswer}
                onChange={(e) => updateQuestion(q.id, "correctAnswer", e.target.value)}
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="إجابة خطأ 1"
                value={q.wrong1}
                onChange={(e) => updateQuestion(q.id, "wrong1", e.target.value)}
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="إجابة خطأ 2"
                value={q.wrong2}
                onChange={(e) => updateQuestion(q.id, "wrong2", e.target.value)}
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

  if (state.phase === "answering") {
    const currentQ = state.questions[state.questionIndex];
    const currentPlayer = answerPlayers[state.answeringIndex];

    return (
      <div style={pageStyle}>
        {state.showPassScreen && (
          <PassOverlay
            playerName={currentPlayer}
            message="مرروا الجوال إلى"
            buttonText="نعم هذا أنا"
            onConfirm={hidePassScreen}
          />
        )}

        <div style={cardStyle}>
          <p style={textStyle}>
            السؤال {state.questionIndex + 1} من {state.questions.length}
          </p>
          <p style={textStyle}>
            الدور على: <strong>{currentPlayer}</strong>
          </p>
          <h2 style={titleStyle}>{currentQ.question}</h2>

          {state.answerOptions.map((opt) => (
            <button key={opt} style={mainButton} onClick={() => selectAnswer(opt)}>
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (state.phase === "prediction") {
    return (
      <div style={pageStyle}>
        {state.showPassScreen && (
          <PassOverlay
            playerName={state.mainPlayer}
            message="مرروا الجوال إلى"
            buttonText="جاهز أشوف"
            onConfirm={hidePassScreen}
          />
        )}

        <div style={cardStyle}>
          <h2 style={titleStyle}>مين تتوقع يعرفك أكثر؟ 👀</h2>
          <p style={textStyle}>
            اختار الشخص اللي تتوقع أنه جاوب أكثر إجابات صحيحة عنك.
          </p>
          {answerPlayers.map((p) => (
            <button key={p} style={mainButton} onClick={() => choosePrediction(p)}>
              {p}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (state.phase === "results") {
    const sortedScores = Object.entries(state.scores).sort((a, b) => b[1] - a[1]);
    const highest = sortedScores[0]?.[1] || 0;
    const winners = sortedScores.filter(([, s]) => s === highest).map(([p]) => p);
    const correct = winners.includes(state.predictedPlayer);

    // تصحيح: إزالة القيمة الابتدائية الفارغة حتى لا تظهر غير مستخدمة
    let message; // سيتم تعيينه في جميع الحالات أدناه
    if (correct && winners.length === 1) {
      message = "توقعك صحيح، والله يديم العلاقة الجميلة هذي 💜";
    } else if (correct && winners.length > 1) {
      message = "نقدر نقول إنك خمنت صح 👀 بس واضح إن فيه أكثر من شخص يعرفك كويس! المرة الجاية اكتب أسئلة أدق 😄";
    } else if (!correct && winners.length === 1) {
      message = `مفاجأة! الشخص اللي يعرفك أكثر هو: ${winners[0]} 👀 راجع علاقتك معاه… تراه يستاهل أكثر 💜`;
    } else {
      message = `مفاجأة! فيه أكثر من شخص يعرفك كويس: ${winners.join(" و ")} 👀 مدري أقولك راجع أسئلتك ولا راجع علاقاتك مع الناس 😄`;
    }

    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>النتائج 🏆</h1>
          <p style={textStyle}>
            توقع {state.mainPlayer}: {state.predictedPlayer}
          </p>
          <p style={resultMessageStyle}>{message}</p>

          {sortedScores.map(([p, s]) => (
            <div key={p} style={resultItemStyle}>
              {winners.includes(p) && highest > 0 ? "👑 " : ""}
              {p} — {s} نقطة
            </div>
          ))}

          <button style={mainButton} onClick={startAnotherRound}>
            جولة أخرى
          </button>
          <button style={secondaryButton} onClick={() => navigate("/games")}>
            رجوع للألعاب
          </button>
        </div>
      </div>
    );
  }

  // افتراضي (لا ينبغي الوصول)
  return null;
}

// =========================
//     شاشة تمرير الجوال
// =========================

function PassOverlay({ playerName, message, buttonText, onConfirm }) {
  return (
    <div style={overlayStyle}>
      <div style={overlayCardStyle}>
        <h2 style={titleStyle}>{message}</h2>
        <h1>{playerName}</h1>
        <p style={textStyle}>لا تفتح الشاشة إلا لما يكون الجوال معه 👀</p>
        <button style={mainButton} onClick={onConfirm}>
          {buttonText}
        </button>
      </div>
    </div>
  );
}

// =========================
//       التنسيقات
// =========================

const pageStyle = {
  minHeight: "100dvh",
  background: "#f7f5ff",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "24px",
  boxSizing: "border-box",
  fontFamily: "Cairo, sans-serif",
  direction: "rtl",
};

const cardStyle = {
  background: "white",
  width: "100%",
  maxWidth: "600px",
  padding: "28px",
  borderRadius: "24px",
  textAlign: "center",
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
};

const titleStyle = {
  color: "#6C4CF1",
  marginTop: 0,
};

const textStyle = {
  color: "#777",
  lineHeight: 1.8,
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
  fontFamily: "Cairo, sans-serif",
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
  fontFamily: "Cairo, sans-serif",
};

const questionCardStyle = {
  background: "#f7f5ff",
  padding: "16px",
  borderRadius: "18px",
  marginTop: "18px",
  textAlign: "right",
};

const questionHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  color: "#6C4CF1",
  fontFamily: "Cairo, sans-serif",
};

const deleteButtonStyle = {
  padding: "6px 10px",
  border: "none",
  borderRadius: "10px",
  background: "#ffeff3",
  color: "#d6336c",
  cursor: "pointer",
  fontFamily: "Cairo, sans-serif",
  fontWeight: 700,
};

const inputStyle = {
  width: "100%",
  marginTop: "10px",
  padding: "12px",
  borderRadius: "12px",
  border: "1px solid #ddd",
  fontSize: "16px",
  fontFamily: "Cairo, sans-serif",
  boxSizing: "border-box",
  textAlign: "right",
};

const resultMessageStyle = {
  background: "#f7f5ff",
  color: "#4b3ca7",
  padding: "14px",
  borderRadius: "14px",
  lineHeight: 1.8,
  fontWeight: 700,
  marginTop: "14px",
};

const resultItemStyle = {
  background: "#f7f5ff",
  padding: "14px",
  borderRadius: "14px",
  marginTop: "10px",
  fontWeight: 700,
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
  zIndex: 100,
  direction: "rtl",
};

const overlayCardStyle = {
  background: "white",
  width: "100%",
  maxWidth: "420px",
  padding: "28px",
  borderRadius: "24px",
  textAlign: "center",
};