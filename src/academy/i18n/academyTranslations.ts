import type { Language } from "@/lib/i18n";

type Tri = Record<Language, string>;

const T = (en: string, he: string, ar: string): Tri => ({ en, he, ar });

export const academyTranslations: Record<string, Tri> = {
  "academy.title": T("KidGenius Academy", "אקדמיית KidGenius", "أكاديمية KidGenius"),
  "academy.subtitle": T("A living 3D world of wonder", "עולם תלת־ממדי חי של פלאים", "عالم ثلاثي الأبعاد حي من العجائب"),
  "academy.start": T("Begin the journey", "התחילו את המסע", "ابدأ الرحلة"),
  "academy.resume": T("Resume", "המשך", "استئناف"),
  "academy.world.hub": T("Academy Plaza", "רחבת האקדמיה", "ساحة الأكاديمية"),
  "academy.world.citrus": T("Citrus Market", "שוק ההדרים", "سوق الحمضيات"),
  "academy.world.logic": T("Logic Lab", "מעבדת הלוגיקה", "مختبر المنطق"),
  "academy.world.anatomy": T("Anatomy World", "עולם האנטומיה", "عالم الأناتومي"),
  "academy.world.science": T("Science Garden", "גן המדע", "حديقة العلوم"),
  "academy.world.animals": T("Animals Kingdom", "ממלכת החיות", "مملكة الحيوان"),
  "academy.world.music": T("Music Stage", "במת המוזיקה", "منصة الموسيقى"),
  "academy.world.feelings": T("Feelings World", "עולם הרגשות", "عالم المشاعر"),
  "academy.world.language": T("Language Universe", "יקום השפות", "كون اللغات"),
  "academy.world.finale": T("Graduation Hall", "אולם הגמר", "قاعة التخرج"),
  "academy.prompt.hub": T("Explore floating islands and portals", "גלו באיים מרחפים ובשערי מעבר", "استكشف الجزر الطائرة والبوابات"),
  "academy.interaction.room-sort": T("Sort toys into colored boxes", "מיינו צעצועים לתיבות צבעוניות", "رتّب الألعاب في الصناديق الملونة"),
  "academy.interaction.kitchen-safety": T("Keep food safe — avoid the hot stove", "שמרו על בטיחות במטבח", "حافظ على سلامة الطعام — ابتعد عن الموقد"),
  "academy.interaction.street-crossing": T("Cross only when it is safe", "חצו רק כשבטוח", "اعبر فقط عندما يكون آمناً"),
  "academy.interaction.citrus-fractions": T("Build whole oranges from slices", "הרכיבו תפוזים שלמים מפרוסות", "كوّن برتقالات كاملة من الشرائح"),
  "academy.interaction.pixel-path": T("Program Pixel to the battery", "תכנתו את פיקסל לעבר הסוללה", "برمج بيكسل للوصول إلى البطارية"),
  "academy.interaction.heart-pulse": T("Feel the heartbeat change", "הרגישו את קצב הלב משתנה", "اشعر بتغير نبضات القلب"),
  "academy.interaction.science-garden": T("Grow the glowing flower", "גדלו את הפרח הזוהר", "انمِ الزهرة المضيئة"),
  "academy.interaction.animal-habitats": T("Match animals to habitats", "התאימו חיות לבתי הגידול", "طابق الحيوانات مع بيئاتها"),
  "academy.interaction.rhythm-repeat": T("Repeat the fruit rhythm", "חזרו על הקצב", "كرر إيقاع الفاكهة"),
  "academy.interaction.empathy-choice": T("Help Sara find her sketchbook", "עזרו לשרה למצוא את המחברת", "ساعد سارة في إيجاد دفتر الرسم"),
  "academy.interaction.word-constellation": T("Spell the word in the stars", "איירו את המילה בכוכבים", "تهجَّ الكلمة في النجوم"),
  "academy.interaction.final-locks": T("Unlock the academy gates", "פתחו את שערי האקדמיה", "افتح بوابات الأكاديمية"),
  "academy.success": T("Wonderful!", "מצוין!", "رائع!"),
  "academy.tryAgain": T("Try again", "נסו שוב", "حاول مرة أخرى"),
  "academy.medal": T("Golden Medal earned!", "זכיתם במדליה זהב!", "حصلت على الميدالية الذهبية!"),
  "academy.narration.1": T("Good morning, explorers!", "בוקר טוב, חוקרים!", "صباح الخير أيها المستكشفون!"),
  "academy.narration.3": T("Let's tidy the room together.", "בואו נסדר את החדר יחד.", "لنرتب الغرفة معاً."),
  "academy.narration.5": T("The kitchen teaches us safety.", "המטבח מלמד אותנו בטיחות.", "المطبخ يعلّمنا السلامة."),
  "academy.narration.7": T("Wait for the green light to cross.", "חכו לרמזור הירוק.", "انتظر الضوء الأخضر للعبور."),
  "academy.narration.10": T("Fractions taste sweet at the market.", "שברים מתוקים בשוק.", "الكسور حلوة في السوق."),
  "academy.narration.15": T("Pixel needs your logic to reach the battery.", "פיקסל צריך את הלוגיקה שלכם.", "يحتاج بيكسل منطقك للوصول إلى البطارية."),
  "academy.narration.20": T("The heart beats faster when we move and play.", "הלב פועם מהר יותר כשאנחנו זזים.", "ينبض القلب أسرع عندما نتحرك ونلعب."),
  "academy.narration.25": T("Plants drink light and grow toward the sun.", "צמחים שותים אור וגדלים לעבר השמש.", "تشرب النباتات الضوء وتنمو نحو الشمس."),
  "academy.narration.30": T("Every animal has a home that fits its needs.", "לכל חיה יש בית שמתאים לה.", "لكل حيوان منزل يناسب احتياجاته."),
  "academy.narration.40": T("Rhythm is math you can feel with your body.", "קצב הוא מתמטיקה שמרגישים בגוף.", "الإيقاع رياضيات تشعر بها بجسمك."),
  "academy.narration.50": T("Kind words help friends feel seen and safe.", "מילים טובות עוזרות לחברים להרגיש בטוחים.", "الكلمات اللطيفة تساعد الأصدقاء على الشعور بالأمان."),
  "academy.narration.60": T("Letters sparkle like stars waiting to be read.", "אותיות נוצצות כמו כוכבים שמחכים לקריאה.", "الحروف تتلألأ كالنجوم في انتظار القراءة."),
  "academy.narration.70": T("Three locks guard the path to graduation.", "שלושה מנעולים שומרים על דרך הסיום.", "ثلاثة أقفال تحرس طريق التخرج."),
  "academy.narration.90": T("You did it! The academy celebrates you.", "עשיתם את זה! האקדמיה חוגגת אתכם.", "أنجزتها! الأكاديمية تحتفل بك."),
  "academy.hud.play": T("Play", "נגן", "تشغيل"),
  "academy.hud.pause": T("Pause", "השהה", "إيقاف"),
  "academy.hud.cinematic": T("Cinematic", "קולנועי", "سينمائي"),
  "academy.hud.interactive": T("Explore", "חקור", "استكشف"),
  "academy.hud.tapToPlay": T("Tap the glowing beacon to play", "לחצו על המשואה הזוהרת", "اضغط على المنارة المضيئة للعب"),
  "academy.prompt.citrus": T("Count and slice oranges at the market", "ספרו ופרסו תפוזים בשוק", "عدّ وقطّع البرتقال في السوق"),
  "academy.prompt.logic": T("Solve puzzles with Pixel the robot", "פתרו חידות עם הרובוט פיקסל", "حل الألغاز مع الروبوت بيكسل"),
  "academy.prompt.anatomy": T("Discover how the body works", "גלו איך הגוף עובד", "اكتشف كيف يعمل الجسم"),
  "academy.prompt.science": T("Grow plants and watch them glow", "גדלו צמחים וראו אותם זוהרים", "انمِ النباتات وشاهدها تتوهج"),
  "academy.prompt.animals": T("Meet animals in their homes", "פגשו חיות בבתי הגידול שלהן", "التقِ بالحيوانات في بيئاتها"),
  "academy.prompt.music": T("Feel the rhythm of fruit", "הרגישו את הקצב של הפירות", "اشعر بإيقاع الفاكهة"),
  "academy.prompt.feelings": T("Understand how friends feel", "הבינו איך חברים מרגישים", "افهم مشاعر الأصدقاء"),
  "academy.prompt.language": T("Spell words among the stars", "איירו מילים בין הכוכבים", "تهجَّ الكلمات بين النجوم"),
  "academy.prompt.finale": T("Unlock the gates of graduation", "פתחו את שערי הסיום", "افتح بوابات التخرج"),
};

const sceneTitleFallback = (lang: Language, scene: number, act: number): string => {
  const labels = {
    en: `Scene ${scene} · Act ${act}`,
    he: `סצנה ${scene} · מערכה ${act}`,
    ar: `المشهد ${scene} · الفصل ${act}`,
  };
  return labels[lang];
};

const narrationFallback = (lang: Language, scene: number, act: number): string => {
  const actThemes: Record<number, Record<Language, string>> = {
    1: {
      en: "Morning routines teach us care and safety.",
      he: "שגרת הבוקר מלמדת אותנו זהירות ובטיחות.",
      ar: "روتين الصباح يعلّمنا العناية والسلامة.",
    },
    2: {
      en: "Numbers and logic light up our minds.",
      he: "מספרים ולוגיקה מדליקים את המוח.",
      ar: "الأرقام والمنطق يضيئان عقولنا.",
    },
    3: {
      en: "Nature and the body are full of wonders.",
      he: "הטבע והגוף מלאים בפלאים.",
      ar: "الطبيعة والجسم مليئان بالعجائب.",
    },
    4: {
      en: "Music and feelings help us connect.",
      he: "מוזיקה ורגשות מחברים בינינו.",
      ar: "الموسيقى والمشاعر تربطنا ببعضنا.",
    },
    5: {
      en: "Together we unlock the academy gates!",
      he: "ביחד נפתח את שערי האקדמיה!",
      ar: "معاً نفتح بوابات الأكاديمية!",
    },
  };
  return actThemes[act]?.[lang] ?? actThemes[1][lang];
};

export function academyT(lang: Language, key: string, vars?: Record<string, string | number>): string {
  let entry = academyTranslations[key];
  if (!entry && key.startsWith("academy.scene.")) {
    const scene = Number(vars?.scene ?? key.split(".").pop());
    const act = Number(vars?.act ?? 1);
    return sceneTitleFallback(lang, scene, act);
  }
  if (!entry && key.startsWith("academy.narration.")) {
    const scene = Number(vars?.scene ?? key.split(".").pop());
    const act = Number(vars?.act ?? Math.ceil(scene / 18));
    return narrationFallback(lang, scene, act);
  }
  let text = entry?.[lang] ?? entry?.en ?? key;
  if (vars) {
    Object.entries(vars).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, String(v));
    });
  }
  return text;
}
