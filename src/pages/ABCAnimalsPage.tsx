import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useRef, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";
import { playClickSound } from "@/lib/sounds";
import { dispatchCharacterEvent } from "@/lib/characterStore";
import ClassroomBackground from "@/components/ClassroomBackground";
import BackToLevels from "@/components/BackToLevels";
import Interactive3DMascot from "@/components/Interactive3DMascot";
import AnimatedSection from "@/components/AnimatedSection";
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Music, Sparkles } from "lucide-react";

/* ─── ABC Animals data from the video ─── */
const abcAnimals = [
  { letter: "A", animal: "Alligator", emoji: "🐊", sound: "Chomp! Chomp!", color: "142 60% 42%" },
  { letter: "B", animal: "Bear", emoji: "🐻", sound: "Stomp! Stomp!", color: "25 60% 45%" },
  { letter: "C", animal: "Cat", emoji: "🐱", sound: "Purrrr~", color: "265 55% 58%" },
  { letter: "D", animal: "Dog", emoji: "🐶", sound: "Woof! Woof!", color: "25 95% 53%" },
  { letter: "E", animal: "Elephant", emoji: "🐘", sound: "Toot! Toot!", color: "220 15% 55%" },
  { letter: "F", animal: "Fox", emoji: "🦊", sound: "Sly & Fast!", color: "25 90% 50%" },
  { letter: "G", animal: "Giraffe", emoji: "🦒", sound: "Reaching high!", color: "45 100% 55%" },
  { letter: "H", animal: "Hippo", emoji: "🦛", sound: "Big & round!", color: "265 30% 55%" },
  { letter: "I", animal: "Iguana", emoji: "🦎", sound: "Crawling low!", color: "142 50% 50%" },
  { letter: "J", animal: "Jaguar", emoji: "🐆", sound: "Zooming past!", color: "45 80% 45%" },
  { letter: "K", animal: "Kangaroo", emoji: "🦘", sound: "Hop! Hop!", color: "25 70% 50%" },
  { letter: "L", animal: "Lion", emoji: "🦁", sound: "ROAR!", color: "35 90% 50%" },
  { letter: "M", animal: "Monkey", emoji: "🐒", sound: "Swing swing!", color: "25 60% 40%" },
  { letter: "N", animal: "Newt", emoji: "🦎", sound: "Crawling~", color: "142 45% 45%" },
  { letter: "O", animal: "Owl", emoji: "🦉", sound: "Hoo hoo!", color: "25 40% 45%" },
  { letter: "P", animal: "Penguin", emoji: "🐧", sound: "Skate skate!", color: "210 70% 52%" },
  { letter: "Q", animal: "Quail", emoji: "🐦", sound: "Tweet tweet!", color: "330 55% 55%" },
  { letter: "R", animal: "Rabbit", emoji: "🐰", sound: "Bounce bounce!", color: "330 75% 55%" },
  { letter: "S", animal: "Snake", emoji: "🐍", sound: "Ssssss!", color: "142 60% 40%" },
  { letter: "T", animal: "Tiger", emoji: "🐯", sound: "ROAR!", color: "25 90% 50%" },
  { letter: "U", animal: "Unicorn", emoji: "🦄", sound: "✨ Magic!", color: "265 70% 60%" },
  { letter: "V", animal: "Vulture", emoji: "🦅", sound: "Soaring high!", color: "25 30% 40%" },
  { letter: "W", animal: "Whale", emoji: "🐋", sound: "Splash!", color: "210 70% 55%" },
  { letter: "X", animal: "X-ray Fish", emoji: "🐠", sound: "Swim swim!", color: "180 60% 50%" },
  { letter: "Y", animal: "Yak", emoji: "🐂", sound: "Moo~", color: "25 40% 40%" },
  { letter: "Z", animal: "Zebra", emoji: "🦓", sound: "Gallop!", color: "0 0% 30%" },
];

/* ─── Animal Card ─── */
const AnimalCard = ({ item, index, isActive, onClick }: {
  item: typeof abcAnimals[0]; index: number; isActive: boolean; onClick: () => void;
}) => (
  <motion.button
    initial={{ opacity: 0, scale: 0.7, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ delay: index * 0.03, type: "spring", stiffness: 200, damping: 15 }}
    whileHover={{ scale: 1.08, y: -4 }}
    whileTap={{ scale: 0.92 }}
    onClick={onClick}
    className={`relative rounded-2xl p-3 sm:p-4 text-center transition-all duration-300 cursor-pointer group ${isActive ? "ring-3 ring-primary shadow-lg" : ""}`}
    style={{
      background: isActive
        ? `linear-gradient(135deg, hsl(${item.color} / 0.25), hsl(${item.color} / 0.1))`
        : "hsl(var(--card) / 0.9)",
      border: `2px solid hsl(${item.color} / ${isActive ? 0.5 : 0.15})`,
      boxShadow: isActive ? `0 8px 25px hsl(${item.color} / 0.2)` : "var(--shadow-card)",
    }}
  >
    {/* Letter */}
    <motion.div
      className="font-display font-extrabold text-2xl sm:text-3xl leading-none mb-1"
      style={{ color: `hsl(${item.color})` }}
      animate={isActive ? { scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] } : {}}
      transition={{ duration: 0.6, repeat: isActive ? Infinity : 0, repeatDelay: 1 }}
    >
      {item.letter}
    </motion.div>

    {/* Emoji */}
    <motion.div
      className="text-3xl sm:text-4xl mb-1"
      animate={isActive ? { y: [0, -6, 0] } : {}}
      transition={{ duration: 0.8, repeat: isActive ? Infinity : 0, repeatDelay: 0.5 }}
    >
      {item.emoji}
    </motion.div>

    {/* Name */}
    <p className="font-display font-bold text-[10px] sm:text-xs text-foreground truncate">
      {item.animal}
    </p>

    {/* Sound bubble on active */}
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.5 }}
          animate={{ opacity: 1, y: -8, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-full text-[10px] font-display font-bold"
          style={{
            background: `hsl(${item.color})`,
            color: "white",
            textShadow: "0 1px 2px rgba(0,0,0,0.3)",
          }}
        >
          {item.sound}
        </motion.div>
      )}
    </AnimatePresence>
  </motion.button>
);

/* ─── Video Player Section ─── */
const VideoPlayer = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const { lang } = useLanguage();

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
    playClickSound();
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const restart = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setIsPlaying(true);
    playClickSound();
  }, []);

  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        border: "3px solid hsl(var(--primary) / 0.2)",
        boxShadow: "0 8px 30px hsl(var(--primary) / 0.1)",
      }}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src="/videos/abc-animals-song.mp4"
        className="w-full aspect-video object-cover"
        playsInline
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Play overlay when paused */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            style={{ background: "hsl(0 0% 0% / 0.35)" }}
            onClick={togglePlay}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center gradient-primary shadow-lg"
            >
              <Play className="w-8 h-8 text-primary-foreground ml-1" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div
        className="absolute bottom-0 inset-x-0 flex items-center gap-2 px-3 py-2"
        style={{ background: "linear-gradient(transparent, hsl(0 0% 0% / 0.6))" }}
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={togglePlay}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: "hsl(var(--primary) / 0.8)" }}
        >
          {isPlaying ? <Pause className="w-4 h-4 text-primary-foreground" /> : <Play className="w-4 h-4 text-primary-foreground ml-0.5" />}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={restart}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: "hsl(0 0% 100% / 0.15)" }}
        >
          <SkipBack className="w-4 h-4 text-white" />
        </motion.button>
        <div className="flex-1" />
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleMute}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: "hsl(0 0% 100% / 0.15)" }}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
        </motion.button>
      </div>
    </div>
  );
};

/* ─── Main Page ─── */
const ABCAnimalsPage = () => {
  const { t, dir, lang } = useLanguage();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    dispatchCharacterEvent({ type: "wave", payload: { message: lang === "he" ? "!בואו נשיר ABC עם חיות" : "Let's sing ABC with animals! 🎵" } });
  }, [lang]);

  const handleCardClick = useCallback((index: number) => {
    setActiveIndex(index);
    playClickSound();
    const animal = abcAnimals[index];
    dispatchCharacterEvent({
      type: "talk",
      payload: { message: `${animal.letter} is for ${animal.animal} ${animal.emoji}`, duration: 2500 },
    });
  }, []);

  return (
    <div className="min-h-screen relative" dir={dir}>
      <ClassroomBackground />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 relative z-10">
        <BackToLevels />

        {/* Title */}
        <AnimatedSection className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Interactive3DMascot mood="celebrate" size="sm" />
            <div>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-gradient">
                {lang === "he" ? "שיר ABC עם חיות" : lang === "ar" ? "أغنية ABC مع الحيوانات" : "ABC Animals Song"} 🎵
              </h1>
              <p className="font-display text-sm text-muted-foreground mt-1">
                {lang === "he" ? "!למדו את האלפבית עם חיות מהנות" : lang === "ar" ? "!تعلّم الأبجدية مع حيوانات ممتعة" : "Learn the alphabet with fun animals!"}
              </p>
            </div>
          </div>
        </AnimatedSection>

        {/* Video Player */}
        <AnimatedSection className="max-w-2xl mx-auto mb-8 sm:mb-10" delay={0.1}>
          <div
            className="rounded-2xl p-1"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--accent) / 0.15))",
            }}
          >
            <VideoPlayer />
          </div>
          <p className="text-center text-xs text-muted-foreground mt-2 font-display">
            <Music className="w-3 h-3 inline-block mr-1" />
            {lang === "he" ? "לחצו ▶ כדי לשמוע את השיר" : "Press ▶ to play the song"}
          </p>
        </AnimatedSection>

        {/* ABC Animals Grid */}
        <AnimatedSection delay={0.15}>
          <div className="text-center mb-4">
            <h2 className="font-display font-bold text-lg sm:text-xl text-foreground flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {lang === "he" ? "לחצו על חיה כדי ללמוד" : lang === "ar" ? "اضغط على حيوان للتعلم" : "Tap an animal to learn!"}
            </h2>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-2 sm:gap-3">
            {abcAnimals.map((item, i) => (
              <AnimalCard
                key={item.letter}
                item={item}
                index={i}
                isActive={activeIndex === i}
                onClick={() => handleCardClick(i)}
              />
            ))}
          </div>
        </AnimatedSection>

        {/* Active animal detail */}
        <AnimatePresence>
          {activeIndex !== null && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              className="max-w-md mx-auto mt-6 rounded-2xl p-6 text-center"
              style={{
                background: `linear-gradient(135deg, hsl(${abcAnimals[activeIndex].color} / 0.12), hsl(var(--card)))`,
                border: `2px solid hsl(${abcAnimals[activeIndex].color} / 0.25)`,
                boxShadow: `0 8px 30px hsl(${abcAnimals[activeIndex].color} / 0.12)`,
              }}
            >
              <motion.div
                className="text-6xl sm:text-7xl mb-2"
                animate={{ y: [0, -10, 0], rotate: [0, -5, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
              >
                {abcAnimals[activeIndex].emoji}
              </motion.div>
              <h3 className="font-display font-extrabold text-3xl sm:text-4xl mb-1" style={{ color: `hsl(${abcAnimals[activeIndex].color})` }}>
                {abcAnimals[activeIndex].letter} is for {abcAnimals[activeIndex].animal}
              </h3>
              <motion.p
                className="font-display font-bold text-lg text-muted-foreground"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {abcAnimals[activeIndex].sound}
              </motion.p>

              {/* Prev/Next */}
              <div className="flex justify-center gap-3 mt-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { playClickSound(); setActiveIndex(Math.max(0, activeIndex - 1)); }}
                  disabled={activeIndex === 0}
                  className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-30"
                  style={{ background: "hsl(var(--muted))" }}
                >
                  <SkipBack className="w-4 h-4 text-foreground" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { playClickSound(); setActiveIndex(Math.min(25, activeIndex + 1)); }}
                  disabled={activeIndex === 25}
                  className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-30"
                  style={{ background: "hsl(var(--muted))" }}
                >
                  <SkipForward className="w-4 h-4 text-foreground" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ABCAnimalsPage;
