export const QUESTIONS = [
  {
    id: "skill",
    question: "Name a skill people would lie about on their resume",
    answers: [
      {
        answer: "Programming language",
        points: 16,
      },
      {
        answer: "Language",
        points: 10,
      },
      {
        answer: "Excel",
        points: 7,
      },
      {
        answer: "Communication skills",
        points: 4,
      },
    ],
  },

  {
    id: "easy_a",
    question: "Name a class subject people would take for an easy “A”",
    answers: [
      {
        answer: "Psychology",
        points: 9,
      },
      {
        answer: "Singing",
        points: 8,
      },
      {
        answer: "Art",
        points: 5,
      },
      {
        answer: "PE",
        points: 4,
      },
      {
        answer: "Communication",
        points: 4,
      },
    ],
  },

  {
    id: "lie",
    question: "Name something you would lie to your parents about in college",
    answers: [
      {
        answer: "Drugs + Alcohol",
        points: 13,
      },
      {
        answer: "Sleep",
        points: 10,
      },
      {
        answer: "Grades",
        points: 6,
      },
      {
        answer: "Friends/Relationships",
        points: 3,
      },
      {
        answer: "Skipping class",
        points: 2,
      },
    ],
  },

  {
    id: "building_hate",
    question: "Name a Tufts building people hate",
    answers: [
      {
        answer: "574",
        points: 8,
      },
      {
        answer: "Sci Tech",
        points: 7,
      },
      {
        answer: "Tisch",
        points: 7,
      },
      {
        answer: "Braker",
        points: 4,
      },
    ],
  },

  {
    id: "roommate",
    question:
      "Name something that would be annoying for your roommate to forget to do",
    answers: [
      {
        answer: "Dishes",
        points: 12,
      },
      {
        answer: "Clean",
        points: 9,
      },
      {
        answer: "Take out trash",
        points: 4,
      },
      {
        answer: "Shower",
        points: 4,
      },
      {
        answer: "Lock door",
        points: 4,
      },
    ],
  },
];

export const getCurrentQuestion = (questionId: string | null) => {
  if (questionId === null) return null;

  return QUESTIONS.find((q) => q.id === questionId)!;
};
