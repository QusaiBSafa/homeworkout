import { all, Block, Routine } from "./plans";

/* ---------- Guided programs ---------- */

const mobilize = (items: string[]): Block => ({
  title: "Mobilize",
  kind: "warmup",
  note: "Slow, easy movement to loosen a stiff upper back before you strengthen it.",
  rounds: all(1),
  rest: all(5),
  roundRest: all(0),
  items,
});

const strengthen = (title: string, items: string[]): Block => ({
  title,
  kind: "circuit",
  note: "Quality over speed: hold each rep for the full count with your chin gently tucked.",
  rounds: { beginner: 1, intermediate: 2, advanced: 3 },
  rest: all(10),
  roundRest: all(30),
  items,
});

const release = (title: string, items: string[]): Block => ({
  title,
  kind: "cooldown",
  note: "Gentle stretches for the muscles that pull you forward. Breathe slowly; it should never hurt.",
  rounds: { beginner: 1, intermediate: 2, advanced: 2 },
  rest: all(5),
  roundRest: all(10),
  items,
});

export const POSTURE_ROUTINES: Routine[] = [
  {
    key: "neck-posture",
    title: "Neck Posture Routine",
    focus: "Forward head posture and text neck",
    type: "posture",
    description:
      "Strengthens the deep neck flexors and the muscles between your shoulder blades, then eases the tight chest, upper traps and base of the skull. It follows the strengthening-plus-stretching programs that improved head posture in randomized trials.",
    blocks: [
      strengthen("Strengthen", ["chin-tuck", "supine-chin-tuck", "scapular-w-squeeze", "wall-angel"]),
      release("Release", ["neck-extensor-stretch", "upper-trap-stretch", "doorway-pec-stretch"]),
    ],
  },
  {
    key: "upper-back",
    title: "Upper Back Routine",
    focus: "Rounded shoulders and upper-back kyphosis",
    type: "posture",
    description:
      "Mobilizes the stiff mid-back, then strengthens the back extensors and lower traps that hold you upright, and finishes with chest opening and posture awareness. Strengthening-focused programs like this reduced the upper-back curve in trials.",
    blocks: [
      mobilize(["cat-camel", "thoracic-extension"]),
      strengthen("Strengthen", ["prone-cobra", "prone-y-raise", "wall-angel"]),
      release("Open & reset", ["doorway-pec-stretch", "sphinx", "wall-posture-check"]),
    ],
  },
  {
    key: "full-posture",
    title: "Full Posture Routine",
    focus: "Neck and upper back together",
    type: "posture",
    description:
      "One daily session that covers both problems: mobilize the upper back, strengthen the neck and back muscles, then open the chest and practise tall posture. Most people with forward head posture also round the upper back, so this is the best place to start.",
    blocks: [
      mobilize(["cat-camel", "thoracic-extension"]),
      strengthen("Strengthen", ["chin-tuck", "prone-cobra", "prone-y-raise", "scapular-w-squeeze"]),
      release("Stretch & reset", ["doorway-pec-stretch", "neck-extensor-stretch", "wall-posture-check"]),
    ],
  },
];

/* ---------- Page content ---------- */

export type Condition = {
  key: "neck" | "back";
  name: string;
  aka: string;
  routine: string;
  what: string;
  causes: string;
  evidence: string;
  expect: string;
  exercises: string[];
};

export const CONDITIONS: Condition[] = [
  {
    key: "neck",
    name: "Neck curvature",
    aka: "Forward head posture · text neck · flattened neck curve",
    routine: "neck-posture",
    what: "Your head drifts forward of your shoulders, so the neck muscles work much harder to hold it up. Over time the normal inward curve of the neck can flatten.",
    causes:
      "Long hours looking down at phones, laptops and desks. The deep neck flexors and the muscles between the shoulder blades weaken, while the chest, upper traps and the muscles at the base of the skull tighten.",
    evidence:
      "In meta-analyses, exercise programs had a large effect on head posture and a moderate effect on neck pain. Strengthening (chin tucks, shoulder-blade squeezes) does most of the work; stretching alone has not been shown to change posture, so the stretches here are for comfort and mobility. Longer programs of 8 weeks or more tended to do better.",
    expect:
      "Better head position and neck comfort after about 6 to 10 weeks of regular practice. Exercise improves how you hold your head, but it has not been shown to restore a straightened or reversed neck curve on an X-ray (in one trial only clinic-based traction did that), so treat the X-ray curve as a question for a clinician.",
    exercises: ["chin-tuck", "supine-chin-tuck", "scapular-w-squeeze", "wall-angel", "neck-extensor-stretch", "upper-trap-stretch", "doorway-pec-stretch"],
  },
  {
    key: "back",
    name: "Hunched back",
    aka: "Rounded shoulders · postural kyphosis · upper crossed syndrome",
    routine: "upper-back",
    what: "The upper back rounds forward more than normal and the shoulders roll in. When the curve straightens as you stand tall or lie flat, it is postural and usually responds well to exercise.",
    causes:
      "Habitual slumping while sitting, weak back extensors and lower traps, and tight chest muscles that pull the shoulders forward.",
    evidence:
      "Meta-analyses show exercise reduces the kyphosis angle, with strengthening more effective than stretching alone. In one 8-week trial in young men, kyphosis fell from about 48° to 36°, and most of that gain held after a month off. The certainty of the evidence ranges from very low to moderate, so expect real but modest change.",
    expect:
      "Measurable change after 8 to 12 weeks in younger people. Older adults improve too, but more slowly and by less (about 3° after 6 months in the largest trial, average age 70). Consistency matters more than intensity.",
    exercises: ["prone-cobra", "prone-y-raise", "thoracic-extension", "cat-camel", "sphinx", "wall-angel", "doorway-pec-stretch", "wall-posture-check"],
  },
];

export const POSTURE_HABITS = [
  { title: "Little and often", text: "Do one routine every day, or at least 3 to 4 days a week. The trials that worked ran for 8 to 10 weeks." },
  { title: "Posture check-ins", text: "Set a reminder every hour: chin tuck, shoulder blades back and down, grow tall. Adding posture-awareness training made a corrective program work better in a 2022 trial." },
  { title: "Raise your screen", text: "Bring your phone and monitor up toward eye level so your head is not pulled forward for hours." },
  { title: "Strength first", text: "Stretching feels good, but in a 2024 meta-analysis only strengthening changed neck and upper-back posture." },
];

export const RED_FLAGS = [
  "Numbness, tingling, weakness or clumsiness in your arms, hands or legs",
  "Severe, worsening or constant pain, or pain at night or at rest",
  "Pain after a recent fall, accident or injury",
  "Dizziness, fainting, blurred vision, or trouble speaking or swallowing when you move your neck",
  "Fever, unexplained weight loss, or a history of cancer",
  "Osteoporosis with sudden back pain or loss of height",
  "A curve that is rigid or getting worse quickly, especially in teenagers",
  "Changes in bladder or bowel control, or problems with balance or walking",
];

export const POSTURE_DISCLAIMER =
  "These exercises are general education, not medical advice, and do not replace an assessment by a doctor or physiotherapist. They are meant for flexible, posture-related neck and upper-back problems in otherwise healthy adults. Stop if you feel sharp pain, numbness, tingling or dizziness. If you have osteoporosis, a spinal condition, a recent injury or surgery, or any of the warning signs above, check with a professional before starting. With osteoporosis, keep the rounding in cat-camel gentle and avoid loaded bending or twisting. If your curve is fixed, never force your head or arms back to the wall.";

export type PostureSource = { cite: string; finding: string; url: string };

export const POSTURE_SOURCES: PostureSource[] = [
  {
    cite: "Sheikhhoseini R, et al. J Manipulative Physiol Ther, 2018",
    finding: "Meta-analysis: therapeutic exercise had a large effect on forward head posture (craniovertebral angle) and a moderate effect on neck pain.",
    url: "https://doi.org/10.1016/j.jmpt.2018.02.002",
  },
  {
    cite: "Sepehri S, et al. BMC Musculoskeletal Disorders, 2024",
    finding: "Meta-analysis of 22 studies in people with upper crossed syndrome: exercise improves forward head posture, rounded shoulders and kyphosis.",
    url: "https://doi.org/10.1186/s12891-024-07224-4",
  },
  {
    cite: "Harman K, Hubley-Kozey CL, Butler H. J Manual & Manipulative Therapy, 2005",
    finding: "A 10-week home program of 2 strengthening exercises (deep neck flexors, shoulder retractors) and 2 stretches (neck extensors, chest) improved head posture in healthy adults.",
    url: "https://doi.org/10.1179/106698105790824888",
  },
  {
    cite: "Diab AA, Moustafa IM. Clinical Rehabilitation, 2012",
    finding: "In patients with cervical radiculopathy, adding forward head correction exercises (3 x 12 reps and 30 s stretches, 4 days a week for 10 weeks) improved head posture, pain and nerve function, with gains held at 6 months.",
    url: "https://pubmed.ncbi.nlm.nih.gov/21937526/",
  },
  {
    cite: "Falla D, et al. Physical Therapy, 2007",
    finding: "In people with chronic neck pain, 6 weeks of lying-down chin tuck (craniocervical flexion) training improved their ability to hold a neutral neck posture during computer work.",
    url: "https://doi.org/10.2522/ptj.20060009",
  },
  {
    cite: "Moustafa IM, Diab AA, Harrison DE. Journal of Clinical Medicine, 2022",
    finding: "In patients with cervical radiculopathy, the neck curve on X-ray improved only with clinic-based extension traction; the exercise-only group's curve did not change (14.6° to 14.7°).",
    url: "https://doi.org/10.3390/jcm11216515",
  },
  {
    cite: "González-Gálvez N, et al. PLoS One, 2019",
    finding: "Meta-analysis: exercise programs reduce the kyphosis angle, and strengthening appears more effective than stretching.",
    url: "https://doi.org/10.1371/journal.pone.0216180",
  },
  {
    cite: "Seidi F, et al. Scientific Reports, 2020",
    finding: "In 24 young men with upper crossed syndrome, an 8-week supervised corrective program reduced kyphosis from 47.9° to 36.3°; it was 38.2° after 4 weeks off.",
    url: "https://doi.org/10.1038/s41598-020-77571-4",
  },
  {
    cite: "Katzman WB, et al. Osteoporosis International, 2017 (SHEAF trial)",
    finding: "In 99 older adults (average age 71), 6 months of spine strengthening plus posture training reduced kyphosis by about 3° compared with no training.",
    url: "https://doi.org/10.1007/s00198-017-4109-x",
  },
  {
    cite: "Lynch SS, et al. British Journal of Sports Medicine, 2010",
    finding: "An 8-week strengthening and stretching program reduced forward head and rounded shoulder posture.",
    url: "https://doi.org/10.1136/bjsm.2009.066837",
  },
  {
    cite: "Borstad JD, Ludewig PM. J Shoulder and Elbow Surgery, 2006",
    finding: "In healthy adults, the one-arm doorway stretch lengthened the pectoralis minor more than two other common chest stretches.",
    url: "https://doi.org/10.1016/j.jse.2005.08.011",
  },
  {
    cite: "Warneke K, Lohmann LH, Wilke J. Sports Medicine - Open, 2024",
    finding: "Meta-analysis: strengthening improved neck and upper-back posture, while stretching on its own did not.",
    url: "https://doi.org/10.1186/s40798-024-00733-5",
  },
  {
    cite: "Dimitrijević V, et al. Healthcare, 2025",
    finding: "Meta-analysis of 19 studies (1,084 people): exercise reduced kyphosis with a moderate effect; programs longer than 13 weeks did best. Certainty of evidence very low to moderate.",
    url: "https://doi.org/10.3390/healthcare13141742",
  },
  {
    cite: "Elpeze G, Usgu G. Healthcare, 2022",
    finding: "In adolescents with kyphosis, adding posture-awareness training to back exercises reduced the curve by 8.9° versus 4.3° for exercises alone.",
    url: "https://doi.org/10.3390/healthcare10122478",
  },
];
