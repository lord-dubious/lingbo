export const ADULT_CURRICULUM = [
    {
      level_id: 1,
      title: "Introduction to Igbo",
      description: "Learn basic greetings and introductions.",
      lessons: [
        {
          type: "vocabulary",
          data: [
            { igbo: "Nnọ", english: "Welcome", image: "https://placehold.co/100" },
            { igbo: "Kedu", english: "Hello/How are you?", image: "https://placehold.co/100" },
            { igbo: "Aha m bụ", english: "My name is", image: "https://placehold.co/100" },
            { igbo: "Ututụ ọma", english: "Good morning", image: "https://placehold.co/100" },
          ]
        },
        {
          type: "quiz_section",
          activities: [
            {
              quiz_type: "multiple_choice_3_options",
              question: "How do you say 'Welcome'?",
              options: ["Nnọ", "Kedu", "Biko"],
              correct_answer: "Nnọ"
            },
            {
              quiz_type: "multiple_choice_3_options",
              question: "What does 'Ututụ ọma' mean?",
              options: ["Good night", "Good afternoon", "Good morning"],
              correct_answer: "Good morning"
            }
          ]
        }
      ]
    },
    {
      level_id: 2,
      title: "Family & Relations",
      description: "Words for family members.",
      lessons: [
         {
            type: "vocabulary",
            data: [
               { igbo: "Nne", english: "Mother", image: "https://placehold.co/100" },
               { igbo: "Nna", english: "Father", image: "https://placehold.co/100" },
               { igbo: "Nwanne", english: "Sibling", image: "https://placehold.co/100" }
            ]
         },
         {
             type: "quiz_section",
             activities: [
                 {
                     quiz_type: "match_picture_to_word",
                     instruction: "Select the image for 'Nne'",
                     options: ["https://placehold.co/100?text=Mom", "https://placehold.co/100?text=Dad", "https://placehold.co/100?text=Bro"],
                     correct_answer: "https://placehold.co/100?text=Mom"
                 }
             ]
         }
      ]
    }
];

export const FUN_FACTS = [
    "Igbo is spoken by over 40 million people.",
    "The Igbo week has four days: Eke, Orie, Afọ, and Nkwọ.",
    "Chinua Achebe, author of 'Things Fall Apart', wrote extensively about Igbo culture."
];

export const KIDS_GAMES = [
      { title: "Sentence Puzzle", id: 'sentence', path: "/kids/game/sentence" },
      { title: "Memory Match", id: 'memory', path: "/kids/game/memory" },
      { title: "Speed Tap", id: 'speed', path: "/kids/game/speed" },
      { title: "Word Flash", id: 'words', path: "/kids/game/words" }
];

export const KIDS_FLASHCARDS = [
    { igbo: 'Nne', english: 'Mother', image: 'https://cdn-icons-png.flaticon.com/512/320/320338.png' },
    { igbo: 'Nna', english: 'Father', image: 'https://cdn-icons-png.flaticon.com/512/320/320336.png' },
    { igbo: 'Ulo', english: 'House', image: 'https://cdn-icons-png.flaticon.com/512/619/619153.png' },
    { igbo: 'Mmiri', english: 'Water', image: 'https://cdn-icons-png.flaticon.com/512/3105/3105807.png' },
    { igbo: 'Osisi', english: 'Tree', image: 'https://cdn-icons-png.flaticon.com/512/490/490091.png' }
];

export const MEMORY_GAME_DATA = [
    { id: 1, content: '🦁', type: 'image' },
    { id: 1, content: 'Odum', type: 'text' },
    { id: 2, content: '🐘', type: 'image' },
    { id: 2, content: 'Enyi', type: 'text' },
    { id: 3, content: '🦅', type: 'image' },
    { id: 3, content: 'Ugo', type: 'text' },
    { id: 4, content: '🐢', type: 'image' },
    { id: 4, content: 'Mbe', type: 'text' },
];

export const IGBO_ALPHABET_FULL = [
        'A', 'B', 'Ch', 'D', 'E', 'F', 'G', 'Gb', 'Gh', 'Gw', 'H', 'I', 'Ị',
        'J', 'K', 'Kp', 'Kw', 'L', 'M', 'N', 'Ñ', 'Nw', 'Ny', 'O', 'Ọ', 'P',
        'R', 'S', 'Sh', 'T', 'U', 'Ụ', 'V', 'W', 'Y', 'Z'
];

export const IGBO_NUMBERS = Array.from({ length: 20 }, (_, i) => i + 1);

export const LIBRARY_BOOKS = [
    { title: "My First Igbo Book", type: "pdf", pages: 12 }
];

export const WORKBOOKS = [];
export const VIDEO_RESOURCES = [
    { title: "Learn Colors in Igbo", duration: "5:00" }
];
