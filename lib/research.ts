export type Source = {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  url: string;
  finding: string;
  howWeUseIt: string;
};

export const SOURCES: Source[] = [
  {
    id: "who-2020",
    title: "World Health Organization 2020 guidelines on physical activity and sedentary behaviour",
    authors: "Bull FC, et al.",
    journal: "British Journal of Sports Medicine",
    year: 2020,
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7719906/",
    finding:
      "Adults should do 150 to 300 minutes of moderate or 75 to 150 minutes of vigorous activity per week, plus muscle-strengthening work for all major muscle groups on 2 or more days. Every minute counts.",
    howWeUseIt:
      "The weekly plan includes 3 full-body strength days, 2 vigorous HIIT days, a core day and a recovery day, which together meet both the aerobic and strength targets.",
  },
  {
    id: "klika-2013",
    title: "High-intensity circuit training using body weight: maximum results with minimal investment",
    authors: "Klika B, Jordan C.",
    journal: "ACSM's Health & Fitness Journal",
    year: 2013,
    url: "https://doi.org/10.1249/FIT.0b013e31828cb1e8",
    finding:
      "A circuit of 12 bodyweight exercises, 30 seconds each with 10 seconds of rest, alternating muscle groups, delivers both aerobic and strength benefits in very little time. Repeating it 2 to 3 times is recommended.",
    howWeUseIt: "Tuesday's HIIT Circuit follows this structure, with the number of rounds and work-to-rest ratio scaled to your level.",
  },
  {
    id: "schoenfeld-2017",
    title: "Strength and hypertrophy adaptations between low- vs. high-load resistance training: a systematic review and meta-analysis",
    authors: "Schoenfeld BJ, Grgic J, Ogborn D, Krieger JW.",
    journal: "Journal of Strength and Conditioning Research",
    year: 2017,
    url: "https://journals.lww.com/nsca-jscr/fulltext/2017/12000/strength_and_hypertrophy_adaptations_between_low_.31.aspx",
    finding: "Muscle growth is similar with light and heavy loads when sets are taken close to muscular failure.",
    howWeUseIt:
      "Bodyweight training builds real muscle when the effort is high, so every strength set asks you to finish with only 1 to 3 good reps left in the tank.",
  },
  {
    id: "acsm-2009",
    title: "Progression models in resistance training for healthy adults (Position Stand)",
    authors: "American College of Sports Medicine",
    journal: "Medicine & Science in Sports & Exercise",
    year: 2009,
    url: "https://doi.org/10.1249/MSS.0b013e3181915670",
    finding:
      "Continued improvement requires progressive overload, gradually increasing the demand on the muscles, along with planned variation. Novices do well with multiple sets of 8 to 12 reps, 2 to 3 days per week.",
    howWeUseIt:
      "Your plan runs in 4-week cycles: Foundation, Build (+15%), Push (+30%) and a Recover week with one less round, then repeats. Beginner, intermediate and advanced levels change sets, reps and exercise difficulty.",
  },
  {
    id: "gillen-2016",
    title: "Twelve weeks of sprint interval training improves indices of cardiometabolic health similar to traditional endurance training despite a five-fold lower exercise volume and time commitment",
    authors: "Gillen JB, et al.",
    journal: "PLOS ONE",
    year: 2016,
    url: "https://doi.org/10.1371/journal.pone.0154075",
    finding: "Short bursts of very hard effort improved fitness and insulin sensitivity as much as 45 minutes of moderate cycling, in a fifth of the time.",
    howWeUseIt: "Friday's HIIT Power session and the Saturday finisher use short, explosive intervals for maximum benefit per minute.",
  },
  {
    id: "stamatakis-2022",
    title: "Association of wearable device-measured vigorous intermittent lifestyle physical activity with mortality",
    authors: "Stamatakis E, et al.",
    journal: "Nature Medicine",
    year: 2022,
    url: "https://doi.org/10.1038/s41591-022-02100-x",
    finding: "Even a few 1 to 2 minute bursts of vigorous activity per day were linked with substantially lower risk of death from all causes and cardiovascular disease.",
    howWeUseIt: "Short sessions still count. On a busy day, the warm-up plus one round is far better than skipping.",
  },
  {
    id: "behm-2016",
    title: "Acute effects of muscle stretching on physical performance, range of motion, and injury incidence in healthy active individuals: a systematic review",
    authors: "Behm DG, Blazevich AJ, Kay AD, McHugh M.",
    journal: "Applied Physiology, Nutrition, and Metabolism",
    year: 2016,
    url: "https://doi.org/10.1139/apnm-2015-0235",
    finding: "Long static stretches right before exercise can slightly reduce performance, while dynamic warm-ups prepare the body well. Stretching improves range of motion over time.",
    howWeUseIt: "Every session opens with a dynamic warm-up and ends with static stretches in the cool-down.",
  },
  {
    id: "mcgill",
    title: "Core training: evidence translating to better performance and injury prevention",
    authors: "McGill SM.",
    journal: "Strength and Conditioning Journal",
    year: 2010,
    url: "https://doi.org/10.1519/SSC.0b013e3181df4521",
    finding:
      "Exercises like the bird dog, side plank and curl-up build core endurance while keeping spinal loads low, which is a better approach for back health than repeated spinal flexion.",
    howWeUseIt: "Wednesday's Core & Back Health day is built around these spine-sparing exercises.",
  },
];

export const PRINCIPLES = [
  {
    title: "Strength 3x a week",
    text: "Full-body bodyweight strength training on three days exceeds the WHO minimum of two and hits every major muscle group.",
  },
  {
    title: "Effort beats equipment",
    text: "Taking sets close to failure builds muscle with bodyweight alone. Leave 1 to 3 good reps in the tank.",
  },
  {
    title: "Progressive overload",
    text: "Four-week cycles add reps and time each week, then back off so you recover and come back stronger.",
  },
  {
    title: "Recovery is training",
    text: "Alternating hard and easy days, plus a recovery day, keeps you consistent and injury-free.",
  },
];
