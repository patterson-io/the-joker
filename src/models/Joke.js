/**
 * Dad jokes data with safety ratings and categories
 * @type {Array<Object>}
 */
export const JOKES_DATABASE = [
  {
    id: 1,
    text: "I'm reading a book about anti-gravity. It's impossible to put down!",
    category: "science",
    rating: "family-friendly",
    tags: ["books", "physics", "wordplay"]
  },
  {
    id: 2,
    text: "Why don't scientists trust atoms? Because they make up everything!",
    category: "science",
    rating: "family-friendly",
    tags: ["chemistry", "trust", "wordplay"]
  },
  {
    id: 3,
    text: "I told my wife she was drawing her eyebrows too high. She looked surprised.",
    category: "marriage",
    rating: "family-friendly",
    tags: ["wife", "makeup", "expression"]
  },
  {
    id: 4,
    text: "Why did the scarecrow win an award? He was outstanding in his field!",
    category: "career",
    rating: "family-friendly",
    tags: ["farm", "achievement", "wordplay"]
  },
  {
    id: 5,
    text: "I used to hate facial hair, but then it grew on me.",
    category: "personal",
    rating: "family-friendly",
    tags: ["beard", "growth", "wordplay"]
  },
  {
    id: 6,
    text: "What do you call a fake noodle? An impasta!",
    category: "food",
    rating: "family-friendly",
    tags: ["pasta", "fake", "wordplay"]
  },
  {
    id: 7,
    text: "I'm on a seafood diet. I see food and I eat it.",
    category: "food",
    rating: "family-friendly",
    tags: ["diet", "eating", "wordplay"]
  },
  {
    id: 8,
    text: "Why don't programmers like nature? It has too many bugs.",
    category: "technology",
    rating: "family-friendly",
    tags: ["programming", "nature", "bugs"]
  },
  {
    id: 9,
    text: "I would avoid the sushi if I were you. It's a little fishy.",
    category: "food",
    rating: "family-friendly",
    tags: ["sushi", "suspicious", "wordplay"]
  },
  {
    id: 10,
    text: "What's the best thing about Switzerland? I don't know, but the flag is a big plus.",
    category: "geography",
    rating: "family-friendly",
    tags: ["switzerland", "flag", "wordplay"]
  }
];

/**
 * Content safety filter keywords
 * @type {Array<string>}
 */
export const CONTENT_FILTER = [
  // Add inappropriate keywords here for content filtering
];

/**
 * Joke categories with descriptions
 * @type {Object}
 */
export const JOKE_CATEGORIES = {
  science: "Science and technology jokes",
  marriage: "Marriage and relationship humor",
  career: "Work and career jokes", 
  personal: "Personal and lifestyle humor",
  food: "Food and cooking jokes",
  technology: "Tech and programming humor",
  geography: "Travel and geography jokes"
};