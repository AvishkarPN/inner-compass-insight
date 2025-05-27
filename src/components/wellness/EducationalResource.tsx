
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

interface EducationalResourceProps {
  topic: 'anxiety' | 'depression' | 'stress' | 'sleep';
  onClose: () => void;
}

const EducationalResource: React.FC<EducationalResourceProps> = ({ topic, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const resources = {
    anxiety: {
      title: "Understanding & Managing Anxiety",
      steps: [
        {
          title: "What is Anxiety?",
          content: "Anxiety is your body's natural response to stress. It's a feeling of fear or apprehension about what's to come. While some anxiety is normal, persistent anxiety that interferes with daily life may indicate an anxiety disorder.",
          tip: "Remember: Anxiety is treatable and you're not alone."
        },
        {
          title: "Common Symptoms",
          content: "Physical: Racing heart, sweating, trembling, shortness of breath. Mental: Excessive worry, difficulty concentrating, feeling restless. Behavioral: Avoiding situations, difficulty sleeping, irritability.",
          tip: "Recognizing symptoms is the first step to managing them."
        },
        {
          title: "Grounding Techniques",
          content: "5-4-3-2-1 Technique: Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste. This helps bring you back to the present moment.",
          tip: "Practice this technique when you're calm so it's easier to use during anxiety."
        },
        {
          title: "Breathing for Anxiety",
          content: "Box breathing: Inhale for 4, hold for 4, exhale for 4, hold for 4. Repeat 4-6 times. This activates your parasympathetic nervous system, promoting calm.",
          tip: "Start with shorter counts if 4 feels too long."
        },
        {
          title: "When to Seek Help",
          content: "Consider professional help if anxiety: Lasts more than 6 months, interferes with work/relationships, causes physical symptoms, or leads to avoiding important activities.",
          tip: "Therapy, especially CBT, is highly effective for anxiety disorders."
        }
      ]
    },
    depression: {
      title: "Understanding Depression",
      steps: [
        {
          title: "What is Depression?",
          content: "Depression is more than feeling sad. It's a persistent feeling of sadness and loss of interest that affects how you feel, think, and handle daily activities.",
          tip: "Depression is a medical condition, not a personal weakness."
        },
        {
          title: "Recognizing Signs",
          content: "Persistent sadness, loss of interest in activities, changes in appetite/sleep, fatigue, difficulty concentrating, feelings of worthlessness, thoughts of death.",
          tip: "Having several symptoms for 2+ weeks may indicate depression."
        },
        {
          title: "Small Steps Forward",
          content: "Start with tiny, achievable goals: Make your bed, take a shower, go for a 5-minute walk. Small accomplishments can build momentum for bigger changes.",
          tip: "Celebrate every small victory - they all count."
        },
        {
          title: "Building Support",
          content: "Reach out to trusted friends, family, or support groups. Isolation often worsens depression. Even brief social connections can help.",
          tip: "If talking feels hard, start with text messages or brief calls."
        },
        {
          title: "Professional Support",
          content: "Therapy (especially CBT and IPT) and medication can be very effective. A combination approach often works best for moderate to severe depression.",
          tip: "Recovery is possible - most people with depression get better with treatment."
        }
      ]
    },
    stress: {
      title: "Stress Management Strategies",
      steps: [
        {
          title: "Understanding Stress",
          content: "Stress is your body's reaction to challenges or threats. Short-term stress can be helpful, but chronic stress can impact your physical and mental health.",
          tip: "Some stress is normal - it's about managing it effectively."
        },
        {
          title: "Identifying Stressors",
          content: "Common stressors include work pressures, financial concerns, relationship issues, health problems, and major life changes. Awareness helps you develop coping strategies.",
          tip: "Keep a stress diary to identify patterns and triggers."
        },
        {
          title: "Time Management",
          content: "Prioritize tasks, break large projects into smaller steps, set realistic deadlines, and learn to say 'no' to non-essential commitments.",
          tip: "Use the 'urgent vs important' matrix to prioritize effectively."
        },
        {
          title: "Relaxation Techniques",
          content: "Progressive muscle relaxation: Tense and release muscle groups starting from your toes. Mindfulness meditation: Focus on the present moment without judgment.",
          tip: "Practice relaxation techniques daily, not just when stressed."
        },
        {
          title: "Lifestyle Changes",
          content: "Regular exercise, adequate sleep (7-9 hours), balanced nutrition, limiting caffeine/alcohol, and maintaining social connections all help manage stress.",
          tip: "Small, consistent changes are more sustainable than dramatic overhauls."
        }
      ]
    },
    sleep: {
      title: "Better Sleep Hygiene",
      steps: [
        {
          title: "Why Sleep Matters",
          content: "Quality sleep is essential for mental health, emotional regulation, immune function, and cognitive performance. Poor sleep can worsen anxiety and depression.",
          tip: "Adults need 7-9 hours of sleep per night for optimal health."
        },
        {
          title: "Sleep Environment",
          content: "Keep your bedroom cool (60-67°F), dark, and quiet. Invest in comfortable bedding and consider blackout curtains or a white noise machine.",
          tip: "Your bedroom should be for sleep and intimacy only."
        },
        {
          title: "Pre-Sleep Routine",
          content: "Start winding down 1 hour before bed. Try reading, gentle stretching, meditation, or taking a warm bath. Avoid screens or stimulating activities.",
          tip: "Consistency is key - try to go to bed and wake up at the same time daily."
        },
        {
          title: "Daytime Habits",
          content: "Get morning sunlight, exercise regularly (but not close to bedtime), limit caffeine after 2 PM, and avoid large meals 3 hours before sleep.",
          tip: "What you do during the day significantly impacts nighttime sleep."
        },
        {
          title: "Managing Sleep Anxiety",
          content: "If you can't fall asleep within 20 minutes, get up and do a quiet activity until sleepy. Practice the 4-7-8 breathing technique in bed.",
          tip: "Don't watch the clock - it increases anxiety about not sleeping."
        }
      ]
    }
  };

  const resource = resources[topic];
  const currentStepData = resource.steps[currentStep];
  const progress = ((currentStep + 1) / resource.steps.length) * 100;

  const handleNext = () => {
    if (currentStep < resource.steps.length - 1) {
      setCompletedSteps([...completedSteps, currentStep]);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setCompletedSteps([...completedSteps, currentStep]);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          {resource.title}
        </CardTitle>
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {resource.steps.length}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline">{currentStepData.title}</Badge>
            {completedSteps.includes(currentStep) && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="text-blue-900 leading-relaxed">
              {currentStepData.content}
            </p>
          </div>

          <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
            <p className="text-yellow-800 text-sm font-medium">
              💡 {currentStepData.tip}
            </p>
          </div>
        </div>

        <div className="flex justify-between">
          <div className="flex gap-2">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
            {!completedSteps.includes(currentStep) && (
              <Button onClick={handleComplete} variant="outline">
                Mark Complete
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handlePrevious} 
              variant="outline" 
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button 
              onClick={handleNext} 
              disabled={currentStep === resource.steps.length - 1}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>

        {currentStep === resource.steps.length - 1 && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-green-800 font-medium">
              🎉 Great job completing this educational module! 
              Remember, knowledge is most powerful when applied consistently.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EducationalResource;
