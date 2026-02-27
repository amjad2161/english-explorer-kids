/**
 * Story Engine v1
 * Template-based deterministic story generation aligned with learning objectives.
 * Generates micro-stories (3–6 scenes) with embedded activities.
 *
 * Safety rules:
 * - Child-safe only: no violence, horror, romance, real people, politics
 * - English is the learning target; HE/AR provide scaffolding
 * - Template-based with variation slots to prevent repetition
 */

import type { AgeBand, SkillDomain } from "./learningPath";

export interface StoryScene {
  id: string;
  /** Narration text (English - the learning content) */
  narration: string;
  /** Support text in UI language (optional scaffolding) */
  scaffolding?: { he: string; ar: string };
  /** Dialogue lines for characters */
  dialogues: StoryDialogue[];
  /** Embedded activity (if any) */
  activity?: StoryActivity;
  /** Character action during this scene */
  characterAction: "talk" | "point" | "think" | "celebrate" | "wave";
}

export interface StoryDialogue {
  speaker: string;
  text: string;
  /** Translation for scaffolding */
  scaffolding?: { he: string; ar: string };
}

export type ActivityType = "pick_word" | "repeat" | "match" | "spell" | "build_sentence";

export interface StoryActivity {
  type: ActivityType;
  /** Instruction text */
  instruction: string;
  /** Correct answer(s) */
  answers: string[];
  /** Distractor options (for pick_word, match) */
  options?: string[];
  /** Scaffolding translations */
  scaffolding?: { he: string; ar: string };
}

export interface Story {
  id: string;
  title: string;
  titleScaffolding?: { he: string; ar: string };
  theme: string;
  targetDomain: SkillDomain;
  targetObjective: string;
  ageBand: AgeBand;
  scenes: StoryScene[];
}

// ── Theme Templates ──

interface StoryTemplate {
  id: string;
  theme: string;
  title: string;
  titleScaffolding: { he: string; ar: string };
  /** Function to generate scenes with target words/concepts */
  buildScenes: (words: string[], ageBand: AgeBand) => StoryScene[];
}

const TEMPLATES: StoryTemplate[] = [
  {
    id: "tmpl-park-adventure",
    theme: "park",
    title: "A Day at the Park",
    titleScaffolding: { he: "יום בפארק", ar: "يوم في الحديقة" },
    buildScenes: (words, ageBand) => buildParkStory(words, ageBand),
  },
  {
    id: "tmpl-kitchen-fun",
    theme: "kitchen",
    title: "Fun in the Kitchen",
    titleScaffolding: { he: "כיף במטבח", ar: "متعة في المطبخ" },
    buildScenes: (words, ageBand) => buildKitchenStory(words, ageBand),
  },
  {
    id: "tmpl-school-day",
    theme: "school",
    title: "My School Day",
    titleScaffolding: { he: "יום בבית הספר", ar: "يومي في المدرسة" },
    buildScenes: (words, ageBand) => buildSchoolStory(words, ageBand),
  },
];

// ── Word Banks (target vocabulary per domain) ──

const WORD_BANKS: Partial<Record<SkillDomain, string[]>> = {
  vocabulary: ["cat", "dog", "ball", "tree", "sun", "book", "fish", "bird", "hat", "cup"],
  phonics: ["cat", "bat", "mat", "sat", "hat", "rat", "pat", "fan", "can", "man"],
  grammar: ["I am", "you are", "he is", "she is", "it is", "we are", "they are"],
};

// ── Story Builder Functions ──

function buildParkStory(words: string[], ageBand: AgeBand): StoryScene[] {
  const w = words.length >= 3 ? words : ["tree", "bird", "sun"];
  const isYoung = ageBand === "0-3" || ageBand === "4-6";

  const scenes: StoryScene[] = [
    {
      id: "park-1",
      narration: `Let's go to the park! Look, I can see a ${w[0]}!`,
      scaffolding: { he: `!בואו נלך לפארק! תראו, אני רואה ${w[0]}`, ar: `!هيا نذهب إلى الحديقة! انظروا، أرى ${w[0]}` },
      dialogues: [
        { speaker: "Mascot", text: `Can you say "${w[0]}"?`, scaffolding: { he: `?אתה יכול להגיד "${w[0]}"`, ar: `هل يمكنك قول "${w[0]}"؟` } },
      ],
      activity: {
        type: "repeat",
        instruction: `Say: "${w[0]}"`,
        answers: [w[0]],
        scaffolding: { he: `אמור: "${w[0]}"`, ar: `قل: "${w[0]}"` },
      },
      characterAction: "talk",
    },
    {
      id: "park-2",
      narration: `Wonderful! Now I see a ${w[1]} in the park!`,
      scaffolding: { he: `!נפלא! עכשיו אני רואה ${w[1]} בפארק`, ar: `!رائع! الآن أرى ${w[1]} في الحديقة` },
      dialogues: [
        { speaker: "Mascot", text: `Which one is the "${w[1]}"?` },
      ],
      activity: {
        type: "pick_word",
        instruction: `Pick the "${w[1]}"`,
        answers: [w[1]],
        options: [w[0], w[1], w[2]],
        scaffolding: { he: `בחר את ה-"${w[1]}"`, ar: `اختر "${w[1]}"` },
      },
      characterAction: "point",
    },
    {
      id: "park-3",
      narration: `Great job! And look up – there's the ${w[2]}!`,
      scaffolding: { he: `!עבודה מעולה! תסתכלו למעלה – שם ה-${w[2]}`, ar: `!عمل رائع! انظروا للأعلى – هناك ${w[2]}` },
      dialogues: [],
      activity: isYoung
        ? {
            type: "repeat",
            instruction: `Say: "${w[2]}"`,
            answers: [w[2]],
          }
        : {
            type: "spell",
            instruction: `Spell: "${w[2]}"`,
            answers: [w[2]],
          },
      characterAction: "celebrate",
    },
    {
      id: "park-recap",
      narration: `You learned: ${w.join(", ")}. Amazing!`,
      scaffolding: { he: `${w.join(", ")} :למדת! מדהים`, ar: `${w.join(", ")} :تعلمت! مذهل` },
      dialogues: [
        { speaker: "Mascot", text: "You are a star! ⭐" },
      ],
      characterAction: "celebrate",
    },
  ];

  return scenes;
}

function buildKitchenStory(words: string[], ageBand: AgeBand): StoryScene[] {
  const w = words.length >= 3 ? words : ["cup", "plate", "spoon"];
  const isYoung = ageBand === "0-3" || ageBand === "4-6";

  return [
    {
      id: "kitchen-1",
      narration: `Welcome to the kitchen! Can you find the ${w[0]}?`,
      scaffolding: { he: `?ברוכים הבאים למטבח! אתם יכולים למצוא את ה-${w[0]}`, ar: `?مرحبًا في المطبخ! هل يمكنكم إيجاد ${w[0]}` },
      dialogues: [
        { speaker: "Mascot", text: `This is a ${w[0]}!` },
      ],
      activity: { type: "repeat", instruction: `Say: "${w[0]}"`, answers: [w[0]] },
      characterAction: "point",
    },
    {
      id: "kitchen-2",
      narration: `Now let's find the ${w[1]}.`,
      dialogues: [],
      activity: {
        type: "pick_word",
        instruction: `Pick the "${w[1]}"`,
        answers: [w[1]],
        options: [w[0], w[1], w[2]],
      },
      characterAction: "think",
    },
    {
      id: "kitchen-3",
      narration: `Last one! Where is the ${w[2]}?`,
      dialogues: [],
      activity: isYoung
        ? { type: "repeat", instruction: `Say: "${w[2]}"`, answers: [w[2]] }
        : { type: "spell", instruction: `Spell: "${w[2]}"`, answers: [w[2]] },
      characterAction: "point",
    },
    {
      id: "kitchen-recap",
      narration: `You learned: ${w.join(", ")}. Well done!`,
      dialogues: [{ speaker: "Mascot", text: "Great cooking words! 🍳" }],
      characterAction: "celebrate",
    },
  ];
}

function buildSchoolStory(words: string[], ageBand: AgeBand): StoryScene[] {
  const w = words.length >= 3 ? words : ["book", "pen", "desk"];
  const isYoung = ageBand === "0-3" || ageBand === "4-6";

  return [
    {
      id: "school-1",
      narration: `It's time for school! Look at the ${w[0]} on the desk.`,
      scaffolding: { he: `!הגיע הזמן לבית הספר! תסתכלו על ה-${w[0]} על השולחן`, ar: `!حان وقت المدرسة! انظروا إلى ${w[0]} على المكتب` },
      dialogues: [{ speaker: "Mascot", text: `This is a ${w[0]}. Say it!` }],
      activity: { type: "repeat", instruction: `Say: "${w[0]}"`, answers: [w[0]] },
      characterAction: "talk",
    },
    {
      id: "school-2",
      narration: `Good! Now find the ${w[1]}.`,
      dialogues: [],
      activity: {
        type: "pick_word",
        instruction: `Pick the "${w[1]}"`,
        answers: [w[1]],
        options: [w[0], w[1], w[2]],
      },
      characterAction: "point",
    },
    {
      id: "school-3",
      narration: `Excellent! Can you ${isYoung ? "say" : "spell"} "${w[2]}"?`,
      dialogues: [],
      activity: isYoung
        ? { type: "repeat", instruction: `Say: "${w[2]}"`, answers: [w[2]] }
        : { type: "spell", instruction: `Spell: "${w[2]}"`, answers: [w[2]] },
      characterAction: "think",
    },
    {
      id: "school-recap",
      narration: `You learned: ${w.join(", ")}. You're so smart! 🎓`,
      dialogues: [{ speaker: "Mascot", text: "School is fun! 📚" }],
      characterAction: "celebrate",
    },
  ];
}

// ── Story Generation ──

export interface StoryInput {
  targetDomain: SkillDomain;
  targetObjective?: string;
  ageBand: AgeBand;
  theme?: string;
  words?: string[];
}

/**
 * Generate a story based on learning objectives and constraints.
 * Uses template-based deterministic approach with variation slots.
 */
export function generateStory(input: StoryInput): Story {
  const { targetDomain, targetObjective, ageBand, theme, words } = input;

  // Select template
  let template: StoryTemplate;
  if (theme) {
    template = TEMPLATES.find((t) => t.theme === theme) || TEMPLATES[0];
  } else {
    // Rotate templates based on timestamp to avoid repetition
    const idx = Math.floor(Date.now() / 60000) % TEMPLATES.length;
    template = TEMPLATES[idx];
  }

  // Select target words
  const targetWords = words || WORD_BANKS[targetDomain]?.slice(0, 3) || ["hello", "world", "fun"];

  // Build scenes
  const scenes = template.buildScenes(targetWords, ageBand);

  return {
    id: `story-${template.id}-${Date.now()}`,
    title: template.title,
    titleScaffolding: template.titleScaffolding,
    theme: template.theme,
    targetDomain,
    targetObjective: targetObjective || targetDomain,
    ageBand,
    scenes,
  };
}

/**
 * Validate story content for child safety.
 * Returns true if the story passes all safety checks.
 */
export function validateStorySafety(story: Story): boolean {
  const UNSAFE_PATTERNS = [
    /violen/i, /kill/i, /dead/i, /blood/i, /horror/i, /scary/i,
    /romant/i, /kiss/i, /love\s+interest/i,
    /politic/i, /war\b/i, /weapon/i,
    /http/i, /www\./i, /\.com/i,
  ];

  const allText = story.scenes
    .flatMap((s) => [
      s.narration,
      ...s.dialogues.map((d) => d.text),
      s.activity?.instruction || "",
    ])
    .join(" ");

  return !UNSAFE_PATTERNS.some((pattern) => pattern.test(allText));
}
