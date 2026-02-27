/**
 * Story Engine v1
 *
 * Provides:
 * - Deterministic template-based interactive micro-stories
 * - Trilingual output (en / he / ar)
 * - Safe content rules (no violence, no dark themes)
 * - Embedded learning activities: pick / match / spell / build-sentence
 */

import type { Language } from "@/lib/i18n";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type StoryActivityType = "pick" | "match" | "spell" | "build-sentence";

export interface StoryActivity {
  type: StoryActivityType;
  /** Question or instruction */
  prompt: Record<Language, string>;
  /** For pick: the correct answer */
  answer: string;
  /** For pick: all options */
  options?: string[];
  /** For match: pairs [word, translation/image-emoji] */
  pairs?: Array<[string, string]>;
  /** For spell: the word to spell */
  wordToSpell?: string;
  /** For build-sentence: the scrambled words */
  sentenceWords?: string[];
  /** The correct sentence for build-sentence */
  correctSentence?: string;
}

export interface StoryBeat {
  /** Unique id within the story */
  id: string;
  /** Narrative text */
  text: Record<Language, string>;
  /** Emoji decoration for the scene */
  sceneEmoji: string;
  /** Optional embedded activity before moving to next beat */
  activity?: StoryActivity;
  /** Character mood for this beat */
  characterMood?: "idle" | "talk" | "celebrate" | "wave" | "think" | "point";
}

export interface Story {
  id: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  emoji: string;
  /** Minimum age suggestion */
  minAge: number;
  /** Target vocabulary */
  vocabulary: string[];
  beats: StoryBeat[];
}

// ---------------------------------------------------------------------------
// Safe content helpers
// ---------------------------------------------------------------------------

const SAFE_VOCAB = [
  "apple", "ball", "cat", "dog", "elephant", "fish", "grape", "hat",
  "ice cream", "jar", "kite", "lion", "mango", "nest", "orange", "penguin",
  "queen", "rabbit", "sun", "tree", "umbrella", "violet", "water", "xylophone",
  "yellow", "zebra", "book", "bird", "cloud", "star", "moon", "flower", "garden",
  "school", "friend", "family", "happy", "play", "sing", "dance", "run", "jump",
];

/** Validate that story content passes child-safety rules */
const isSafeContent = (text: string): boolean => {
  const forbidden = ["fight", "weapon", "kill", "hurt", "scary", "die", "blood", "war"];
  const lower = text.toLowerCase();
  return !forbidden.some((f) => lower.includes(f));
};

// ---------------------------------------------------------------------------
// Story Templates
// ---------------------------------------------------------------------------

export const STORIES: Story[] = [
  {
    id: "story-owl-adventure",
    title: {
      en: "Ollie the Owl's Adventure",
      he: "ההרפתקה של אולי הינשוף",
      ar: "مغامرة أولي البومة",
    },
    description: {
      en: "Help Ollie explore the forest and learn new words!",
      he: "עזור לאולי לחקור את היער וללמוד מילים חדשות!",
      ar: "ساعد أولي في استكشاف الغابة وتعلم كلمات جديدة!",
    },
    emoji: "🦉",
    minAge: 4,
    vocabulary: ["tree", "bird", "flower", "sun", "friend"],
    beats: [
      {
        id: "beat-1",
        text: {
          en: "One sunny morning, Ollie the Owl woke up in his big oak tree. 'Good morning!' he said.",
          he: "בוקר שמשי אחד, אולי הינשוף התעורר בעץ האלון הגדול שלו. 'בוקר טוב!' הוא אמר.",
          ar: "في صباح مشمس، استيقظت أولي البومة في شجرة البلوط الكبيرة. 'صباح الخير!' قالت.",
        },
        sceneEmoji: "🌅",
        characterMood: "wave",
        activity: {
          type: "pick",
          prompt: {
            en: "What time of day is it in the story?",
            he: "מה השעה ביום בסיפור?",
            ar: "ما وقت اليوم في القصة؟",
          },
          answer: "Morning",
          options: ["Morning", "Afternoon", "Night", "Evening"],
        },
      },
      {
        id: "beat-2",
        text: {
          en: "Ollie flew to the beautiful flower garden. He saw red, yellow, and blue flowers.",
          he: "אולי עף לגינת הפרחים היפה. הוא ראה פרחים אדומים, צהובים וכחולים.",
          ar: "طارت أولي إلى حديقة الزهور الجميلة. رأت زهوراً حمراء وصفراء وزرقاء.",
        },
        sceneEmoji: "🌸",
        characterMood: "celebrate",
        activity: {
          type: "match",
          prompt: {
            en: "Match the colors to their English words!",
            he: "התאם את הצבעים למילים שלהם!",
            ar: "طابق الألوان مع كلماتها الإنجليزية!",
          },
          answer: "red=🔴,yellow=🟡,blue=🔵",
          pairs: [
            ["red", "🔴"],
            ["yellow", "🟡"],
            ["blue", "🔵"],
          ],
        },
      },
      {
        id: "beat-3",
        text: {
          en: "Ollie met a friendly rabbit. 'Hello! My name is Rosie!' said the rabbit.",
          he: "אולי פגש ארנב חברותי. 'שלום! שמי רוזי!' אמר הארנב.",
          ar: "قابلت أولي أرنباً ودياً. 'مرحبا! اسمي روزي!' قال الأرنب.",
        },
        sceneEmoji: "🐰",
        characterMood: "talk",
        activity: {
          type: "spell",
          prompt: {
            en: "Spell the word: RABBIT",
            he: "איית את המילה: RABBIT",
            ar: "تهجّ الكلمة: RABBIT",
          },
          answer: "RABBIT",
          wordToSpell: "RABBIT",
        },
      },
      {
        id: "beat-4",
        text: {
          en: "Together, Ollie and Rosie played under the big, bright sun. What a wonderful day!",
          he: "יחד, אולי ורוזי שיחקו תחת השמש הגדולה והבהירה. איזה יום נפלא!",
          ar: "معاً، لعبت أولي وروزي تحت الشمس الكبيرة المشرقة. يا له من يوم رائع!",
        },
        sceneEmoji: "☀️",
        characterMood: "celebrate",
        activity: {
          type: "build-sentence",
          prompt: {
            en: "Build a sentence about the story!",
            he: "בנה משפט על הסיפור!",
            ar: "ابنِ جملة عن القصة!",
          },
          answer: "Ollie and Rosie play together",
          sentenceWords: ["Rosie", "Ollie", "together", "and", "play"],
          correctSentence: "Ollie and Rosie play together",
        },
      },
    ],
  },
  {
    id: "story-market-day",
    title: {
      en: "Market Day!",
      he: "יום השוק!",
      ar: "يوم السوق!",
    },
    description: {
      en: "Help Mia shop at the market and learn food words!",
      he: "עזור למיה לקנות בשוק וללמוד מילות אוכל!",
      ar: "ساعد ميا في التسوق في السوق وتعلم كلمات الطعام!",
    },
    emoji: "🛒",
    minAge: 5,
    vocabulary: ["apple", "mango", "orange", "grape", "banana"],
    beats: [
      {
        id: "beat-1",
        text: {
          en: "Mia and her mom went to the colorful market. 'Let's buy some fruit!' said Mom.",
          he: "מיה ואמא שלה הלכו לשוק הצבעוני. 'בואו נקנה פירות!' אמרה אמא.",
          ar: "ذهبت ميا وأمها إلى السوق الملون. 'هيا نشتري بعض الفواكه!' قالت الأم.",
        },
        sceneEmoji: "🏪",
        characterMood: "wave",
        activity: {
          type: "pick",
          prompt: {
            en: "Where did Mia go?",
            he: "לאן הלכה מיה?",
            ar: "أين ذهبت ميا؟",
          },
          answer: "Market",
          options: ["School", "Market", "Park", "Library"],
        },
      },
      {
        id: "beat-2",
        text: {
          en: "Mia saw beautiful apples, juicy mangoes, and sweet oranges. She loved them all!",
          he: "מיה ראתה תפוחים יפים, מנגואים עסיסיים ותפוזים מתוקים. היא אהבה את כולם!",
          ar: "رأت ميا تفاحاً جميلاً ومانجو طازجاً وبرتقالاً حلواً. أحبتها جميعاً!",
        },
        sceneEmoji: "🍎🥭🍊",
        characterMood: "celebrate",
        activity: {
          type: "match",
          prompt: {
            en: "Match the fruits to their pictures!",
            he: "התאם את הפירות לתמונות!",
            ar: "طابق الفواكه مع صورها!",
          },
          answer: "apple=🍎,mango=🥭,orange=🍊",
          pairs: [
            ["apple", "🍎"],
            ["mango", "🥭"],
            ["orange", "🍊"],
          ],
        },
      },
      {
        id: "beat-3",
        text: {
          en: "Mia counted the fruits: 'One apple, two mangoes, three oranges!'",
          he: "מיה ספרה את הפירות: 'תפוח אחד, שני מנגואים, שלושה תפוזים!'",
          ar: "عدّت ميا الفواكه: 'تفاحة واحدة، مانجوتان، ثلاث برتقالات!'",
        },
        sceneEmoji: "🔢",
        characterMood: "point",
        activity: {
          type: "spell",
          prompt: {
            en: "Spell the word: ORANGE",
            he: "איית את המילה: ORANGE",
            ar: "تهجّ الكلمة: ORANGE",
          },
          answer: "ORANGE",
          wordToSpell: "ORANGE",
        },
      },
    ],
  },
  {
    id: "story-rainbow-school",
    title: {
      en: "Rainbow School",
      he: "בית ספר הקשת",
      ar: "مدرسة قوس قزح",
    },
    description: {
      en: "Join Leo on his first day at a rainbow-colored school!",
      he: "הצטרף ללאו ביום הראשון שלו בבית ספר צבעוני!",
      ar: "انضم إلى ليو في يومه الأول في مدرسة ملونة!",
    },
    emoji: "🌈",
    minAge: 6,
    vocabulary: ["book", "pencil", "teacher", "friend", "learn"],
    beats: [
      {
        id: "beat-1",
        text: {
          en: "Leo was excited! Today was his first day at Rainbow School. He packed his book and pencil.",
          he: "לאו היה נרגש! היום היה יומו הראשון בבית ספר הקשת. הוא ארז את הספר והעיפרון שלו.",
          ar: "كان ليو متحمساً! اليوم كان أول يوم له في مدرسة قوس قزح. حزم كتابه وقلمه.",
        },
        sceneEmoji: "🎒",
        characterMood: "celebrate",
        activity: {
          type: "pick",
          prompt: {
            en: "What did Leo pack for school?",
            he: "מה לאו ארז לבית הספר?",
            ar: "ماذا حزم ليو للمدرسة؟",
          },
          answer: "Book and pencil",
          options: ["Hat and shoes", "Book and pencil", "Apple and water", "Ball and bat"],
        },
      },
      {
        id: "beat-2",
        text: {
          en: "The teacher was kind and friendly. 'Hello, class! My name is Ms. Rainbow,' she said.",
          he: "המורה הייתה טובת לב וידידותית. 'שלום, כיתה! שמי גב' קשת,' היא אמרה.",
          ar: "كانت المعلمة لطيفة وودية. 'مرحباً، يا فصلي! اسمي السيدة قوس قزح' قالت.",
        },
        sceneEmoji: "👩‍🏫",
        characterMood: "talk",
        activity: {
          type: "spell",
          prompt: {
            en: "Spell the word: TEACHER",
            he: "איית את המילה: TEACHER",
            ar: "تهجّ الكلمة: TEACHER",
          },
          answer: "TEACHER",
          wordToSpell: "TEACHER",
        },
      },
      {
        id: "beat-3",
        text: {
          en: "Leo made a new friend named Sara. 'I love learning English!' said Leo. 'Me too!' said Sara.",
          he: "לאו מצא חבר חדש בשם שרה. 'אני אוהב ללמוד אנגלית!' אמר לאו. 'גם אני!' אמרה שרה.",
          ar: "وجد ليو صديقاً جديداً اسمه سارة. 'أحب تعلم الإنجليزية!' قال ليو. 'أنا أيضاً!' قالت سارة.",
        },
        sceneEmoji: "🤝",
        characterMood: "celebrate",
        activity: {
          type: "build-sentence",
          prompt: {
            en: "Build Leo's favourite sentence!",
            he: "בנה את המשפט האהוב של לאו!",
            ar: "ابنِ الجملة المفضلة لليو!",
          },
          answer: "I love learning English",
          sentenceWords: ["English", "I", "learning", "love"],
          correctSentence: "I love learning English",
        },
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

// Validate all built-in stories at module load (dev guard)
if (import.meta.env?.DEV) {
  for (const story of STORIES) {
    for (const beat of story.beats) {
      for (const lang of (["en", "he", "ar"] as Language[])) {
        if (!isSafeContent(beat.text[lang])) {
          console.warn(`Story "${story.id}" beat "${beat.id}" (${lang}) may contain unsafe content`);
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Get all stories available for the given minimum age.
 */
export const getStoriesForAge = (age: number): Story[] =>
  STORIES.filter((s) => s.minAge <= age);

/**
 * Get a story by ID.
 */
export const getStoryById = (id: string): Story | undefined =>
  STORIES.find((s) => s.id === id);

/**
 * Check whether the given answer is correct for a StoryActivity.
 * Case-insensitive, trims whitespace.
 */
export const checkAnswer = (activity: StoryActivity, userAnswer: string): boolean => {
  const correct = activity.answer.trim().toLowerCase();
  const user = userAnswer.trim().toLowerCase();
  return correct === user;
};

/**
 * Get story progress from localStorage.
 */
export const getStoryProgress = (storyId: string): { beatIndex: number; completed: boolean } => {
  try {
    const raw = localStorage.getItem(`story-progress-${storyId}`);
    return raw ? JSON.parse(raw) : { beatIndex: 0, completed: false };
  } catch {
    return { beatIndex: 0, completed: false };
  }
};

/**
 * Save story progress to localStorage.
 */
export const saveStoryProgress = (storyId: string, beatIndex: number, completed: boolean): void => {
  try {
    localStorage.setItem(`story-progress-${storyId}`, JSON.stringify({ beatIndex, completed }));
  } catch {
    console.error("Failed to save story progress");
  }
};
