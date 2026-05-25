export interface TranscriptLine {
  time: number;
  text: string;
}

export interface VideoItem {
  id: string;
  title: string;
  category: string;
  description: string;
  transcripts: TranscriptLine[];
}

export const getAllVideos = async (): Promise<VideoItem[]> => {
  // In a real app, this would fetch from an API or database.
  // For now, it serves as a dynamic data source that can be managed easily.
  return [
    {
      id: 'bKk_7NIKY3Y',
      title: 'Medicare Part D Changes (2025)',
      category: 'Finance & Health',
      description: 'Learn exactly what to expect with the new changes in Medicare Part D, including the out-of-pocket cap and how it affects your prescriptions.',
      transcripts: [
        { time: 0, text: "Welcome to this complete guide on Medicare Part D for the upcoming year." },
        { time: 15, text: "The biggest change is the introduction of a new $2000 out-of-pocket maximum." },
        { time: 45, text: "This means once you hit $2000, your covered prescriptions are free for the rest of the year." },
        { time: 80, text: "Let's talk about the 'donut hole' or coverage gap, which is finally going away." },
        { time: 120, text: "You will also have the option to smooth out your payments across the year." }
      ]
    },
    {
      id: 't-eYqYVzGQA',
      title: '5 Easy Exercises for Joint Mobility',
      category: 'Senior Wellness',
      description: 'A gentle, follow-along routine perfect for mornings to keep your joints healthy, lubricated, and pain-free.',
      transcripts: [
        { time: 0, text: "Good morning! Today we are doing a gentle joint mobility routine." },
        { time: 20, text: "Let's start with neck circles. Nice and slow, breathing deeply." },
        { time: 50, text: "Now moving to shoulder rolls. Backward first, opening up the chest." },
        { time: 90, text: "Next, we'll do some seated hip rotations to loosen the lower back." },
        { time: 150, text: "Remember to only go as far as feels comfortable. No pain." }
      ]
    },
    {
      id: 'uQ7gmUB_iQc',
      title: 'Smart Home Automation for Aging in Place',
      category: 'Home & Tech',
      description: 'Discover how smart lights, voice assistants, and sensors can make your home safer and more comfortable as you age.',
      transcripts: [
        { time: 0, text: "Aging in place is easier than ever thanks to smart home technology." },
        { time: 30, text: "First, let's look at smart lighting and motion sensors." },
        { time: 65, text: "These can automatically illuminate pathways at night, preventing falls." },
        { time: 100, text: "Voice assistants like Alexa or Google Home let you control everything without getting up." },
        { time: 140, text: "We'll also cover smart thermostats for consistent comfort." }
      ]
    }
  ];
};
