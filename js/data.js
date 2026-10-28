window.KQ_DATA = {
  lessons: [
    {
      id: "home-left",
      title: "Home Row Left",
      blurb: "Rest fingers on A S D F",
      keys: "asdf",
      prompt: "asdf asdf sad fad ads dad as"
    },
    {
      id: "home-right",
      title: "Home Row Right",
      blurb: "Right hand on J K L ;",
      keys: "jkl;",
      prompt: "jkl; jkl jkk lll ;j kjl jk"
    },
    {
      id: "home-all",
      title: "Home Row Heroes",
      blurb: "Both hands together",
      keys: "asdfghjkl;",
      prompt: "asdf jkl; fall hall flask salad flags dash"
    },
    {
      id: "top-left",
      title: "Top Row Reach",
      blurb: "Q W E R T with home row",
      keys: "qwertasdf",
      prompt: "we are at a tree we read a sad tale"
    },
    {
      id: "top-right",
      title: "Top Row Right",
      blurb: "Y U I O P join the party",
      keys: "yuiop",
      prompt: "you up pip pop you pull your puppy"
    },
    {
      id: "bottom-row",
      title: "Bottom Row Boost",
      blurb: "Z X C V B N M",
      keys: "zxcvbnm",
      prompt: "mix can van cab zoom next comic"
    },
    {
      id: "easy-words",
      title: "Word Garden",
      blurb: "Short words from all rows",
      keys: "all",
      prompt: "cat dog sun hop jump play kind smile"
    },
    {
      id: "sentences",
      title: "Story Starter",
      blurb: "Type a tiny tale",
      keys: "all",
      prompt: "the fox can type fast and the kids cheer"
    },
    {
      id: "punctuation",
      title: "Comma Quest",
      blurb: "Spaces, commas, and periods",
      keys: ",.",
      prompt: "hello, friend. we type, we try, we win."
    },
    {
      id: "speed-run",
      title: "Academy Finale",
      blurb: "Prove your keyboard power",
      keys: "all",
      prompt: "brave kids type every day. practice makes a hero!"
    }
  ],
  rushWords: {
    1: ["cat", "sun", "red", "hop", "map", "fun", "dog", "hat", "run", "box"],
    2: ["tree", "jump", "play", "star", "kite", "bird", "cake", "fish", "song", "leaf"],
    3: ["happy", "brave", "magic", "cloud", "tiger", "apple", "green", "smile", "quest", "spark"],
    4: ["keyboard", "adventure", "rainbow", "castle", "dragon", "treasure", "practice", "champion"],
    5: ["fantastic", "typewriter", "wonderful", "lightning", "explorer", "kingdom"]
  },
  stages: [
    {
      id: "forest",
      title: "Sunny Forest",
      enemy: "🟢",
      enemyName: "Leaf Blob",
      flavor: "A leafy blob blocks the path. Type to squash it!",
      prompts: ["cat", "leaf", "path", "jump"],
      hp: 4
    },
    {
      id: "bridge",
      title: "Giggly Bridge",
      enemy: "🧌",
      enemyName: "Bridge Troll",
      flavor: "The troll wants a password. Type it clearly!",
      prompts: ["please", "cross", "bridge", "thank you"],
      hp: 4
    },
    {
      id: "caves",
      title: "Glowworm Caves",
      enemy: "🐛",
      enemyName: "Glow Grub",
      flavor: "Light the cave by typing shiny words.",
      prompts: ["glow", "crystal", "tunnel", "bright"],
      hp: 4
    },
    {
      id: "gates",
      title: "Castle Gates",
      enemy: "🛡️",
      enemyName: "Gate Guard",
      flavor: "The guard will open the door if your typing is true.",
      prompts: ["open sesame", "castle", "honor", "enter"],
      hp: 4
    },
    {
      id: "boss",
      title: "Typo Tower",
      enemy: "🐉",
      enemyName: "King Typo",
      flavor: "King Typo roars! Each perfect phrase lands a hit.",
      prompts: [
        "courage",
        "the brave fox types fast",
        "keyboard heroes never quit",
        "stars shine for kind kids",
        "king typo is defeated"
      ],
      hp: 5,
      boss: true
    }
  ],
  achievements: [
    { id: "first-lesson", title: "First Steps", desc: "Finish your first academy lesson." },
    { id: "home-master", title: "Home Row Hero", desc: "Complete the first three lessons." },
    { id: "scholar", title: "Academy Star", desc: "Complete every academy lesson." },
    { id: "rush-500", title: "Rush Rookie", desc: "Score 500 points in Word Rush." },
    { id: "rush-2000", title: "Rush Champion", desc: "Score 2000 points in Word Rush." },
    { id: "combo-8", title: "Combo Kid", desc: "Reach an 8x combo in Word Rush." },
    { id: "speed-30", title: "Speedy Fingers", desc: "Reach 30 WPM in a lesson or battle." },
    { id: "perfect", title: "Perfect Page", desc: "Finish a lesson with 100% accuracy." },
    { id: "trail", title: "Trailblazer", desc: "Clear the first adventure stage." },
    { id: "dragon", title: "Dragon Tamer", desc: "Defeat King Typo." },
    { id: "stars-12", title: "Star Collector", desc: "Earn 12 stars across the kingdom." },
    { id: "level-5", title: "Rising Hero", desc: "Reach player level 5." }
  ]
};
