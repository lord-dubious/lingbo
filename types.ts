
export interface LessonItem {
  english: string;
  igbo: string;
  audio_file?: string;
  image?: string;
}

export interface QuizItem {
  quiz_type: 'match_picture_to_word' | 'multiple_choice_3_options' | 'drag_and_drop';
  instruction?: string;
  audio_cue?: string;
  question?: string;
  options?: string[];
  correct_answer?: string;
  pairs?: { source: string; target: string }[];
}

export interface Lesson {
  type: 'vocabulary' | 'quiz_section';
  data?: LessonItem[];
  activities?: QuizItem[];
}

export interface CurriculumLevel {
  level_id: number;
  title: string;
  status?: 'locked' | 'in_progress' | 'completed';
  description?: string;
  lessons?: Lesson[];
}

export interface Flashcard {
  english: string;
  igbo: string;
  image: string;
  audio: string;
}

export interface KidGame {
  game_id: string;
  logic: string;
  example_round: any;
}

export interface BookResource {
  id: string;
  title: string;
  type: string;
  cover?: string;
  content?: string; // For the simple reader
}

export interface VideoResource {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  url: string; 
  category: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export interface AnalysisResult {
  user_said_igbo: string;
  user_said_english: string;
  feedback: string;
  score: number;
}

export type ProfileType = 'adult' | 'kid';

export interface UserProfile {
  id: string;
  name: string;
  type: ProfileType;
  avatar?: string;
  joinedDate: string;
  streak: number;
  level: number;
  xp: number;
  progress?: {
    completedLessons: number[];
    gameScores: Record<string, number>;
    tutorialsSeen?: string[]; // Track seen tutorials
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}