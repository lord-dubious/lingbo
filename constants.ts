
import { CurriculumLevel, Flashcard, BookResource, KidGame, VideoResource, Achievement } from './types';

export const ADULT_CURRICULUM: CurriculumLevel[] = [
  {
    level_id: 1,
    title: "Greetings (Ekele)",
    status: "completed",
    description: "Learn how to say hello and introduce yourself.",
    lessons: [
      {
        type: "vocabulary",
        data: [
          { "english": "Welcome", "igbo": "Nno", "audio_file": "nno.mp3", "image": "https://images.unsplash.com/photo-1596727147705-54a71280ddcc?auto=format&fit=crop&q=80&w=300" }, // Handshake
          { "english": "Good Morning", "igbo": "Ututu ọma", "audio_file": "ututu_oma.mp3", "image": "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&q=80&w=300" }, // Sunrise
          { "english": "How are you?", "igbo": "Kedu ka i mere?", "audio_file": "kedu.mp3", "image": "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=300" } // Two people talking
        ]
      },
      {
        type: "quiz_section",
        activities: [
          {
            quiz_type: "multiple_choice_3_options",
            question: "What is 'Good Morning' in Igbo?",
            options: ["Kedu", "Nno", "Ututu ọma"],
            correct_answer: "Ututu ọma"
          },
          {
            quiz_type: "match_picture_to_word",
            instruction: "Tap the image for 'Welcome' (Nno)",
            audio_cue: "nno.mp3",
            options: [
              "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=300", 
              "https://images.unsplash.com/photo-1596727147705-54a71280ddcc?auto=format&fit=crop&q=80&w=300", 
              "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&q=80&w=300"
            ],
            correct_answer: "https://images.unsplash.com/photo-1596727147705-54a71280ddcc?auto=format&fit=crop&q=80&w=300"
          }
        ]
      }
    ]
  },
  { 
    level_id: 2, 
    title: "Family (Ezi na Ulo)", 
    status: 'in_progress',
    description: "Words for father, mother, and siblings.",
    lessons: [
      {
        type: "vocabulary",
        data: [
          { "english": "Father", "igbo": "Nna", "audio_file": "nna.mp3", "image": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300" }, // Man portrait
          { "english": "Mother", "igbo": "Nne", "audio_file": "nne.mp3", "image": "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=300" }, // Woman portrait
          { "english": "Child", "igbo": "Nwa", "audio_file": "nwa.mp3", "image": "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=300" }, // Child
          { "english": "Siblings", "igbo": "Nwanne", "audio_file": "nwanne.mp3", "image": "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80&w=300" } // Kids playing
        ]
      },
      {
        type: "quiz_section",
        activities: [
          {
             quiz_type: "multiple_choice_3_options",
             question: "Translate 'Mother' to Igbo:",
             options: ["Nna", "Nne", "Nwa"],
             correct_answer: "Nne"
          },
          {
             quiz_type: "multiple_choice_3_options",
             question: "What does 'Nna' mean?",
             options: ["Father", "Mother", "Friend"],
             correct_answer: "Father"
          }
        ]
      }
    ]
  },
  { 
    level_id: 3, 
    title: "Food (Nri)", 
    status: 'in_progress', 
    description: "Common foods and eating.",
    lessons: [
       {
         type: "vocabulary",
         data: [
           { "english": "Water", "igbo": "Mmiri", "image": "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&q=80&w=300" },
           { "english": "Yam", "igbo": "Ji", "image": "https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?auto=format&fit=crop&q=80&w=300" }, // Sweet potatoes/Yam
           { "english": "Rice", "igbo": "Osikapa", "image": "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=300" } // Rice bowl
         ]
       },
       {
        type: "quiz_section",
        activities: [
          {
             quiz_type: "multiple_choice_3_options",
             question: "Translate 'Water' to Igbo:",
             options: ["Ji", "Mmiri", "Ofe"],
             correct_answer: "Mmiri"
          }
        ]
       }
    ]
  },
  { level_id: 4, title: "Places (Ebe Dị Iche Iche)", status: 'locked', description: "School, Market, Church, Home." },
  { level_id: 5, title: "Daily Phrases (Okwu Kwa Ubọchị)", status: 'locked', description: "Everyday conversation starters." }
];

export const KIDS_FLASHCARDS: Flashcard[] = [
  { english: "Cat", igbo: "Nwamba", image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=300", audio: "nwamba.mp3" },
  { english: "Red", igbo: "Uhie", image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=300", audio: "uhie.mp3" },
  { english: "Dog", igbo: "Nkịta", image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=300", audio: "nkita.mp3" },
  { english: "Car", igbo: "Ugbọ ala", image: "https://images.unsplash.com/photo-1532974297617-c0f05fe48bff?auto=format&fit=crop&q=80&w=300", audio: "ugboala.mp3" },
  { english: "House", igbo: "Ulo", image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=300", audio: "ulo.mp3" },
  { english: "Bird", igbo: "Nnụnụ", image: "https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&q=80&w=300", audio: "nnunu.mp3" }
];

export const KIDS_GAMES: KidGame[] = [
  {
    game_id: "sentence_builder",
    logic: "Drag puzzle blocks",
    example_round: {
      target_sentence: "The dog is eating",
      visual_aid: "https://images.unsplash.com/photo-1623800262145-2b4746f3680e?auto=format&fit=crop&q=80&w=300", // Dog eating
      scrambled_blocks: ["nri", "Nkịta", "na-eri"],
      correct_order: ["Nkịta", "na-eri", "nri"]
    }
  },
  {
    game_id: "memory_match",
    logic: "Flip cards to find pairs",
    example_round: {} 
  },
  {
    game_id: "speed_tap",
    logic: "Tap the correct image before time runs out",
    example_round: {}
  }
];

export const LIBRARY_BOOKS: BookResource[] = [
  { title: "My First Igbo Book", type: "PDF", cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200" },
  { title: "The Tortoise Tales", type: "PDF", cover: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=200" },
  { title: "Animal Kingdom", type: "PDF", cover: "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?auto=format&fit=crop&q=80&w=200" },
  { title: "Igbo Proverbs", type: "PDF", cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=200" }
];

export const VIDEO_RESOURCES: VideoResource[] = [
  { id: "1", title: "Igbo Alphabet Song", duration: "3:45", category: "Basics", thumbnail: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=300", url: "#" },
  { id: "2", title: "Common Greetings", duration: "5:12", category: "Speaking", thumbnail: "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&q=80&w=300", url: "#" },
  { id: "3", title: "Counting 1 to 100", duration: "8:30", category: "Numbers", thumbnail: "https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?auto=format&fit=crop&q=80&w=300", url: "#" },
  { id: "4", title: "Family Members", duration: "4:20", category: "Vocabulary", thumbnail: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=300", url: "#" }
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: '1', title: 'Nno!', description: 'Completed your first lesson', icon: '👋', unlocked: true },
  { id: '2', title: 'Oka Okwu', description: 'Learned 50 words', icon: '🗣️', unlocked: false },
  { id: '3', title: 'Oji', description: 'Maintained a 3-day streak', icon: '🔥', unlocked: true },
  { id: '4', title: 'Abidii', description: 'Mastered the alphabet', icon: '🔤', unlocked: false }
];

// Special keys for the floating keyboard
export const IGBO_KEYS = ["ị", "ụ", "ọ", "ṅ", "gb", "kp", "gw", "kw"];

// Full alphabet for the Sound Board
export const IGBO_ALPHABET_FULL = [
  "A", "B", "CH", "D", "E", "F", "G", "GB", "GH", "GW", "H", "I", "Ị", "J", "K", "KP", "KW", "L", "M", "N", "Ṅ", "NW", "NY", "O", "Ọ", "P", "R", "S", "SH", "T", "U", "Ụ", "V", "W", "Y", "Z"
];

// Igbo Numbers
export const IGBO_NUMBERS = [
  { number: "1", word: "Otu" },
  { number: "2", word: "Abụọ" },
  { number: "3", word: "Atọ" },
  { number: "4", word: "Anọ" },
  { number: "5", word: "Ise" },
  { number: "6", word: "Isii" },
  { number: "7", word: "Asaa" },
  { number: "8", word: "Asatọ" },
  { number: "9", word: "Itolu" },
  { number: "10", word: "Iri" },
  { number: "11", word: "Iri na otu" },
  { number: "12", word: "Iri na abụọ" },
  { number: "20", word: "Iri abụọ" },
  { number: "30", word: "Iri atọ" },
  { number: "40", word: "Iri anọ" },
  { number: "50", word: "Iri ise" },
  { number: "100", word: "Nari" }
];

// Memory Game Data Helper
export const MEMORY_GAME_DATA = [
  { id: 'cat', content: 'Nwamba', type: 'text', matchId: 'cat' },
  { id: 'cat-img', content: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=300', type: 'image', matchId: 'cat' },
  { id: 'dog', content: 'Nkịta', type: 'text', matchId: 'dog' },
  { id: 'dog-img', content: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=300', type: 'image', matchId: 'dog' },
  { id: 'bird', content: 'Nnụnụ', type: 'text', matchId: 'bird' },
  { id: 'bird-img', content: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&q=80&w=300', type: 'image', matchId: 'bird' },
  { id: 'car', content: 'Ugbọ ala', type: 'text', matchId: 'car' },
  { id: 'car-img', content: 'https://images.unsplash.com/photo-1532974297617-c0f05fe48bff?auto=format&fit=crop&q=80&w=300', type: 'image', matchId: 'car' },
];

export const WORKBOOKS = [
  { id: 'wk1', title: 'Igbo Basics Level 1', pages: 5, cover: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=300' },
  { id: 'wk2', title: 'Writing Practice', pages: 8, cover: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=300' },
  { id: 'wk3', title: 'Fun with Colors', pages: 4, cover: 'https://images.unsplash.com/photo-1502691876148-a84978e59af8?auto=format&fit=crop&q=80&w=300' }
];

export const FUN_FACTS = [
  "Did you know? The Igbo week has four days: Eke, Orie, Afọ, and Nkwọ.",
  "Igbo language uses tones to differentiate meaning. High, Low, and Mid tones matter!",
  "New Yam Festival (Iri Ji) is one of the most important cultural celebrations in Igboland.",
  "The Kola nut (Ọjị) is a symbol of hospitality and is always broken with prayer.",
  "Igbo proverbs are considered the 'palm oil with which words are eaten'."
];
