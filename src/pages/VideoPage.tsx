import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { ArrowLeft } from "lucide-react";
import BackToLevels from "@/components/BackToLevels";
import ClassroomBackground from "@/components/ClassroomBackground";

const VIDEOS: Record<string, { src: string; title: Record<string, string> }> = {
  reference: {
    src: "/videos/reference-style.mp4",
    title: { en: "Learning Style Guide", he: "מדריך סגנון למידה", ar: "دليل أسلوب التعلم" },
  },
};

const VideoPage = () => {
  const { id } = useParams<{ id: string }>();
  const { lang, dir } = useLanguage();
  const navigate = useNavigate();
  const video = id ? VIDEOS[id] : null;

  if (!video) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir={dir}>
        <p className="text-muted-foreground">Video not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" dir={dir}>
      <ClassroomBackground />
      <div className="max-w-2xl mx-auto px-4 py-8 relative z-10">
        <BackToLevels />
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-display font-bold text-gradient text-center mb-6"
        >
          🎥 {video.title[lang] || video.title.en}
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl overflow-hidden"
          style={{ border: "2px solid hsl(var(--border))", background: "hsl(var(--card))" }}
        >
          <video
            src={video.src}
            className="w-full aspect-video object-cover"
            controls
            autoPlay
            playsInline
          />
        </motion.div>
      </div>
    </div>
  );
};

export default VideoPage;
