
import { MoodType, MoodEntry } from '@/types/mood';
import { v4 as uuidv4 } from 'uuid';

interface MockEntryTemplate {
  mood: MoodType;
  journalTemplates: string[];
}

const mockEntryTemplates: MockEntryTemplate[] = [
  {
    mood: 'happy',
    journalTemplates: [
      "Had a wonderful day today! Everything seemed to go right and I felt really positive about life.",
      "Spent time with friends and laughed until my stomach hurt. These are the moments I treasure.",
      "Accomplished a lot at work today and felt really proud of what I achieved. Feeling grateful.",
      "Beautiful weather today, went for a walk in the park and felt so alive and energized.",
      "Had a great conversation with a colleague that really brightened my mood. People can be amazing.",
      "Finished reading a book I've been working on for weeks. Such a satisfying feeling of completion.",
      "Cooked a delicious meal for myself and enjoyed every bite. Small pleasures matter so much."
    ]
  },
  {
    mood: 'energetic',
    journalTemplates: [
      "Woke up feeling super energized and ready to take on the world! Did a morning workout and felt amazing.",
      "Had so much energy today that I tackled multiple projects and still felt like I could do more.",
      "Went for a run and felt like I could go forever. The endorphins are really kicking in.",
      "Productive day at work, ideas were flowing and I felt really creative and motivated.",
      "Tried a new fitness class today and loved the challenge. Feeling strong and capable.",
      "Spring cleaning day! Organized my entire room and felt so accomplished and refreshed.",
      "Dancing to my favorite music tonight. Movement feels so good when you're in the right mood."
    ]
  },
  {
    mood: 'calm',
    journalTemplates: [
      "Peaceful evening spent reading by the window. Sometimes quiet moments are exactly what you need.",
      "Did some meditation today and felt really centered and grounded. Inner peace is precious.",
      "Took a long, relaxing bath and let all the stress of the week melt away. Self-care is important.",
      "Spent time in nature today, just sitting and observing. The world is beautiful when you really look.",
      "Had a quiet coffee morning, no rush, no pressure. Sometimes slow living is the best living.",
      "Practiced some gentle yoga and felt my body and mind align in a really nice way.",
      "Watched the sunset today and felt a deep sense of contentment wash over me."
    ]
  },
  {
    mood: 'sad',
    journalTemplates: [
      "Feeling a bit down today. Sometimes sadness just comes and goes, and that's okay.",
      "Missing someone important to me today. Grief and love seem to go hand in hand sometimes.",
      "Had a difficult conversation that left me feeling emotionally drained. Need to process this.",
      "Feeling overwhelmed by everything on my plate right now. Tomorrow is a new day though.",
      "Watched a sad movie and it really hit me in the feels. Sometimes we need a good cry.",
      "Feeling disconnected from others today. Loneliness is hard but I know it will pass.",
      "Bad news from a friend today. Life can be so unpredictable and sometimes unfair."
    ]
  },
  {
    mood: 'anxious',
    journalTemplates: [
      "Feeling anxious about the big presentation tomorrow. My mind is racing with what-ifs.",
      "Couldn't shake the worry today about things that are mostly out of my control. Need to breathe.",
      "Social anxiety kicked in at the party tonight. Left early but proud of myself for trying.",
      "Deadline stress is real. Feeling the pressure but trying to take it one step at a time.",
      "Health anxiety flared up today after reading too much online. Need to limit my research.",
      "Feeling nervous about upcoming changes in my life. Change is hard even when it's good.",
      "Mind won't stop racing tonight. Writing this down to try to quiet the mental chatter."
    ]
  },
  {
    mood: 'angry',
    journalTemplates: [
      "Really frustrated with a situation at work today. Feeling like my voice isn't being heard.",
      "Got stuck in traffic for hours and it just set the tone for a really irritating day.",
      "Had an argument with someone close to me. Anger and love can coexist in confusing ways.",
      "Feeling angry about injustices I see in the world. Sometimes righteous anger is necessary.",
      "Technology failed me at the worst possible moment today. So incredibly frustrating.",
      "Feeling mad at myself for procrastinating on important things. Self-directed anger is hard.",
      "Someone was really rude to me today for no reason. People can be so unnecessarily cruel."
    ]
  }
];

const getRandomTemplate = (mood: MoodType): string => {
  const templates = mockEntryTemplates.find(t => t.mood === mood)?.journalTemplates || [];
  return templates[Math.floor(Math.random() * templates.length)] || "Feeling " + mood + " today.";
};

const getRandomMood = (): MoodType => {
  const moods: MoodType[] = ['happy', 'energetic', 'calm', 'sad', 'anxious', 'angry'];
  // Weight moods to be more realistic (more positive and neutral moods)
  const weightedMoods: MoodType[] = [
    ...Array(3).fill('happy'),
    ...Array(3).fill('calm'),
    ...Array(2).fill('energetic'),
    ...Array(1).fill('sad'),
    ...Array(1).fill('anxious'),
    ...Array(1).fill('angry')
  ];
  return weightedMoods[Math.floor(Math.random() * weightedMoods.length)];
};

const getRandomTime = (date: Date): Date => {
  const hours = Math.floor(Math.random() * 14) + 8; // Between 8 AM and 10 PM
  const minutes = Math.floor(Math.random() * 60);
  const entryTime = new Date(date);
  entryTime.setHours(hours, minutes, 0, 0);
  return entryTime;
};

export const generateMockMoodEntries = (): MoodEntry[] => {
  const entries: MoodEntry[] = [];
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 3); // 3 months ago
  
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    // Random number of entries per day (1-3)
    const entriesPerDay = Math.floor(Math.random() * 3) + 1;
    
    // 20% chance of no entries on a given day (realistic)
    if (Math.random() > 0.8) {
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }
    
    const dayEntries: Date[] = [];
    
    for (let i = 0; i < entriesPerDay; i++) {
      let entryTime: Date;
      let attempts = 0;
      
      // Ensure entries are at least 2 hours apart
      do {
        entryTime = getRandomTime(currentDate);
        attempts++;
      } while (
        attempts < 10 && 
        dayEntries.some(existingTime => 
          Math.abs(entryTime.getTime() - existingTime.getTime()) < 2 * 60 * 60 * 1000
        )
      );
      
      if (attempts < 10) {
        dayEntries.push(entryTime);
        
        const mood = getRandomMood();
        const journalText = getRandomTemplate(mood);
        
        entries.push({
          id: uuidv4(),
          timestamp: new Date(entryTime),
          mood,
          journalText
        });
      }
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Sort entries by timestamp
  return entries.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
};
