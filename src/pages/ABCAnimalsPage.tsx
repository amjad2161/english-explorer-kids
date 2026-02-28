import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useRef, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";
import { playClickSound, playAnimalSound, speakEnglish, speakExcited, type AnimalSoundType } from "@/lib/sounds";
import { animalImages } from "@/assets/animals";
import { dispatchCharacterEvent } from "@/lib/characterStore";
import ClassroomBackground from "@/components/ClassroomBackground";
import BackToLevels from "@/components/BackToLevels";
import Interactive3DMascot from "@/components/Interactive3DMascot";
import AnimatedSection from "@/components/AnimatedSection";
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Music, Sparkles } from "lucide-react";

/* ─── ABC Animals data from the video ─── */
const abcAnimals: { letter: string; animal: string; emoji: string; sound: string; color: string; soundKey: AnimalSoundType }[] = [
  { letter: "A", animal: "Alligator", emoji: "🐊", sound: "Chomp! Chomp!", color: "142 60% 42%", soundKey: "alligator" },
  { letter: "B", animal: "Bear", emoji: "🐻", sound: "Stomp! Stomp!", color: "25 60% 45%", soundKey: "bear" },
  { letter: "C", animal: "Cat", emoji: "🐱", sound: "Purrrr~", color: "265 55% 58%", soundKey: "cat" },
  { letter: "D", animal: "Dog", emoji: "🐶", sound: "Woof! Woof!", color: "25 95% 53%", soundKey: "dog" },
  { letter: "E", animal: "Elephant", emoji: "🐘", sound: "Toot! Toot!", color: "220 15% 55%", soundKey: "elephant" },
  { letter: "F", animal: "Fox", emoji: "🦊", sound: "Sly & Fast!", color: "25 90% 50%", soundKey: "fox" },
  { letter: "G", animal: "Giraffe", emoji: "🦒", sound: "Reaching high!", color: "45 100% 55%", soundKey: "giraffe" },
  { letter: "H", animal: "Hippo", emoji: "🦛", sound: "Big & round!", color: "265 30% 55%", soundKey: "hippo" },
  { letter: "I", animal: "Iguana", emoji: "🦎", sound: "Crawling low!", color: "142 50% 50%", soundKey: "iguana" },
  { letter: "J", animal: "Jaguar", emoji: "🐆", sound: "Zooming past!", color: "45 80% 45%", soundKey: "jaguar" },
  { letter: "K", animal: "Kangaroo", emoji: "🦘", sound: "Hop! Hop!", color: "25 70% 50%", soundKey: "kangaroo" },
  { letter: "L", animal: "Lion", emoji: "🦁", sound: "ROAR!", color: "35 90% 50%", soundKey: "lion" },
  { letter: "M", animal: "Monkey", emoji: "🐒", sound: "Swing swing!", color: "25 60% 40%", soundKey: "monkey" },
  { letter: "N", animal: "Newt", emoji: "🦎", sound: "Crawling~", color: "142 45% 45%", soundKey: "newt" },
  { letter: "O", animal: "Owl", emoji: "🦉", sound: "Hoo hoo!", color: "25 40% 45%", soundKey: "owl" },
  { letter: "P", animal: "Penguin", emoji: "🐧", sound: "Skate skate!", color: "210 70% 52%", soundKey: "penguin" },
  { letter: "Q", animal: "Quail", emoji: "🐦", sound: "Tweet tweet!", color: "330 55% 55%", soundKey: "quail" },
  { letter: "R", animal: "Rabbit", emoji: "🐰", sound: "Bounce bounce!", color: "330 75% 55%", soundKey: "rabbit" },
  { letter: "S", animal: "Snake", emoji: "🐍", sound: "Ssssss!", color: "142 60% 40%", soundKey: "snake" },
  { letter: "T", animal: "Tiger", emoji: "🐯", sound: "ROAR!", color: "25 90% 50%", soundKey: "tiger" },
  { letter: "U", animal: "Unicorn", emoji: "🦄", sound: "✨ Magic!", color: "265 70% 60%", soundKey: "unicorn" },
  { letter: "V", animal: "Vulture", emoji: "🦅", sound: "Soaring high!", color: "25 30% 40%", soundKey: "vulture" },
  { letter: "W", animal: "Whale", emoji: "🐋", sound: "Splash!", color: "210 70% 55%", soundKey: "whale" },
  { letter: "X", animal: "X-ray Fish", emoji: "🐠", sound: "Swim swim!", color: "180 60% 50%", soundKey: "xrayfish" },
  { letter: "Y", animal: "Yak", emoji: "🐂", sound: "Moo~", color: "25 40% 40%", soundKey: "yak" },
  { letter: "Z", animal: "Zebra", emoji: "🦓", sound: "Gallop!", color: "0 0% 30%", soundKey: "zebra" },
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

    {/* Animal Image */}
    <motion.div
      className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-1 rounded-full overflow-hidden"
      animate={isActive ? { y: [0, -6, 0] } : {}}
      transition={{ duration: 0.8, repeat: isActive ? Infinity : 0, repeatDelay: 0.5 }}
    >
      <img
        src={animalImages[item.soundKey]}
        alt={item.animal}
        className="w-full h-full object-cover"
        loading="lazy"
      />
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

/* ─── Karaoke lyrics synced to video timestamps ─── */
interface LyricLine {
  start: number; // seconds
  end: number;
  text: string;
  emoji?: string;
}

const karaokeLines: LyricLine[] = [
  { start: 0, end: 4, text: "Are you ready to sing the ABCs with animals?", emoji: "🎤" },
  { start: 4, end: 6, text: "Let's go!", emoji: "🚀" },
  { start: 11, end: 13, text: "A is for Alligator — Chomp! Chomp! Chomp!", emoji: "🐊" },
  { start: 13, end: 16, text: "B is for Bear who loves to stomp!", emoji: "🐻" },
  { start: 16, end: 19, text: "C is for Cat with a soft little purr", emoji: "🐱" },
  { start: 19, end: 21, text: "D is for Dog who loves to stir!", emoji: "🐶" },
  { start: 21, end: 24, text: "E is for Elephant — Toot! Toot! Toot!", emoji: "🐘" },
  { start: 24, end: 26, text: "Splashing in water, oh so cute!", emoji: "💦" },
  { start: 26, end: 31, text: "🎵 A, B, C, D, E — Come and sing along with me!", emoji: "🎵" },
  { start: 31, end: 37, text: "🎵 F, G, H, I, J — Animal friends are here to play!", emoji: "🎵" },
  { start: 37, end: 39, text: "F is for Fox, fast and sly", emoji: "🦊" },
  { start: 39, end: 42, text: "G is for Giraffe, reaching high!", emoji: "🦒" },
  { start: 42, end: 44, text: "H is for Hippo, big and round", emoji: "🦛" },
  { start: 44, end: 47, text: "I is for Iguana, low to the ground", emoji: "🦎" },
  { start: 47, end: 50, text: "J is for Jaguar, jumping fast!", emoji: "🐆" },
  { start: 50, end: 52, text: "Through the jungle, zooming past!", emoji: "🌴" },
  { start: 52, end: 58, text: "🎵 K, L, M, N, O — See how many animals you know!", emoji: "🎵" },
  { start: 58, end: 65, text: "🎵 P, Q, R, S, T — Sing and learn the ABCs with me!", emoji: "🎵" },
  { start: 65, end: 68, text: "K is for Kangaroo — Hop! Hop! Hop!", emoji: "🦘" },
  { start: 68, end: 70, text: "L is for Lion, he's the king on top!", emoji: "🦁" },
  { start: 70, end: 73, text: "M is for Monkey, swinging trees!", emoji: "🐒" },
  { start: 73, end: 76, text: "N is for Newt, crawling with ease", emoji: "🦎" },
  { start: 76, end: 78, text: "O is for Owl, who stays up late", emoji: "🦉" },
  { start: 78, end: 81, text: "P is for Penguin, who likes to skate!", emoji: "🐧" },
  { start: 81, end: 84, text: "Q is for Quail, with feathers neat", emoji: "🐦" },
  { start: 84, end: 86, text: "R is for Rabbit, with bouncy feet!", emoji: "🐰" },
  { start: 86, end: 89, text: "S is for Snake, who slithers by", emoji: "🐍" },
  { start: 89, end: 94, text: "T is for Tiger, with a mighty cry — ROAR!", emoji: "🐯" },
  { start: 94, end: 97, text: "U is for Unicorn, okay not real…", emoji: "🦄" },
  { start: 97, end: 99, text: "But let's pretend and see how it feels!", emoji: "✨" },
  { start: 99, end: 102, text: "V is for Vulture, flying high", emoji: "🦅" },
  { start: 102, end: 105, text: "W is for Whale, with a water spout sky!", emoji: "🐋" },
  { start: 105, end: 107, text: "X is for X-ray Fish, you see", emoji: "🐠" },
  { start: 107, end: 110, text: "Y is for Yak, with a shaggy goatee!", emoji: "🐂" },
  { start: 110, end: 112, text: "Z is for Zebra, black and white", emoji: "🦓" },
  { start: 112, end: 117, text: "We made it through, you did it right! 🎉", emoji: "🎉" },
  { start: 117, end: 122, text: "A to Z, now we know — Animals from head to toe!", emoji: "🌟" },
  { start: 122, end: 131, text: "Sing it once, or maybe three — It's fun to learn your ABCs!", emoji: "🎶" },
  { start: 131, end: 140, text: "Woo-hoo! 🎉", emoji: "🥳" },
  { start: 162, end: 173, text: "Sing it once, or maybe three — It's fun to learn your ABCs! Woo-hoo!", emoji: "🎶" },
];

/* ─── Karaoke Display ─── */
const KaraokeDisplay = ({ currentTime, isPlaying }: { currentTime: number; isPlaying: boolean }) => {
  const activeLine = karaokeLines.find(l => currentTime >= l.start && currentTime < l.end);
  const nextLine = karaokeLines.find(l => l.start > currentTime);

  return (
    <div
      className="relative rounded-xl px-4 py-3 min-h-[72px] flex flex-col items-center justify-center text-center overflow-hidden"
      style={{
        background: "linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--accent) / 0.06))",
        border: "1.5px solid hsl(var(--primary) / 0.15)",
      }}
    >
      {/* Animated music notes background */}
      {isPlaying && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {["♪", "♫", "♬", "🎵"].map((note, i) => (
            <motion.span
              key={i}
              className="absolute text-xs opacity-20"
              style={{ left: `${15 + i * 22}%`, bottom: 0 }}
              animate={{ y: [0, -60], opacity: [0.3, 0], x: [0, (i % 2 ? 10 : -10)] }}
              transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.5, ease: "easeOut" }}
            >
              {note}
            </motion.span>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {activeLine ? (
          <motion.div
            key={activeLine.start}
            initial={{ opacity: 0, y: 12, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex flex-col items-center gap-1"
          >
            {activeLine.emoji && (
              <motion.span
                className="text-2xl"
                animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.5 }}
              >
                {activeLine.emoji}
              </motion.span>
            )}
            <KaraokeText text={activeLine.text} duration={activeLine.end - activeLine.start} />
          </motion.div>
        ) : (
          <motion.div
            key="waiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs text-muted-foreground font-display"
          >
            {isPlaying && nextLine ? (
              <span className="flex items-center gap-1.5">
                <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity }}>
                  🎵
                </motion.span>
                <span>{nextLine.emoji} Coming up...</span>
              </span>
            ) : (
              <span>🎤 Press play to start the karaoke!</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress dots showing position in song */}
      {isPlaying && (
        <div className="flex gap-0.5 mt-2">
          {karaokeLines.slice(0, 20).map((line, i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: currentTime >= line.start
                  ? "hsl(var(--primary))"
                  : "hsl(var(--muted-foreground) / 0.2)",
              }}
              animate={currentTime >= line.start && currentTime < line.end ? { scale: [1, 1.5, 1] } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Word-by-word highlight karaoke text ─── */
const KaraokeText = ({ text, duration }: { text: string; duration: number }) => {
  const words = text.split(" ");
  const perWord = duration / words.length;

  return (
    <p className="font-display font-bold text-sm sm:text-base leading-relaxed flex flex-wrap justify-center gap-x-1.5 gap-y-0.5">
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ color: "hsl(var(--muted-foreground))", scale: 1 }}
          animate={{
            color: "hsl(var(--primary))",
            scale: [1, 1.1, 1],
          }}
          transition={{
            delay: i * perWord,
            duration: perWord * 0.8,
            scale: { delay: i * perWord, duration: 0.2 },
          }}
          className="inline-block"
        >
          {word}
        </motion.span>
      ))}
    </p>
  );
};

/* ─── Video Player Section with Karaoke ─── */
const VideoPlayer = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [karaokeEnabled, setKaraokeEnabled] = useState(true);
  const { lang } = useLanguage();
  const animFrameRef = useRef<number>(0);

  // Sync current time with video via requestAnimationFrame for smooth updates
  useEffect(() => {
    const update = () => {
      if (videoRef.current && isPlaying) {
        setCurrentTime(videoRef.current.currentTime);
      }
      animFrameRef.current = requestAnimationFrame(update);
    };
    if (isPlaying) {
      animFrameRef.current = requestAnimationFrame(update);
    }
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isPlaying]);

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
    setCurrentTime(0);
    playClickSound();
  }, []);

  return (
    <div className="space-y-3">
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          border: `3px solid hsl(var(--primary) / ${karaokeEnabled && isPlaying ? 0.4 : 0.2})`,
          boxShadow: karaokeEnabled && isPlaying
            ? "0 8px 30px hsl(var(--primary) / 0.15), 0 0 20px hsl(var(--primary) / 0.05)"
            : "0 8px 30px hsl(var(--primary) / 0.1)",
          transition: "border-color 0.3s, box-shadow 0.3s",
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

          {/* Karaoke toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => { setKaraokeEnabled(!karaokeEnabled); playClickSound(); }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs"
            style={{
              background: karaokeEnabled ? "hsl(var(--primary) / 0.8)" : "hsl(0 0% 100% / 0.15)",
            }}
            title={karaokeEnabled ? "Karaoke ON" : "Karaoke OFF"}
          >
            🎤
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

      {/* Karaoke lyrics panel */}
      {karaokeEnabled && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <KaraokeDisplay currentTime={currentTime} isPlaying={isPlaying} />
        </motion.div>
      )}
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
    const animal = abcAnimals[index];
    playAnimalSound(animal.soundKey);
    // TTS: Read the animal name aloud after a short delay so it doesn't overlap the animal sound
    setTimeout(() => {
      speakEnglish(`${animal.letter} is for ${animal.animal}`);
    }, 400);
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

        {/* Character Gallery Banner */}
        <AnimatedSection delay={0.12} className="mb-6">
          <div className="flex flex-wrap justify-center gap-2">
            {abcAnimals.slice(0, 13).map((item, i) => (
              <motion.div
                key={item.letter}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden"
                style={{
                  border: `2px solid hsl(${item.color} / 0.3)`,
                  boxShadow: `0 2px 8px hsl(${item.color} / 0.15)`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, type: "spring" }}
                whileHover={{ scale: 1.2, y: -3, zIndex: 10 }}
              >
                <img src={animalImages[item.soundKey]} alt={item.animal} className="w-full h-full object-cover" loading="lazy" />
              </motion.div>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {abcAnimals.slice(13).map((item, i) => (
              <motion.div
                key={item.letter}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden"
                style={{
                  border: `2px solid hsl(${item.color} / 0.3)`,
                  boxShadow: `0 2px 8px hsl(${item.color} / 0.15)`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (i + 13) * 0.05, type: "spring" }}
                whileHover={{ scale: 1.2, y: -3, zIndex: 10 }}
              >
                <img src={animalImages[item.soundKey]} alt={item.animal} className="w-full h-full object-cover" loading="lazy" />
              </motion.div>
            ))}
          </div>
        </AnimatedSection>

        {/* ABC Animals Grid */}
        <AnimatedSection delay={0.15}>
          <div className="text-center mb-4">
            <h2 className="font-display font-bold text-lg sm:text-xl text-foreground flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {lang === "he" ? "לחצו על חיה כדי לשמוע את השם שלה!" : lang === "ar" ? "اضغط على حيوان لسماع اسمه!" : "Tap an animal to hear its name!"}
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
                className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-3 rounded-full overflow-hidden"
                style={{
                  border: `3px solid hsl(${abcAnimals[activeIndex].color} / 0.4)`,
                  boxShadow: `0 4px 20px hsl(${abcAnimals[activeIndex].color} / 0.2)`,
                }}
                animate={{ y: [0, -10, 0], rotate: [0, -3, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
              >
                <img src={animalImages[abcAnimals[activeIndex].soundKey]} alt={abcAnimals[activeIndex].animal} className="w-full h-full object-cover" />
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

              {/* Hear it again button */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  const animal = abcAnimals[activeIndex];
                  playAnimalSound(animal.soundKey);
                  setTimeout(() => speakEnglish(`${animal.letter} is for ${animal.animal}`), 400);
                }}
                className="mt-3 px-4 py-2 rounded-full font-display font-bold text-sm flex items-center gap-2 mx-auto"
                style={{
                  background: `hsl(${abcAnimals[activeIndex].color} / 0.15)`,
                  color: `hsl(${abcAnimals[activeIndex].color})`,
                  border: `2px solid hsl(${abcAnimals[activeIndex].color} / 0.3)`,
                }}
              >
                <Volume2 className="w-4 h-4" />
                {lang === "he" ? "שמע שוב" : "Hear it again!"}
              </motion.button>

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
