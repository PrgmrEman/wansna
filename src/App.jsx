// نستورد أدوات تقسيم الصفحات
import { Routes, Route } from "react-router-dom";

// نستورد الصفحات اللي أنشأناها
import Home from "./pages/Home";
import Games from "./pages/Games";
import LockedGame from "./pages/LockedGame";
import SetupPlayers from "./pages/SetupPlayers";
import WhoSaid from "./pages/WhoSaid";
import KnowMe from "./pages/KnowMe";
import ForbiddenWord from "./pages/ForbiddenWord";
import Support from "./pages/Support";


// التطبيق الرئيسي
export default function App() {
  return (
    <Routes>

      {/* الصفحة الرئيسية */}
      <Route path="/" element={<Home />} />

      {/* صفحة اختيار الألعاب */}
      <Route path="/games" element={<Games />} />

      {/* صفحة قفل اللعبة حسب نوع اللعبة */}
      <Route path="/locked/:gameId" element={<LockedGame />} />

      {/* صفحة إعداد اللاعبين */}
      <Route path="/play/:gameId/setup" element={<SetupPlayers />} />

      {/* صفحة "من قالها" */}
      <Route path="/play/who-said" element={<WhoSaid />} />

      {/* صفحة "من يعرفني أكثر" */}
      <Route path="/play/know-me" element={<KnowMe />} />

      {/* صفحة "الكلمة الممنوعة" */}
      <Route path="/play/forbidden-word" element={<ForbiddenWord />} />
      
      {/* صفحة الدعم */}

      <Route path="/support" element={<Support />} />

    </Routes>
  );
}