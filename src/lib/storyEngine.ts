/**
 * Story Engine — deterministic micro-story generator for learning-aligned,
 * child-safe interactive stories.
 *
 * Safety rules enforced:
 * - No violence, fear, romance, or adult content
 * - No real people, no politics
 * - English is the learning target; HE/AR provide scaffolding
 * - All content is template-based (deterministic + variation slots)
 */
import type { Language } from "@/lib/i18n";
import type { LearningGoal, AgeGroup } from "@/lib/learningPath";

// ─── Types ──────────────────────────────────────────────────────────────────

export type StoryTheme =
  | "animals"
  | "school"
  | "home"
  | "nature"
  | "food"
  | "adventure"
  | "friendship";

export type ActivityType =
  | "pick_word"
  | "repeat"
  | "match"
  | "spell"
  | "build_sentence"
  | "choose_answer";

export interface StoryActivity {
  type: ActivityType;
  /** English prompt */
  prompt: string;
  /** Scaffold text in UI language */
  scaffold: Record<Language, string>;
  /** Options for pick/match/choose activities */
  options?: string[];
  /** Correct answer */
  answer: string;
}

export interface StoryScene {
  id: string;
  /** Scene narrative text in English (learning target) */
  text: string;
  /** Optional scaffold/translation hint */
  hint?: Record<Language, string>;
  /** Character action to dispatch */
  characterAction?: "idle" | "wave" | "celebrate" | "point" | "think";
  /** Embedded activity (null for narrative-only scenes) */
  activity: StoryActivity | null;
}

export interface Story {
  id: string;
  title: string;
  theme: StoryTheme;
  goal: LearningGoal;
  ageGroup: AgeGroup;
  scenes: StoryScene[];
  rewardMessage: Record<Language, string>;
}

// ─── Vocabulary pools by theme ───────────────────────────────────────────────

const THEME_WORDS: Record<StoryTheme, string[]> = {
  animals: ["cat", "dog", "bird", "fish", "rabbit", "lion", "elephant", "frog"],
  school: ["book", "pen", "desk", "teacher", "class", "bag", "board", "letter"],
  home: ["house", "door", "window", "bed", "chair", "table", "kitchen", "garden"],
  nature: ["sun", "tree", "flower", "rain", "cloud", "river", "mountain", "leaf"],
  food: ["apple", "bread", "milk", "egg", "cake", "soup", "rice", "banana"],
  adventure: ["map", "star", "boat", "road", "bridge", "key", "chest", "flag"],
  friendship: ["friend", "smile", "play", "share", "help", "kind", "team", "gift"],
};

// ─── Story templates ─────────────────────────────────────────────────────────

interface StoryTemplate {
  titleFn: (word: string) => string;
  scenes: Array<{
    textFn: (word: string, word2: string) => string;
    hintFn?: (word: string) => Record<Language, string>;
    characterAction?: StoryScene["characterAction"];
    activityFn?: (word: string, options: string[]) => StoryActivity;
  }>;
}

const STORY_TEMPLATES: StoryTemplate[] = [
  // Template 0 — "A Day With [word]" (vocabulary focus)
  {
    titleFn: (w) => `A Day With ${w.charAt(0).toUpperCase() + w.slice(1)}`,
    scenes: [
      {
        textFn: (w) => `Today we are learning about a ${w}. Can you say "${w}"?`,
        hintFn: (w) => ({
          he: `היום אנחנו לומדים על ${w}`,
          ar: `اليوم نتعلم عن ${w}`,
          en: `Today we learn about ${w}`,
        }),
        characterAction: "wave",
        activityFn: (w, opts) => ({
          type: "repeat",
          prompt: `Say it out loud: "${w}"`,
          scaffold: {
            he: `אמור בקול: "${w}"`,
            ar: `قلها بصوت عالٍ: "${w}"`,
            en: `Say it out loud: "${w}"`,
          },
          options: opts,
          answer: w,
        }),
      },
      {
        textFn: (w, w2) => `The ${w} meets a ${w2}. They become friends!`,
        characterAction: "celebrate",
        activityFn: (w, opts) => ({
          type: "pick_word",
          prompt: `Which word means ${w}?`,
          scaffold: {
            he: `איזו מילה מתאימה ל-${w}?`,
            ar: `أي كلمة تعني ${w}؟`,
            en: `Which word means ${w}?`,
          },
          options: opts,
          answer: w,
        }),
      },
      {
        textFn: (w) => `The ${w} says: "I love learning English!"`,
        characterAction: "point",
        activityFn: (w, opts) => ({
          type: "choose_answer",
          prompt: `Complete: "I love learning ___"`,
          scaffold: {
            he: `השלם: "I love learning ___"`,
            ar: `أكمل: "I love learning ___"`,
            en: `Complete: "I love learning ___"`,
          },
          options: ["English", "Hebrew", "Arabic", ...opts.slice(0, 1)],
          answer: "English",
        }),
      },
      {
        textFn: (w) => `Great job! You learned the word "${w}" today. You are amazing!`,
        characterAction: "celebrate",
        activityFn: (w, _opts) => ({
          type: "spell",
          prompt: `Spell the word: ${w}`,
          scaffold: {
            he: `איית את המילה: ${w}`,
            ar: `تهجأ الكلمة: ${w}`,
            en: `Spell the word: ${w}`,
          },
          answer: w,
        }),
      },
    ],
  },

  // Template 1 — "Find the [word]!" (phonics/vocabulary)
  {
    titleFn: (w) => `Find the ${w.charAt(0).toUpperCase() + w.slice(1)}!`,
    scenes: [
      {
        textFn: (w) => `Can you find the ${w}? Look carefully!`,
        characterAction: "think",
        activityFn: (w, opts) => ({
          type: "match",
          prompt: `Match: ${w}`,
          scaffold: {
            he: `התאם: ${w}`,
            ar: `طابق: ${w}`,
            en: `Match: ${w}`,
          },
          options: opts,
          answer: w,
        }),
      },
      {
        textFn: (w, w2) => `Well done! Now can you find the ${w2}?`,
        characterAction: "celebrate",
        activityFn: (_, opts) => ({
          type: "pick_word",
          prompt: `Which one is correct?`,
          scaffold: {
            he: "איזו תשובה נכונה?",
            ar: "أي إجابة صحيحة؟",
            en: "Which one is correct?",
          },
          options: opts,
          answer: opts[0],
        }),
      },
      {
        textFn: (w) => `You found it! The word starts with "${w[0].toUpperCase()}". Can you think of other words?`,
        characterAction: "point",
        activityFn: (w, opts) => ({
          type: "build_sentence",
          prompt: `Build: "I see a ___"`,
          scaffold: {
            he: `בנה: "I see a ___"`,
            ar: `بنِ: "I see a ___"`,
            en: `Build: "I see a ___"`,
          },
          options: opts,
          answer: w,
        }),
      },
    ],
  },
];

// ─── Story generation ─────────────────────────────────────────────────────────

let _storyCounter = 0;

/** Deterministically pick an item from an array using a seed index */
const pick = <T>(arr: T[], seed: number): T => arr[seed % arr.length];

/**
 * Generate an interactive story aligned to the given learning goal.
 * Deterministic given the same parameters.
 */
export const generateStory = (
  goal: LearningGoal,
  ageGroup: AgeGroup,
  theme: StoryTheme = "animals",
  sessionIndex = 0
): Story => {
  const id = `story-${goal}-${ageGroup}-${theme}-${sessionIndex}`;
  const words = THEME_WORDS[theme];
  const word = pick(words, sessionIndex);
  const word2 = pick(words, sessionIndex + 1);
  const template = pick(STORY_TEMPLATES, sessionIndex);

  // Build distractor options (wrong answers from the same theme)
  const distractors = words.filter((w) => w !== word).slice(0, 3);
  const options = [word, ...distractors].sort(() => (sessionIndex % 2 === 0 ? 1 : -1));

  const scenes: StoryScene[] = template.scenes.map((s, i) => ({
    id: `${id}-scene-${i}`,
    text: s.textFn(word, word2),
    hint: s.hintFn?.(word),
    characterAction: s.characterAction ?? "idle",
    activity: s.activityFn ? s.activityFn(word, options) : null,
  }));

  return {
    id,
    title: template.titleFn(word),
    theme,
    goal,
    ageGroup,
    scenes,
    rewardMessage: {
      he: `!כל הכבוד! סיימת את הסיפור והכרת את המילה "${word}"`,
      ar: `!أحسنت! أنهيت القصة وتعلمت كلمة "${word}"`,
      en: `Amazing! You finished the story and learned the word "${word}"!`,
    },
  };
};

// ─── Story progress persistence ───────────────────────────────────────────────

const STORY_PROGRESS_KEY = "story-engine-progress";

interface StoryProgress {
  completedStoryIds: string[];
  currentStoryId: string | null;
  currentSceneIndex: number;
}

export const loadStoryProgress = (): StoryProgress => {
  try {
    const stored = localStorage.getItem(STORY_PROGRESS_KEY);
    return stored
      ? (JSON.parse(stored) as StoryProgress)
      : { completedStoryIds: [], currentStoryId: null, currentSceneIndex: 0 };
  } catch {
    return { completedStoryIds: [], currentStoryId: null, currentSceneIndex: 0 };
  }
};

export const saveStoryProgress = (progress: StoryProgress): void => {
  try {
    localStorage.setItem(STORY_PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // noop
  }
};

export const markStoryComplete = (storyId: string): void => {
  const progress = loadStoryProgress();
  if (!progress.completedStoryIds.includes(storyId)) {
    progress.completedStoryIds.push(storyId);
  }
  progress.currentStoryId = null;
  progress.currentSceneIndex = 0;
  saveStoryProgress(progress);
};
