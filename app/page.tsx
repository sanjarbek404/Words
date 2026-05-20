'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookA, Brain, LayoutDashboard, Plus, Search, Sparkles, X, 
  CheckCircle2, Loader2, Trash2, Library, Play, Volume2, Sun, Moon, Target, Award, TrendingUp
} from 'lucide-react';

interface WordEntry {
  id: string;
  english: string;
  uzbek: string;
  definition: string;
  example: string;
  status: 'new' | 'learning' | 'mastered';
  dateAdded: number;
}

type TabMode = 'dashboard' | 'study' | 'list';

let currentAudio: HTMLAudioElement | null = null;
let currentPlayPromise: Promise<void> | null | undefined = null;

function playAudio(text: string, e?: React.MouseEvent) {
  if (e) {
    e.stopPropagation();
    const btn = e.currentTarget as HTMLElement;
    btn.classList.add('scale-110', 'text-indigo-500');
    setTimeout(() => {
       if (btn) btn.classList.remove('scale-110', 'text-indigo-500');
    }, 400);
  }

  const cleanedText = text.trim();
  if (!cleanedText) return;

  // Oldingi audioni to'xtatish (Abortion warning oldini olib)
  if (currentAudio) {
    if (currentPlayPromise !== undefined) {
       currentPlayPromise?.then(() => {
          currentAudio?.pause();
       }).catch(() => {});
    } else {
       currentAudio.pause();
    }
    currentAudio = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  try {
    // translate.googleapis.com xavfsizroq va tezroq ishlaydi
    const audioUrl = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanedText)}&tl=en&client=gtx`;
    const audio = new Audio(audioUrl);
    currentAudio = audio;
    
    currentPlayPromise = audio.play();
    if (currentPlayPromise !== undefined) {
      currentPlayPromise.catch((err) => {
        if (err.name !== 'AbortError') {
          console.warn("Audio xatoligi kuzatildi (fallback ishga tushdi):", err);
          fallbackTTS(cleanedText);
        }
      });
    }
  } catch (err) {
    fallbackTTS(cleanedText);
  }
}

function fallbackTTS(text: string) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.85; // Yodlash uchun sal sekinroq va aniq o'qish tezligi
    utterance.pitch = 1.0;
    
    // Eng toza inglizcha ovozni topish (agar bo'lsa)
    const voices = window.speechSynthesis.getVoices();
    const engVoice = voices.find(v => v.lang === 'en-US' && v.name.includes('Google')) ||
                     voices.find(v => v.lang.includes('en-US')) ||
                     voices.find(v => v.lang.startsWith('en'));
    
    if (engVoice) {
      utterance.voice = engVoice;
    }
    window.speechSynthesis.speak(utterance);
  }
}

export default function App() {
  const [words, setWords] = useState<WordEntry[]>([]);
  const [activeTab, setActiveTab] = useState<TabMode>('dashboard');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Ovozli o'qish (speechSynthesis) ni brauzer bazasidan erta yuklash uchun
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  // Load initial data and theme
  useEffect(() => {
    const storedTheme = localStorage.getItem('linguamaster_theme');
    if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }

    const storedWords = localStorage.getItem('linguamaster_words');
    if (storedWords) {
      try {
        setWords(JSON.parse(storedWords));
      } catch (e) {
        console.error("Failed to parse words.");
      }
    }
    setIsLoaded(true);
  }, []);

  // Save words on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('linguamaster_words', JSON.stringify(words));
    }
  }, [words, isLoaded]);

  const toggleTheme = () => {
    const newT = theme === 'light' ? 'dark' : 'light';
    setTheme(newT);
    localStorage.setItem('linguamaster_theme', newT);
    if (newT === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const addWord = (entry: Omit<WordEntry, 'id' | 'status' | 'dateAdded'>) => {
    const newWord: WordEntry = {
      ...entry,
      id: crypto.randomUUID(),
      status: 'new',
      dateAdded: Date.now()
    };
    setWords(prev => [newWord, ...prev]);
    setIsAddMode(false);
  };

  const deleteWord = (id: string) => {
    setWords(prev => prev.filter(w => w.id !== id));
  };

  const updateWordStatus = (id: string, status: WordEntry['status']) => {
    setWords(prev => prev.map(w => w.id === id ? { ...w, status } : w));
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" />
        <p className="font-display font-medium text-gray-500 dark:text-gray-400 animate-pulse">Lug'at yuklanmoqda...</p>
      </div>
    );
  }

  const pageVariants: any = {
    initial: { opacity: 0, y: 15, scale: 0.98 },
    enter: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, y: -15, scale: 0.98, transition: { duration: 0.3, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen flex flex-col relative w-full h-full transition-colors duration-300">
      {/* Top NavBar */}
      <nav className="fixed top-0 left-0 right-0 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg z-40 transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-display font-bold text-xl cursor-default group">
            <motion.div whileHover={{ rotate: 15 }} transition={{ type: 'spring' }}>
              <Brain className="w-6 h-6" />
            </motion.div>
            <span>Lingua<span className="text-gray-900 dark:text-gray-100 transition-colors">Master</span></span>
          </div>
          
          <div className="hidden md:flex bg-gray-50/80 dark:bg-gray-900/80 p-1.5 rounded-full border border-gray-200 dark:border-gray-800 transition-colors">
            <NavTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button 
              onClick={() => setIsAddMode(true)}
              className="flex items-center justify-center gap-1.5 bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-full font-medium text-sm hover:bg-indigo-700 dark:hover:bg-indigo-600 transition shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">So'z qo'shish</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={pageVariants}
            initial="initial"
            animate="enter"
            exit="exit"
            className="h-full"
          >
            {activeTab === 'dashboard' && <Dashboard words={words} onNavigate={setActiveTab} />}
            {activeTab === 'study' && <Flashcards words={words} onUpdateStatus={updateWordStatus} />}
            {activeTab === 'list' && <WordList words={words} onDelete={deleteWord} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-6 left-4 right-4 z-40">
        <div className="bg-gray-900 dark:bg-gray-800 shadow-2xl p-2 rounded-3xl flex justify-between items-center px-4 max-w-sm mx-auto shadow-indigo-900/20 dark:shadow-black/40 border border-gray-800 dark:border-gray-700 transition-colors duration-300">
             <TabButton icon={<LayoutDashboard />} label="Asosiy" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
             <TabButton icon={<Play />} label="Yodlash" active={activeTab === 'study'} onClick={() => setActiveTab('study')} />
             <TabButton icon={<Library />} label="Lug'at" active={activeTab === 'list'} onClick={() => setActiveTab('list')} />
        </div>
      </nav>

      {/* Add Word Modal */}
      <AnimatePresence>
        {isAddMode && <AddWordModal onClose={() => setIsAddMode(false)} onAdd={addWord} />}
      </AnimatePresence>
    </div>
  );
}


/* -------------------------------------------------------------------------- */
/* Navigation Components                                                       */
/* -------------------------------------------------------------------------- */

function NavTabs({ activeTab, setActiveTab }: { activeTab: TabMode, setActiveTab: (t: TabMode) => void }) {
  const tabs: {id: TabMode, label: string, icon: any}[] = [
    { id: 'dashboard', label: "Asosiy", icon: <LayoutDashboard className="w-4 h-4 mr-2" /> },
    { id: 'study', label: "Yodlash", icon: <Play className="w-4 h-4 mr-2" /> },
    { id: 'list', label: "Lug'at", icon: <BookA className="w-4 h-4 mr-2" /> },
  ];

  return (
    <>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`relative px-4 py-2 text-sm font-medium rounded-full flex items-center transition-colors ${activeTab === tab.id ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}
        >
          {activeTab === tab.id && (
            <motion.div layoutId="nav-pill" className="absolute inset-0 bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-full" />
          )}
          <span className="relative z-10 flex items-center">
            {tab.icon}
            {tab.label}
          </span>
        </button>
      ))}
    </>
  );
}

function TabButton({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-16 h-12 rounded-2xl transition-all ${
        active ? 'text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-300 dark:hover:text-gray-200'
      }`}
    >
      <div className={`${active ? 'scale-110 mb-1' : 'scale-100 mb-0.5'} transition-transform`}>
        {React.cloneElement(icon as any, { className: 'w-5 h-5' })}
      </div>
      <span className="text-[10px] font-medium font-sans">{label}</span>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Dashboard View                                                              */
/* -------------------------------------------------------------------------- */
function Dashboard({ words, onNavigate }: { words: WordEntry[], onNavigate: (t: TabMode) => void }) {
  const mastered = words.filter(w => w.status === 'mastered').length;
  const learning = words.filter(w => w.status === 'learning').length;
  const total = words.length;
  const progressPercent = total > 0 ? Math.round((mastered / total) * 100) : 0;

  const recentWords = words.slice(0, 4);

  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVars = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div variants={containerVars} initial="hidden" animate="show" className="space-y-8">
      
      {/* Hero Welcome */}
      <motion.section variants={itemVars} className="bg-indigo-600 dark:bg-indigo-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl shadow-indigo-600/20 dark:shadow-indigo-900/20 relative overflow-hidden transition-colors duration-300">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" 
        />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold mb-3 tracking-tight">Xush kelibsiz! 👋</h1>
            <p className="text-indigo-100 dark:text-indigo-200 text-lg max-w-md leading-relaxed">Har kuni yangi so'zlarni muntazam o'rganib, ingliz tili darajangizni mukammallashtiring.</p>
            
            <button 
              onClick={() => onNavigate('study')}
              className="mt-8 bg-white dark:bg-gray-900 text-indigo-700 dark:text-indigo-300 px-6 py-3 rounded-full font-bold shadow-md hover:bg-gray-50 dark:hover:bg-black transition active:scale-95 flex items-center gap-2 group"
            >
              <Play className="w-5 h-5 fill-indigo-700 dark:fill-indigo-300 group-hover:scale-110 transition-transform" />
              Mashqni boshlash
            </button>
          </div>
          
          {/* Progress Circle Visual */}
          <div className="hidden sm:flex flex-col items-center justify-center bg-white/10 dark:bg-black/20 p-6 rounded-3xl backdrop-blur-sm border border-white/20 dark:border-white/5">
             <Target className="w-8 h-8 text-indigo-200 mb-2" />
             <div className="text-4xl font-display font-bold">{progressPercent}%</div>
             <div className="text-sm font-medium text-indigo-200 tracking-wider">O'ZLASHTIRISH</div>
          </div>
        </div>
      </motion.section>

      {/* Stats Grid */}
      <motion.section variants={itemVars} className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard delay={0.1} icon={<Library />} label="Jami so'zlar" value={total} colorClass="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10" />
        <StatCard delay={0.2} icon={<CheckCircle2 />} label="Yodlangan" value={mastered} colorClass="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10" />
        <StatCard delay={0.3} icon={<Brain />} label="O'rganilmoqda" value={learning} colorClass="text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10" className="col-span-2 md:col-span-1" />
      </motion.section>

      {/* Progress & Recent Actions Split */}
      <div className="grid md:grid-cols-2 gap-8 items-start">
        
        {/* Progress Tracker */}
        <motion.section variants={itemVars} className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-display font-bold text-gray-900 dark:text-gray-100">Umumiy taraqqiyot</h2>
          </div>
          
          <div className="mb-2 flex justify-between items-end">
             <span className="text-sm font-bold text-gray-500 dark:text-gray-400">YODLANISH DARAJASI</span>
             <span className="text-2xl font-display font-black text-indigo-600 dark:text-indigo-400">{progressPercent}%</span>
          </div>
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden w-full transition-colors duration-300">
             <motion.div 
               initial={{ width: 0 }} 
               animate={{ width: `${progressPercent}%` }} 
               transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
               className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 dark:from-indigo-600 dark:to-indigo-500 rounded-full"
             />
          </div>
          <div className="mt-6 flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 transition-colors">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-emerald-500" />
              <div>
                <div className="text-sm font-bold text-gray-900 dark:text-gray-100">Maqsad sari qadamlar</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Yana {learning} ta so'z kutmoqda</div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Recent Activity Mini-list */}
        {recentWords.length > 0 && (
          <motion.section variants={itemVars}>
            <div className="flex justify-between items-end mb-4 px-2">
              <h2 className="text-xl font-display font-bold text-gray-900 dark:text-gray-100">Oxirgi qo'shilganlar</h2>
              <button 
                onClick={() => onNavigate('list')} 
                className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
               >
                Barchasi →
              </button>
            </div>
            
            <div className="grid gap-3">
              {recentWords.map((w, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  key={w.id} 
                  className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-sm hover:border-indigo-100 dark:hover:border-indigo-500/30 transition group cursor-pointer"
                  onClick={() => playAudio(w.english)}
                >
                   <div>
                     <div className="flex items-center gap-2 mb-0.5">
                       <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{w.english}</h4>
                       <Volume2 className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
                     </div>
                     <span className="text-sm text-gray-500 dark:text-gray-400">{w.uzbek}</span>
                   </div>
                   <WordStatusBadge status={w.status} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>

    </motion.div>
  );
}

function StatCard({ icon, label, value, colorClass, className = "", delay }: any) {
  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center text-center justify-center transition-colors duration-300 ${className}`}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${colorClass}`}>
        {React.cloneElement(icon, { className: 'w-6 h-6' })}
      </div>
      <p className="text-3xl font-display font-extrabold text-gray-900 dark:text-gray-100">{value}</p>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{label}</p>
    </motion.div>
  );
}


/* -------------------------------------------------------------------------- */
/* Flashcards View                                                             */
/* -------------------------------------------------------------------------- */
function Flashcards({ words, onUpdateStatus }: { words: WordEntry[], onUpdateStatus: (id: string, s: WordEntry['status']) => void }) {
  const activeWords = words.filter(w => w.status !== 'mastered');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // If no words available to study
  if (words.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-300 h-[60vh]">
        <Library className="w-16 h-16 text-gray-200 dark:text-gray-700 mb-4" />
        <h2 className="text-2xl font-display font-bold text-gray-800 dark:text-gray-100 mb-2">Lug'atingiz bo'sh</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6 px-4">Yodlashni boshlash uchun dastlab yangi so'zlarni qo'shing.</p>
      </div>
    );
  }

  if (activeWords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-emerald-100 dark:border-emerald-500/20 shadow-sm transition-colors duration-300 h-[60vh]">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}>
          <CheckCircle2 className="w-20 h-20 text-emerald-500 dark:text-emerald-400 mb-4" />
        </motion.div>
        <h2 className="text-3xl font-display font-bold text-gray-800 dark:text-gray-100 mb-2">Barakalla!</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm px-4">Hozircha barcha so'zlarni yodlab bo'ldingiz. Yangi so'zlar qo'shib, davom eting.</p>
      </div>
    );
  }

  const actEntry = activeWords[currentIndex % activeWords.length];

  const handleNext = (status: WordEntry['status']) => {
    onUpdateStatus(actEntry.id, status);
    setFlipped(false);
    setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
  };

  return (
    <div className="flex flex-col items-center mt-4 sm:mt-8 w-full min-h-[70vh]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-1.5 rounded-full mb-8 tracking-wide flex items-center gap-2 border border-indigo-100 dark:border-indigo-500/20"
      >
        <Brain className="w-4 h-4" />
        SO'Z YODLASH MASHG'ULOTI
      </motion.div>
      
      {/* 3D Flashcard Container */}
      <div 
        className="relative w-full max-w-md h-96 cursor-pointer perspective-1000" 
        style={{ perspective: "1500px" }}
        onClick={() => setFlipped(!flipped)}
      >
        <motion.div
          className="w-full h-full relative"
          initial={false}
          animate={{ rotateY: flipped ? 180 : 0, scale: flipped ? 1 : 1.02 }}
          whileHover={{ scale: flipped ? 1 : 1.05 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 220, damping: 20 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* FRONT */}
          <div 
            className="absolute inset-0 bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-2xl shadow-gray-200/50 dark:shadow-black/50 flex flex-col items-center justify-center p-8 text-center transition-colors duration-300"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(0deg)' }}
          >
            <button 
               onClick={(e) => playAudio(actEntry.english, e)}
               className="absolute top-6 right-6 p-3 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full transition-colors active:scale-90"
            >
               <Volume2 className="w-6 h-6" />
            </button>

            <h2 className="text-5xl font-display font-extrabold text-gray-900 dark:text-gray-100 mb-6 drop-shadow-sm">{actEntry.english}</h2>
            <div className="mt-8 px-5 py-2 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 font-bold text-xs rounded-full uppercase tracking-widest border border-gray-100 dark:border-gray-700 transition-colors">
              O'girish uchun bosing
            </div>
          </div>

          {/* BACK */}
          <div 
            className="absolute inset-0 bg-indigo-600 dark:bg-indigo-700 rounded-[2rem] flex flex-col justify-center items-center p-8 text-center text-white shadow-2xl shadow-indigo-600/30 overflow-hidden"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
             <div className="w-full h-full flex flex-col justify-center overflow-y-auto custom-scrollbar">
                <h2 className="text-4xl font-display font-bold mb-6 text-white">{actEntry.uzbek}</h2>
                
                <div className="w-full h-px bg-white/20 mb-6 shrink-0"></div>
                
                <div className="space-y-6 text-left w-full">
                  <div>
                    <span className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest block mb-2 opacity-80">QISQACHA MA'NO</span>
                    <p className="text-xl text-indigo-50 leading-snug font-medium">{actEntry.definition}</p>
                  </div>
                  
                  {actEntry.example && (
                    <div>
                      <span className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest block mb-2 opacity-80">MISOL</span>
                      <p className="text-lg text-indigo-50 italic opacity-95">"{actEntry.example}"</p>
                    </div>
                  )}
                </div>
             </div>
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="h-24 w-full flex justify-center items-center mt-6">
        <AnimatePresence>
          {flipped && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="flex gap-4 w-full max-w-md px-2"
            >
              <button 
                onClick={(e) => { e.stopPropagation(); handleNext('learning'); }}
                className="flex-1 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20 py-4 rounded-2xl font-bold text-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition active:scale-95 shadow-sm flex items-center justify-center gap-2"
              >
                <span>Xato</span> 🔴
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleNext('mastered'); }}
                className="flex-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 py-4 rounded-2xl font-bold text-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition active:scale-95 shadow-sm flex items-center justify-center gap-2"
              >
                <span>Oson</span> 🟢
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


/* -------------------------------------------------------------------------- */
/* Word List View                                                              */
/* -------------------------------------------------------------------------- */
function WordList({ words, onDelete }: { words: WordEntry[], onDelete: (id: string) => void }) {
  const [search, setSearch] = useState("");

  const filtered = words.filter(w => 
    w.english.toLowerCase().includes(search.toLowerCase()) || 
    w.uzbek.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Search Header */}
      <div className="bg-white dark:bg-gray-900 p-2 rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center shadow-sm relative sticky top-[88px] z-20 transition-colors duration-300">
         <Search className="w-5 h-5 text-gray-400 dark:text-gray-500 ml-3 shrink-0" />
         <input 
            type="text" 
            placeholder="So'z izlash..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent p-3 outline-none text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 font-medium"
         />
         {search && (
            <button onClick={() => setSearch("")} className="mr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
               <X className="w-5 h-5" />
            </button>
         )}
      </div>

      <motion.div layout className="space-y-3 pb-8">
         <AnimatePresence>
           {filtered.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-16 text-gray-400 dark:text-gray-500 flex flex-col items-center justify-center"
              >
                <Search className="w-12 h-12 mb-4 opacity-30" />
                Hech qanday so'z topilmadi.
              </motion.div>
           ) : (
             filtered.map((w, index) => (
               <motion.div 
                 layout
                 key={w.id} 
                 initial={{ opacity: 0, y: 15 }}
                 animate={{ opacity: 1, y: 0, transition: { delay: index < 10 ? index * 0.05 : 0 } }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="group bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-500/40 transition-colors duration-300"
               >
                  <div className="flex-1">
                     <div className="flex items-center gap-3 mb-1.5">
                       <h3 className="text-xl font-bold font-display text-gray-900 dark:text-gray-100">{w.english}</h3>
                       <button onClick={(e) => playAudio(w.english, e)} className="p-1 rounded-full text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors">
                         <Volume2 className="w-4 h-4" />
                       </button>
                       <WordStatusBadge status={w.status} />
                     </div>
                     <p className="text-gray-600 dark:text-gray-300 font-medium text-lg">{w.uzbek}</p>
                     
                     {(w.definition || w.example) && (
                       <div className="mt-4 text-sm border-l-2 border-indigo-100 dark:border-indigo-500/30 pl-4 space-y-1">
                         {w.definition && <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{w.definition}</p>}
                         {w.example && <p className="text-gray-400 dark:text-gray-500 italic">"{w.example}"</p>}
                       </div>
                     )}
                  </div>
                  
                  <button 
                    onClick={() => onDelete(w.id)}
                    className="shrink-0 p-3 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors self-end sm:self-center"
                    aria-label="Delete word"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
               </motion.div>
             ))
           )}
         </AnimatePresence>
      </motion.div>
    </div>
  );
}

function WordStatusBadge({ status }: { status: WordEntry['status'] }) {
  if (status === 'mastered') {
    return <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider border border-emerald-100 dark:border-emerald-500/20">Yodlangan</span>;
  }
  if (status === 'learning') {
    return <span className="bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider border border-orange-100 dark:border-orange-500/20">Jarayonda</span>;
  }
  return <span className="bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider border border-blue-100 dark:border-blue-500/20">Yangi</span>;
}


/* -------------------------------------------------------------------------- */
/* Add Word Modal                                                              */
/* -------------------------------------------------------------------------- */
function AddWordModal({ onClose, onAdd }: { onClose: () => void, onAdd: (data: any) => void }) {
  const [data, setData] = useState({ english: "", uzbek: "", definition: "", example: "" });
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  
  const handleAIFetch = async () => {
    if (!data.english.trim()) return;
    setIsLoadingAI(true);
    try {
      const resp = await fetch('/api/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: data.english.trim() })
      });
      
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || "Xatolik");
      
      setData(prev => ({
        ...prev,
        uzbek: json.uzbek || prev.uzbek,
        definition: json.definition || '',
        example: json.example || ''
      }));
    } catch (err: any) {
      alert("AI ulanishida xatolik: " + err.message);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.english.trim() || !data.uzbek.trim()) return;
    onAdd(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-gray-900/60 dark:bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 100 }}
        animate={{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } }}
        exit={{ opacity: 0, scale: 0.95, y: 100, transition: { duration: 0.2 } }}
        className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-gray-100 dark:border-gray-800"
      >
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
          <h2 className="text-xl font-display font-bold text-gray-900 dark:text-gray-100">Yangi so'z qo'shish</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-1">
           <form id="add-word-form" onSubmit={submit} className="space-y-6">
             
             {/* English Field + AI Action */}
             <div>
               <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2.5">Ingliz tilida</label>
               <input 
                 autoFocus
                 type="text" 
                 required
                 value={data.english}
                 onChange={e => setData({...data, english: e.target.value})}
                 className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3.5 outline-none focus:bg-white dark:focus:bg-gray-900 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-4 ring-indigo-50 dark:ring-indigo-500/10 transition text-lg font-bold text-gray-900 dark:text-gray-100 placeholder:font-normal placeholder:text-gray-400 dark:placeholder:text-gray-600"
                 placeholder="Masalan: Serendipity"
               />
               
               <button 
                  type="button"
                  onClick={handleAIFetch}
                  disabled={isLoadingAI || !data.english.trim()}
                  className="mt-3 w-full py-3 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-500/10 dark:to-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400 font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 disabled:opacity-50 transition active:scale-95"
               >
                 {isLoadingAI ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />}
                 AI orqali izoh va tarjimani yaratish
               </button>
             </div>

             <div className="h-px bg-gray-100 dark:bg-gray-800 w-full" />

             {/* Uzbek Field */}
             <div>
               <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2.5">O'zbekcha tarjimasi</label>
               <input 
                 type="text" 
                 required
                 value={data.uzbek}
                 onChange={e => setData({...data, uzbek: e.target.value})}
                 className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3.5 outline-none focus:bg-white dark:focus:bg-gray-900 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-4 ring-indigo-50 dark:ring-indigo-500/10 transition text-lg font-bold text-gray-900 dark:text-gray-100 placeholder:font-normal placeholder:text-gray-400 dark:placeholder:text-gray-600"
                 placeholder="Tarjimani kiriting"
               />
             </div>

             {/* Definition */}
             <div>
               <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2.5">Inglizcha izoh (ixtiyoriy)</label>
               <textarea 
                 rows={2}
                 value={data.definition}
                 onChange={e => setData({...data, definition: e.target.value})}
                 className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:bg-white dark:focus:bg-gray-900 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-4 ring-indigo-50 dark:ring-indigo-500/10 transition resize-none text-gray-900 dark:text-gray-100 leading-relaxed placeholder:text-gray-400 dark:placeholder:text-gray-600"
                 placeholder="An aptitude for making desirable discoveries by accident."
               />
             </div>

             {/* Example */}
             <div>
               <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2.5">Misol (ixtiyoriy)</label>
               <textarea 
                 rows={2}
                 value={data.example}
                 onChange={e => setData({...data, example: e.target.value})}
                 className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:bg-white dark:focus:bg-gray-900 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-4 ring-indigo-50 dark:ring-indigo-500/10 transition resize-none text-gray-900 dark:text-gray-100 leading-relaxed placeholder:text-gray-400 dark:placeholder:text-gray-600"
                 placeholder="Finding the rare book was an act of pure serendipity."
               />
             </div>

           </form>
        </div>
        
        <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
           <button 
             form="add-word-form"
             type="submit"
             disabled={!data.english || !data.uzbek}
             className="w-full bg-indigo-600 dark:bg-indigo-500 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 transition active:scale-[0.98] disabled:opacity-50 shadow-md"
           >
             Lug'atga saqlash
           </button>
        </div>
      </motion.div>
    </div>
  );
}
