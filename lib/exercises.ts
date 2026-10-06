import { kf, Motion, p, Pose, STAND } from "./figure";

export type Level = "beginner" | "intermediate" | "advanced";
export const LEVELS: Level[] = ["beginner", "intermediate", "advanced"];

export const LEVEL_LABEL: Record<Level, string> = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" };

export type Category = "warmup" | "lower" | "upper" | "core" | "cardio" | "mobility";

export const CATEGORY_LABEL: Record<Category, string> = {
  warmup: "Warm-up",
  lower: "Legs & Glutes",
  upper: "Upper Body",
  core: "Core",
  cardio: "Cardio",
  mobility: "Stretch & Mobility",
};

export const CATEGORY_TONE: Record<Category, string> = {
  warmup: "text-amber-300",
  lower: "text-pink",
  upper: "text-blue",
  core: "text-accent",
  cardio: "text-orange-400",
  mobility: "text-violet",
};

export type Exercise = {
  slug: string;
  name: string;
  category: Category;
  muscles: string[];
  difficulty: 1 | 2 | 3;
  /** "reps" counts repetitions, "time" counts seconds. */
  measure: "reps" | "time";
  perSide?: boolean;
  /** Default work target per level (reps or seconds), per set. */
  target: Record<Level, number>;
  /** Approximate MET value used for calorie estimates. */
  met: number;
  summary: string;
  steps: string[];
  cues: string[];
  mistakes: string[];
  easier?: string;
  harder?: string;
  motion: Motion;
};

/* ---------------- Poses ---------------- */

const HANDS_ON_HIPS = { uaR: -28, faR: 58, uaL: -24, faL: 58 };

const squatDown = p({ torso: 145, head: 160, uaR: 95, faR: 95, uaL: 92, faL: 92, thR: 82, shR: -22, thL: 80, shL: -22 });

const plankHigh: Pose = {
  torso: 109, head: 112, uaR: 0, faR: 0, uaL: 3, faL: 3, thR: -71, shR: -71, thL: -71, shL: -71, ftR: 20, ftL: 20,
};
const pushDown: Pose = {
  torso: 95, head: 98, uaR: -60, faR: 69, uaL: -57, faL: 69, thR: -85, shR: -85, thL: -85, shL: -85, ftR: 18, ftL: 18,
};

const supineKneesBent: Pose = {
  torso: -90, chest: -90, head: -90, uaR: 92, faR: 92, uaL: 90, faL: 90, thR: 125, shR: -40, thL: 123, shL: -40,
};

const prone: Pose = {
  torso: 90, chest: 90, head: 92, uaR: 90, faR: 90, uaL: 92, faL: 92, thR: -90, shR: -90, thL: -90, shL: -90, ftR: -90, ftL: -90,
};

const quadruped: Pose = {
  torso: 100, head: 104, uaR: 18, faR: 18, uaL: 20, faL: 20, thR: 0, shR: -90, thL: 2, shL: -90, ftR: -90, ftL: -90,
};

const supineFlat: Pose = {
  torso: -90, chest: -90, head: -90, uaR: 90, faR: 90, uaL: 90, faL: 90, thR: 92, shR: 92, thL: 92, shL: 92, ftR: 180, ftL: 180,
};

const plankForearm: Pose = {
  torso: 97, head: 100, uaR: 0, faR: 90, uaL: 2, faL: 90, thR: -81, shR: -81, thL: -81, shL: -81, ftR: 15, ftL: 15,
};

/* ---------------- Library ---------------- */

export const EXERCISES: Exercise[] = [
  // ---------- Warm-up ----------
  {
    slug: "march-in-place",
    name: "March in Place",
    category: "warmup",
    muscles: ["Hip flexors", "Calves", "Heart"],
    difficulty: 1,
    measure: "time",
    target: { beginner: 40, intermediate: 40, advanced: 40 },
    met: 3.5,
    summary: "A gentle way to raise your heart rate and warm the hips before training.",
    steps: [
      "Stand tall with your feet hip-width apart.",
      "Lift one knee to hip height while swinging the opposite arm forward.",
      "Lower and repeat on the other side in a steady rhythm.",
    ],
    cues: ["Stay tall through the crown of your head", "Breathe through your nose", "Land softly on the balls of your feet"],
    mistakes: ["Leaning backward as the knee lifts", "Holding your breath"],
    harder: "Speed up into High Knees.",
    motion: {
      anchor: "hip",
      frames: [
        kf(p({ torso: 178, thR: 70, shR: 0, ftR: 80, uaR: -30, faR: 40, uaL: 35, faL: 120 }), 450, 80),
        kf(p({ torso: 178, thL: 70, shL: 0, ftL: 80, uaL: -30, faL: 40, uaR: 35, faR: 120 }), 450, 80),
      ],
    },
  },
  {
    slug: "arm-circles",
    name: "Arm Circles",
    category: "warmup",
    muscles: ["Shoulders", "Upper back"],
    difficulty: 1,
    measure: "time",
    target: { beginner: 30, intermediate: 30, advanced: 30 },
    met: 2.8,
    summary: "Big controlled circles that take the shoulders through their full range of motion.",
    steps: [
      "Stand tall with your arms long by your sides.",
      "Sweep both arms forward, up overhead, back and down in one big circle.",
      "Keep the movement smooth. Switch direction halfway through.",
    ],
    cues: ["Keep ribs down, don't arch your back", "Reach long through the fingertips"],
    mistakes: ["Shrugging the shoulders up to the ears", "Rushing the circles"],
    motion: {
      anchor: "footR",
      frames: [
        kf(p({ uaR: 0, faR: 0, uaL: 0, faL: 0 }), 550),
        kf(p({ uaR: 90, faR: 90, uaL: 90, faL: 90 }), 550),
        kf(p({ uaR: 180, faR: 180, uaL: 180, faL: 180 }), 550),
        kf(p({ uaR: -90, faR: -90, uaL: -90, faL: -90 }), 550),
      ],
    },
  },
  {
    slug: "hip-hinge",
    name: "Hip Hinge (Good Morning)",
    category: "warmup",
    muscles: ["Hamstrings", "Glutes", "Lower back"],
    difficulty: 1,
    measure: "reps",
    target: { beginner: 10, intermediate: 12, advanced: 15 },
    met: 3,
    summary: "Teaches the hinge pattern and warms up the whole back of the body.",
    steps: [
      "Stand with feet hip-width apart and a soft bend in the knees.",
      "Push your hips straight back as your chest tips forward, keeping your back flat.",
      "Stop when you feel a stretch in the hamstrings, then squeeze your glutes to stand tall.",
    ],
    cues: ["Hips back, not down", "Long spine from head to tailbone"],
    mistakes: ["Rounding the lower back", "Bending the knees into a squat"],
    motion: {
      anchor: "footR",
      frames: [
        kf(p({ uaR: 4, faR: 8, uaL: -2, faL: 2 }), 900, 150),
        kf(p({ torso: 98, head: 104, uaR: 4, faR: 6, uaL: 6, faL: 8, thR: -12, shR: 2, thL: -12, shL: 2 }), 900, 150),
      ],
    },
  },

  // ---------- Lower body ----------
  {
    slug: "squat",
    name: "Bodyweight Squat",
    category: "lower",
    muscles: ["Quadriceps", "Glutes", "Adductors", "Core"],
    difficulty: 1,
    measure: "reps",
    target: { beginner: 10, intermediate: 15, advanced: 20 },
    met: 5,
    summary: "The foundation of lower-body strength. Builds the legs you use to sit, stand and climb.",
    steps: [
      "Stand with feet shoulder-width apart, toes turned out slightly.",
      "Reach your arms forward and sit your hips back and down.",
      "Lower until your thighs are about parallel to the floor, keeping your heels down.",
      "Drive through your whole foot to stand back up.",
    ],
    cues: ["Knees track over your toes", "Chest proud, weight in mid-foot", "Exhale as you stand"],
    mistakes: ["Heels lifting off the floor", "Knees caving inward", "Rounding the back at the bottom"],
    easier: "Squat to a chair and stand back up.",
    harder: "Squat Jump, or pause 3 seconds at the bottom.",
    motion: { anchor: "footR", frames: [kf(STAND, 900, 150), kf(squatDown, 900, 200)] },
  },
  {
    slug: "reverse-lunge",
    name: "Reverse Lunge",
    category: "lower",
    muscles: ["Quadriceps", "Glutes", "Hamstrings"],
    difficulty: 2,
    measure: "reps",
    perSide: true,
    target: { beginner: 8, intermediate: 12, advanced: 15 },
    met: 5,
    summary: "A knee-friendly single-leg exercise that builds strength and balance on each side.",
    steps: [
      "Stand tall with your hands on your hips.",
      "Step one foot back and lower until both knees bend to about 90 degrees.",
      "Keep your front shin vertical and your torso upright.",
      "Push through the front heel to return to standing. Alternate legs.",
    ],
    cues: ["Back knee hovers just above the floor", "Front knee stays over the ankle"],
    mistakes: ["Front knee collapsing inward", "Leaning the torso forward", "Taking too short a step"],
    easier: "Hold a wall or chair for balance and lower only halfway.",
    harder: "Add a knee drive at the top of each rep.",
    motion: {
      anchor: "footR",
      anchorX: 112,
      frames: [
        kf(p(HANDS_ON_HIPS), 850, 150),
        kf(p({ ...HANDS_ON_HIPS, torso: 178, thR: 82, shR: 0, thL: -18, shL: -92, ftL: 10 }), 850, 200),
      ],
    },
  },
  {
    slug: "glute-bridge",
    name: "Glute Bridge",
    category: "lower",
    muscles: ["Glutes", "Hamstrings", "Lower back"],
    difficulty: 1,
    measure: "reps",
    target: { beginner: 12, intermediate: 15, advanced: 20 },
    met: 3.5,
    summary: "Strengthens the glutes and protects the lower back, ideal if you sit a lot.",
    steps: [
      "Lie on your back with knees bent and feet flat, hip-width apart.",
      "Press your heels into the floor and lift your hips until your body forms a straight line from shoulders to knees.",
      "Squeeze your glutes for a second at the top, then lower with control.",
    ],
    cues: ["Drive through the heels", "Ribs down, don't over-arch", "Pause and squeeze at the top"],
    mistakes: ["Pushing from the lower back instead of the glutes", "Feet too far from the hips"],
    easier: "Reduce the range and hold the top for 2 seconds.",
    harder: "Single-leg glute bridge.",
    motion: {
      anchor: "shoulder",
      anchorX: 62,
      frames: [
        kf(supineKneesBent, 800, 150),
        kf({ ...supineKneesBent, torso: -70, chest: -74, head: -86, thR: 110, shR: -18, thL: 108, shL: -18 }, 800, 450),
      ],
    },
  },
  {
    slug: "wall-sit",
    name: "Wall Sit",
    category: "lower",
    muscles: ["Quadriceps", "Glutes"],
    difficulty: 2,
    measure: "time",
    target: { beginner: 20, intermediate: 40, advanced: 60 },
    met: 4,
    summary: "An isometric hold that builds quad endurance with zero impact on the joints.",
    steps: [
      "Stand with your back against a wall and walk your feet forward.",
      "Slide down until your knees are bent to about 90 degrees.",
      "Hold with your back flat against the wall and your weight in your heels.",
    ],
    cues: ["Knees stacked over ankles", "Breathe steadily throughout"],
    mistakes: ["Hands pushing on the thighs", "Hips higher than the knees"],
    easier: "Slide down only halfway.",
    harder: "Lift one foot an inch off the floor, switching halfway.",
    motion: {
      anchor: "hip",
      anchorX: 72,
      props: [{ type: "wall", x: 63 }],
      frames: [
        kf(p({ torso: 180, uaR: 30, faR: 85, uaL: 28, faL: 85, thR: 90, shR: 0, thL: 88, shL: 0 }), 1400),
        kf(p({ torso: 180, chest: 179, uaR: 30, faR: 85, uaL: 28, faL: 85, thR: 90, shR: 0, thL: 88, shL: 0 }), 1400),
      ],
    },
  },
  {
    slug: "calf-raise",
    name: "Calf Raise",
    category: "lower",
    muscles: ["Calves", "Ankles"],
    difficulty: 1,
    measure: "reps",
    target: { beginner: 15, intermediate: 20, advanced: 25 },
    met: 2.8,
    summary: "Strong calves support your ankles, balance and every step you take.",
    steps: [
      "Stand tall, feet hip-width apart. Lightly hold a wall if needed.",
      "Rise up onto the balls of your feet as high as you can.",
      "Pause, then lower slowly back down.",
    ],
    cues: ["Lift straight up, not forward", "Take 2 seconds to lower"],
    mistakes: ["Bouncing quickly through reps", "Rolling onto the outer edge of the foot"],
    harder: "Single-leg calf raise.",
    motion: {
      anchor: "footR",
      frames: [kf(p({}), 600, 120), kf(p({ ftR: 48, ftL: 48, uaR: 4, uaL: -6 }), 600, 300)],
    },
  },
  {
    slug: "single-leg-deadlift",
    name: "Single-Leg Deadlift",
    category: "lower",
    muscles: ["Hamstrings", "Glutes", "Core", "Balance"],
    difficulty: 2,
    measure: "reps",
    perSide: true,
    target: { beginner: 6, intermediate: 10, advanced: 12 },
    met: 4,
    summary: "Builds hamstrings and glutes while training the balance that prevents falls.",
    steps: [
      "Stand on one leg with a soft knee.",
      "Hinge forward at the hips as the free leg reaches straight back.",
      "Lower until your torso and back leg are nearly parallel to the floor.",
      "Squeeze the standing glute to return upright.",
    ],
    cues: ["Hips stay square to the floor", "Body moves like a see-saw"],
    mistakes: ["Rounding the back to reach lower", "Opening the hip of the raised leg"],
    easier: "Keep the back toes lightly on the floor like a kickstand.",
    motion: {
      anchor: "footR",
      anchorX: 118,
      frames: [
        kf(p({ thL: -6, shL: -4 }), 1000, 150),
        kf(p({ torso: 96, head: 102, uaR: 2, faR: 0, uaL: 4, faL: 2, thR: 6, shR: 0, thL: -84, shL: -84, ftL: 2 }), 1000, 250),
      ],
    },
  },

  // ---------- Upper body ----------
  {
    slug: "push-up",
    name: "Push-up",
    category: "upper",
    muscles: ["Chest", "Triceps", "Shoulders", "Core"],
    difficulty: 2,
    measure: "reps",
    target: { beginner: 6, intermediate: 12, advanced: 20 },
    met: 5,
    summary: "The best no-equipment upper-body builder. A moving plank for chest, arms and core.",
    steps: [
      "Start in a high plank with hands slightly wider than your shoulders.",
      "Brace your core so your body is one straight line from head to heels.",
      "Lower your chest toward the floor with elbows angled about 45 degrees from your body.",
      "Press the floor away to return to the top.",
    ],
    cues: ["Squeeze glutes and brace the abs", "Elbows back, not flared out", "Chest leads, hips follow"],
    mistakes: ["Hips sagging toward the floor", "Partial range of motion", "Head dropping forward"],
    easier: "Knee Push-up, or hands on a table or couch.",
    harder: "Slow 3-second lowering, or feet elevated.",
    motion: { anchor: "footR", anchorX: 42, frames: [kf(plankHigh, 800, 120), kf(pushDown, 800, 120)] },
  },
  {
    slug: "knee-push-up",
    name: "Knee Push-up",
    category: "upper",
    muscles: ["Chest", "Triceps", "Shoulders"],
    difficulty: 1,
    measure: "reps",
    target: { beginner: 8, intermediate: 12, advanced: 15 },
    met: 3.8,
    summary: "The perfect stepping stone to full push-ups with the same muscles and less load.",
    steps: [
      "Kneel and place your hands under your shoulders, then walk them forward until your body forms a line from knees to head.",
      "Lower your chest toward the floor with elbows at about 45 degrees.",
      "Press back up to straight arms.",
    ],
    cues: ["Hips stay in line with shoulders and knees", "Control the lowering"],
    mistakes: ["Bending at the hips", "Only moving the head"],
    harder: "Full Push-up.",
    motion: {
      anchor: "knee",
      anchorX: 72,
      frames: [
        kf({ torso: 125, head: 128, uaR: 0, faR: 0, uaL: 2, faL: 2, thR: -55, shR: -100, thL: -55, shL: -100, ftR: 180, ftL: 180 }, 750, 120),
        kf({ torso: 102, head: 105, uaR: -62, faR: 72, uaL: -60, faL: 72, thR: -78, shR: -100, thL: -78, shL: -100, ftR: 180, ftL: 180 }, 750, 120),
      ],
    },
  },
  {
    slug: "pike-push-up",
    name: "Pike Push-up",
    category: "upper",
    muscles: ["Shoulders", "Triceps", "Upper chest"],
    difficulty: 3,
    measure: "reps",
    target: { beginner: 5, intermediate: 8, advanced: 12 },
    met: 5,
    summary: "A bodyweight overhead press that builds strong, stable shoulders.",
    steps: [
      "Start in a downward-dog shape with hips high and hands shoulder-width apart.",
      "Bend your elbows and lower the top of your head toward the floor in front of your hands.",
      "Press back up until your arms are straight.",
    ],
    cues: ["Hips stay high throughout", "Head travels forward, making a triangle with your hands"],
    mistakes: ["Elbows flaring straight out", "Letting the hips drop into a push-up"],
    easier: "Bend the knees and reduce the depth.",
    harder: "Elevate your feet on a chair.",
    motion: {
      anchor: "footR",
      anchorX: 55,
      frames: [
        kf({ torso: 60, chest: 60, head: 40, uaR: 10, faR: 10, uaL: 12, faL: 12, thR: -15, shR: -15, thL: -15, shL: -15, ftR: 45, ftL: 45 }, 850, 120),
        kf({ torso: 45, chest: 42, head: 32, uaR: -5, faR: 59, uaL: -3, faL: 59, thR: -15, shR: -15, thL: -15, shL: -15, ftR: 45, ftL: 45 }, 850, 120),
      ],
    },
  },
  {
    slug: "superman",
    name: "Superman",
    category: "upper",
    muscles: ["Lower back", "Glutes", "Upper back"],
    difficulty: 1,
    measure: "reps",
    target: { beginner: 10, intermediate: 12, advanced: 15 },
    met: 3,
    summary: "Strengthens the whole back chain to counteract sitting and improve posture.",
    steps: [
      "Lie face down with your arms extended overhead.",
      "Squeeze your glutes and lift your arms, chest and legs a few inches off the floor.",
      "Hold for two seconds, then lower slowly.",
    ],
    cues: ["Look at the floor to keep the neck long", "Lift from the glutes and upper back"],
    mistakes: ["Cranking the neck upward", "Jerking up with momentum"],
    motion: {
      anchor: "hip",
      anchorX: 92,
      frames: [
        kf(prone, 700, 150),
        kf({ ...prone, chest: 102, head: 106, uaR: 102, faR: 104, uaL: 104, faL: 106, thR: -98, shR: -100, thL: -97, shL: -99 }, 700, 600),
      ],
    },
  },

  // ---------- Core ----------
  {
    slug: "plank",
    name: "Forearm Plank",
    category: "core",
    muscles: ["Abdominals", "Shoulders", "Glutes"],
    difficulty: 1,
    measure: "time",
    target: { beginner: 20, intermediate: 40, advanced: 60 },
    met: 3.8,
    summary: "Builds a rock-solid core that protects your spine in every other movement.",
    steps: [
      "Place your forearms on the floor with elbows under your shoulders.",
      "Step your feet back so your body is a straight line from head to heels.",
      "Brace your abs and squeeze your glutes. Hold while breathing steadily.",
    ],
    cues: ["Pull your elbows toward your toes to fire the abs", "Neck neutral, eyes on the floor"],
    mistakes: ["Hips sagging or piking up", "Holding your breath"],
    easier: "Drop to your knees.",
    harder: "Lift one foot, alternating every 5 seconds.",
    motion: {
      anchor: "footR",
      anchorX: 48,
      frames: [kf(plankForearm, 1500), kf({ ...plankForearm, chest: 98, head: 102 }, 1500)],
    },
  },
  {
    slug: "side-plank",
    name: "Side Plank",
    category: "core",
    muscles: ["Obliques", "Glute medius", "Shoulders"],
    difficulty: 2,
    measure: "time",
    perSide: true,
    target: { beginner: 15, intermediate: 25, advanced: 40 },
    met: 3.8,
    summary: "Targets the obliques and hip stabilisers that keep your pelvis level when you walk and run.",
    steps: [
      "Lie on your side with your elbow under your shoulder and legs stacked.",
      "Lift your hips so your body forms a straight line.",
      "Reach your top arm to the ceiling and hold. Switch sides.",
    ],
    cues: ["Push the floor away with your forearm", "Hips forward, don't let them drift back"],
    mistakes: ["Hips sagging", "Shoulder shrugging toward the ear"],
    easier: "Bend the bottom knee and support yourself on it.",
    harder: "Lift the top leg.",
    motion: {
      anchor: "footR",
      anchorX: 45,
      frames: [
        kf({ torso: 102.5, head: 104, uaR: 0, faR: 90, uaL: 125, faL: 140, thR: -77.5, shR: -77.5, thL: -77.5, shL: -77.5 }, 1100, 300),
        kf({ torso: 102.5, head: 108, uaR: 0, faR: 90, uaL: 180, faL: 180, thR: -77.5, shR: -77.5, thL: -77.5, shL: -77.5 }, 1100, 900),
      ],
    },
  },
  {
    slug: "dead-bug",
    name: "Dead Bug",
    category: "core",
    muscles: ["Deep abdominals", "Hip flexors"],
    difficulty: 1,
    measure: "reps",
    perSide: true,
    target: { beginner: 6, intermediate: 10, advanced: 12 },
    met: 3,
    summary: "A spine-safe core exercise that teaches you to brace while your limbs move.",
    steps: [
      "Lie on your back with arms reaching to the ceiling and knees bent at 90 degrees over your hips.",
      "Press your lower back into the floor.",
      "Slowly extend one arm overhead and the opposite leg out long, hovering above the floor.",
      "Return and switch sides.",
    ],
    cues: ["Lower back stays glued to the floor", "Exhale fully as you extend"],
    mistakes: ["Arching the lower back", "Moving too fast"],
    easier: "Move only the legs, keeping the arms still.",
    motion: {
      anchor: "hip",
      anchorX: 112,
      frames: [
        kf({ torso: -90, head: -90, uaR: 180, faR: 180, uaL: 178, faL: 178, thR: 180, shR: 90, thL: 178, shL: 90 }, 900, 120),
        kf({ torso: -90, head: -90, uaR: -100, faR: -98, uaL: 178, faL: 178, thR: 180, shR: 90, thL: 98, shL: 96 }, 900, 300),
        kf({ torso: -90, head: -90, uaR: 180, faR: 180, uaL: 178, faL: 178, thR: 180, shR: 90, thL: 178, shL: 90 }, 900, 120),
        kf({ torso: -90, head: -90, uaR: 180, faR: 180, uaL: -100, faL: -98, thR: 98, shR: 96, thL: 178, shL: 90 }, 900, 300),
      ],
    },
  },
  {
    slug: "crunch",
    name: "Crunch",
    category: "core",
    muscles: ["Rectus abdominis"],
    difficulty: 1,
    measure: "reps",
    target: { beginner: 12, intermediate: 18, advanced: 25 },
    met: 3,
    summary: "A short, controlled curl that isolates the front of the abs.",
    steps: [
      "Lie on your back with knees bent and feet flat.",
      "Reach your hands toward your knees as you curl your head and shoulder blades off the floor.",
      "Pause, then lower slowly.",
    ],
    cues: ["Curl the ribs toward the hips", "Keep a fist-sized gap under your chin"],
    mistakes: ["Yanking on the neck", "Using momentum"],
    motion: {
      anchor: "hip",
      anchorX: 105,
      frames: [
        kf(supineKneesBent, 650, 100),
        kf({ ...supineKneesBent, chest: -122, head: -132, uaR: 98, faR: 98, uaL: 96, faL: 96 }, 650, 300),
      ],
    },
  },
  {
    slug: "bird-dog",
    name: "Bird Dog",
    category: "core",
    muscles: ["Lower back", "Glutes", "Deep core", "Shoulders"],
    difficulty: 1,
    measure: "reps",
    perSide: true,
    target: { beginner: 6, intermediate: 10, advanced: 12 },
    met: 3,
    summary: "A favourite of spine researchers for building back endurance with very low disc load.",
    steps: [
      "Start on hands and knees, hands under shoulders and knees under hips.",
      "Brace your core and reach one arm forward and the opposite leg back until both are level with your body.",
      "Hold for two seconds, return, and switch sides.",
    ],
    cues: ["Imagine balancing a cup of water on your lower back", "Reach long, not high"],
    mistakes: ["Rotating the hips open", "Arching the back to lift the leg higher"],
    motion: {
      anchor: "knee",
      anchorX: 80,
      frames: [
        kf(quadruped, 800, 100),
        kf({ ...quadruped, uaR: 98, faR: 98, thL: -95, shL: -95, ftL: -100 }, 800, 600),
        kf(quadruped, 800, 100),
        kf({ ...quadruped, uaL: 98, faL: 98, thR: -95, shR: -95, ftR: -100, thL: 0 }, 800, 600),
      ],
    },
  },
  {
    slug: "leg-raise",
    name: "Lying Leg Raise",
    category: "core",
    muscles: ["Lower abs", "Hip flexors"],
    difficulty: 2,
    measure: "reps",
    target: { beginner: 8, intermediate: 12, advanced: 15 },
    met: 3.5,
    summary: "Trains the lower abdominals to control the pelvis.",
    steps: [
      "Lie on your back with legs straight and palms flat beside you.",
      "Press your lower back into the floor and lift your legs to vertical.",
      "Lower slowly, stopping just before your heels touch the floor.",
    ],
    cues: ["Lower back stays flat", "Lower for a slow 3 count"],
    mistakes: ["Lower back peeling off the floor", "Dropping the legs quickly"],
    easier: "Bend the knees to shorten the lever.",
    motion: {
      anchor: "hip",
      anchorX: 82,
      frames: [kf(supineFlat, 1000, 120), kf({ ...supineFlat, thR: 176, shR: 176, thL: 174, shL: 174, ftR: 90, ftL: 90 }, 1000, 200)],
    },
  },

  // ---------- Cardio ----------
  {
    slug: "jumping-jacks",
    name: "Jumping Jacks",
    category: "cardio",
    muscles: ["Full body", "Heart & lungs"],
    difficulty: 1,
    measure: "time",
    target: { beginner: 30, intermediate: 40, advanced: 45 },
    met: 8,
    summary: "A classic total-body cardio move to drive your heart rate up fast.",
    steps: [
      "Stand with feet together and arms by your sides.",
      "Jump your feet out wide while sweeping your arms overhead.",
      "Jump back to the start. Keep a quick, light rhythm.",
    ],
    cues: ["Land softly on the balls of your feet", "Keep a slight bend in the knees"],
    mistakes: ["Landing flat-footed and stiff-legged"],
    easier: "Step one foot out at a time instead of jumping.",
    motion: {
      view: "front",
      anchor: "hip",
      frames: [
        kf({ torso: 180, uaR: -6, faR: -3, uaL: 6, faL: 3, thR: -2, shR: 0, thL: 2, shL: 0 }, 220),
        kf({ torso: 180, uaR: -80, faR: -90, uaL: 80, faL: 90, thR: -10, shR: -8, thL: 10, shL: 8, lift: 9 }, 220),
        kf({ torso: 180, uaR: -155, faR: -168, uaL: 155, faL: 168, thR: -17, shR: -14, thL: 17, shL: 14 }, 220),
        kf({ torso: 180, uaR: -80, faR: -90, uaL: 80, faL: 90, thR: -10, shR: -8, thL: 10, shL: 8, lift: 9 }, 220),
      ],
    },
  },
  {
    slug: "high-knees",
    name: "High Knees",
    category: "cardio",
    muscles: ["Hip flexors", "Quadriceps", "Heart & lungs"],
    difficulty: 2,
    measure: "time",
    target: { beginner: 20, intermediate: 30, advanced: 40 },
    met: 8,
    summary: "Running in place with knees driving high for a fast cardio burst.",
    steps: [
      "Stand tall and start jogging in place.",
      "Drive each knee up to hip height, pumping your arms.",
      "Stay light and quick on the balls of your feet.",
    ],
    cues: ["Tall posture, don't lean back", "Fast arms make fast legs"],
    mistakes: ["Landing heavily on the heels"],
    easier: "March in Place with high knees.",
    motion: {
      anchor: "hip",
      frames: [
        kf(p({ torso: 174, thR: 92, shR: 0, ftR: 70, thL: -4, shL: -8, uaR: -40, faR: 30, uaL: 45, faL: 140, lift: 3 }), 230),
        kf(p({ torso: 174, thL: 92, shL: 0, ftL: 70, thR: -4, shR: -8, uaL: -40, faL: 30, uaR: 45, faR: 140, lift: 3 }), 230),
      ],
    },
  },
  {
    slug: "mountain-climber",
    name: "Mountain Climber",
    category: "cardio",
    muscles: ["Core", "Shoulders", "Hip flexors", "Heart & lungs"],
    difficulty: 2,
    measure: "time",
    target: { beginner: 20, intermediate: 30, advanced: 40 },
    met: 8,
    summary: "A plank that runs: raises heart rate while training the core.",
    steps: [
      "Start in a high plank with your hands under your shoulders.",
      "Drive one knee toward your chest, then switch legs quickly.",
      "Keep your hips level and core braced.",
    ],
    cues: ["Shoulders stay over wrists", "Hips low and steady"],
    mistakes: ["Hips bouncing up and down", "Hands drifting forward"],
    easier: "Step the knees in slowly, one at a time.",
    motion: {
      anchor: "handR",
      anchorX: 140,
      frames: [
        kf({ ...plankHigh, thR: 62, shR: -32, ftR: 30 }, 260, 40),
        kf({ ...plankHigh, thL: 62, shL: -32, ftL: 30 }, 260, 40),
      ],
    },
  },
  {
    slug: "squat-jump",
    name: "Squat Jump",
    category: "cardio",
    muscles: ["Quadriceps", "Glutes", "Calves"],
    difficulty: 3,
    measure: "reps",
    target: { beginner: 6, intermediate: 10, advanced: 15 },
    met: 8,
    summary: "Explosive power training that builds strength and lifts your heart rate.",
    steps: [
      "Start in a squat with arms swung back.",
      "Explode upward, swinging your arms overhead.",
      "Land softly with bent knees and sink straight into the next squat.",
    ],
    cues: ["Land quietly", "Knees track over toes on landing"],
    mistakes: ["Landing with straight, locked knees", "Knees collapsing inward"],
    easier: "Bodyweight Squat rising onto the toes.",
    motion: {
      anchor: "footR",
      frames: [
        kf(p({ torso: 145, head: 160, uaR: -40, faR: -30, uaL: -38, faL: -30, thR: 82, shR: -22, thL: 80, shL: -22 }), 380, 120),
        kf(p({ uaR: 170, faR: 175, uaL: 168, faL: 175, ftR: 30, ftL: 30, lift: 22 }), 380),
      ],
    },
  },
  {
    slug: "burpee",
    name: "Burpee",
    category: "cardio",
    muscles: ["Full body", "Heart & lungs"],
    difficulty: 3,
    measure: "reps",
    target: { beginner: 5, intermediate: 10, advanced: 15 },
    met: 8,
    summary: "The ultimate full-body conditioning move: squat, plank and jump in one.",
    steps: [
      "From standing, squat down and place your hands on the floor.",
      "Jump or step your feet back into a high plank.",
      "Jump your feet back toward your hands.",
      "Explode up into a jump with arms overhead.",
    ],
    cues: ["Brace your core in the plank", "Land softly"],
    mistakes: ["Hips sagging in the plank", "Landing with locked knees"],
    easier: "Step back and forward instead of jumping, and skip the jump at the top.",
    harder: "Add a push-up at the bottom.",
    motion: {
      anchor: "hip",
      anchorX: 92,
      frames: [
        kf(p({}), 350, 50),
        kf(p({ torso: 112, head: 120, uaR: 12, faR: 6, uaL: 14, faL: 8, thR: 78, shR: -38, thL: 76, shL: -38 }), 300, 60),
        kf(plankHigh, 300, 120),
        kf(p({ torso: 112, head: 120, uaR: 12, faR: 6, uaL: 14, faL: 8, thR: 78, shR: -38, thL: 76, shL: -38 }), 350, 40),
        kf(p({ uaR: 170, faR: 175, uaL: 168, faL: 175, ftR: 30, ftL: 30, lift: 20 }), 350),
      ],
    },
  },

  // ---------- Stretch & mobility ----------
  {
    slug: "hamstring-stretch",
    name: "Standing Forward Fold",
    category: "mobility",
    muscles: ["Hamstrings", "Calves", "Lower back"],
    difficulty: 1,
    measure: "time",
    target: { beginner: 30, intermediate: 30, advanced: 40 },
    met: 2.3,
    summary: "Releases the whole back line of the body after training.",
    steps: [
      "Stand with feet hip-width apart and a soft bend in the knees.",
      "Hinge forward and let your upper body hang toward the floor.",
      "Breathe slowly and relax a little deeper with each exhale.",
    ],
    cues: ["Let your head hang heavy", "Bend the knees as much as you need"],
    mistakes: ["Bouncing into the stretch", "Locking the knees"],
    motion: {
      anchor: "footR",
      frames: [
        kf(p({ torso: 55, chest: 45, head: 20, uaR: 25, faR: 40, uaL: 27, faL: 42, thR: -6, shR: 3, thL: -6, shL: 3 }), 2000),
        kf(p({ torso: 50, chest: 40, head: 15, uaR: 20, faR: 32, uaL: 22, faL: 34, thR: -6, shR: 3, thL: -6, shL: 3 }), 2000),
      ],
    },
  },
  {
    slug: "quad-stretch",
    name: "Standing Quad Stretch",
    category: "mobility",
    muscles: ["Quadriceps", "Hip flexors"],
    difficulty: 1,
    measure: "time",
    perSide: true,
    target: { beginner: 30, intermediate: 30, advanced: 30 },
    met: 2.3,
    summary: "Opens the front of the thighs and hips, which tighten from sitting and squatting.",
    steps: [
      "Stand tall and hold a wall or chair for balance if needed.",
      "Bend one knee and hold that ankle behind you.",
      "Draw the heel toward your glute with knees side by side. Switch legs.",
    ],
    cues: ["Tuck the pelvis slightly to deepen the stretch", "Stand tall"],
    mistakes: ["Arching the lower back", "Letting the knee drift forward"],
    motion: {
      anchor: "footL",
      frames: [
        kf(p({ thR: -8, shR: -160, ftR: -120, uaR: -22, faR: -8, uaL: 80, faL: 85, thL: 0, shL: 0 }), 2000),
        kf(p({ thR: -12, shR: -162, ftR: -120, uaR: -26, faR: -10, uaL: 82, faL: 86, thL: 0, shL: 0 }), 2000),
      ],
    },
  },
  {
    slug: "hip-flexor-stretch",
    name: "Half-Kneeling Hip Flexor Stretch",
    category: "mobility",
    muscles: ["Hip flexors", "Quadriceps"],
    difficulty: 1,
    measure: "time",
    perSide: true,
    target: { beginner: 30, intermediate: 30, advanced: 40 },
    met: 2.3,
    summary: "Undoes the tight hips that come from sitting all day.",
    steps: [
      "Kneel on one knee with the other foot flat in front of you.",
      "Squeeze the glute of the kneeling leg and gently shift your hips forward.",
      "Keep your torso tall. Hold, then switch sides.",
    ],
    cues: ["Tuck your tailbone under", "Feel it in the front of the back hip"],
    mistakes: ["Arching the lower back to fake the stretch"],
    motion: {
      anchor: "footR",
      anchorX: 122,
      frames: [
        kf(p({ uaR: 25, faR: 70, uaL: 22, faL: 70, thR: 88, shR: 2, thL: -18, shL: -90, ftL: -90 }), 1800),
        kf(p({ uaR: 30, faR: 74, uaL: 27, faL: 74, thR: 80, shR: 12, thL: -32, shL: -90, ftL: -90 }), 1800, 600),
      ],
    },
  },
  {
    slug: "cobra-stretch",
    name: "Cobra Stretch",
    category: "mobility",
    muscles: ["Abdominals", "Hip flexors", "Spine"],
    difficulty: 1,
    measure: "time",
    target: { beginner: 20, intermediate: 30, advanced: 30 },
    met: 2.3,
    summary: "A gentle back extension that opens the chest and abdominals.",
    steps: [
      "Lie face down with your hands under your shoulders.",
      "Press gently through your hands to lift your chest, keeping your hips on the floor.",
      "Relax your shoulders away from your ears and breathe.",
    ],
    cues: ["Only rise as high as is comfortable", "Keep elbows slightly bent"],
    mistakes: ["Locking the elbows and crunching the lower back"],
    motion: {
      anchor: "hip",
      anchorX: 82,
      frames: [
        kf({ ...prone, chest: 100, head: 105, uaR: -150, faR: 10, uaL: -148, faL: 12 }, 1500, 300),
        kf({ ...prone, torso: 98, chest: 160, head: 168, uaR: -50, faR: 50, uaL: -48, faL: 52 }, 1500, 1200),
      ],
    },
  },
  {
    slug: "child-pose",
    name: "Child's Pose",
    category: "mobility",
    muscles: ["Lower back", "Lats", "Hips"],
    difficulty: 1,
    measure: "time",
    target: { beginner: 30, intermediate: 40, advanced: 45 },
    met: 2,
    summary: "A restful stretch for the back and hips and a moment to bring your breathing down.",
    steps: [
      "Kneel and sit back on your heels.",
      "Fold forward and reach your arms long on the floor in front of you.",
      "Rest your forehead down and breathe deeply into your back.",
    ],
    cues: ["Sink the hips toward the heels", "Long slow exhales"],
    mistakes: ["Forcing the hips down if the knees complain"],
    motion: {
      anchor: "knee",
      anchorX: 92,
      frames: [
        kf({ torso: 75, chest: 85, head: 70, uaR: 95, faR: 92, uaL: 97, faL: 93, thR: 75, shR: -90, thL: 75, shL: -90, ftR: -90, ftL: -90 }, 2000),
        kf({ torso: 70, chest: 88, head: 72, uaR: 94, faR: 91, uaL: 96, faL: 92, thR: 72, shR: -90, thL: 72, shL: -90, ftR: -90, ftL: -90 }, 2000),
      ],
    },
  },
];

export const EXERCISE_MAP: Record<string, Exercise> = Object.fromEntries(EXERCISES.map((e) => [e.slug, e]));

export function getExercise(slug: string): Exercise {
  const e = EXERCISE_MAP[slug];
  if (!e) throw new Error(`Unknown exercise: ${slug}`);
  return e;
}

export function formatTarget(e: Exercise, amount: number) {
  const unit = e.measure === "reps" ? (amount === 1 ? "rep" : "reps") : "sec";
  return `${amount} ${unit}${e.perSide ? " / side" : ""}`;
}
