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
