
import React, { useState, useEffect } from "react";
import { Book } from "@/entities/Book";
import { User } from "@/entities/User"; // Import the User entity
import { InvokeLLM, GenerateImage } from "@/integrations/Core";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Heart, DollarSign, Brain, Briefcase, MessageCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

import StoryIdeaForm from "../components/create/StoryIdeaForm";
import StoryOutline from "../components/create/StoryOutline";
import GeneratingStory from "../components/create/GeneratingStory";
import StoryPreview from "../components/create/StoryPreview";

const FOCUS_TOPICS = [
  { value: "morals", label: "Morals & Values", icon: Heart, color: "from-red-400 to-pink-500", description: "Life lessons and character building" },
  { value: "finance", label: "Financial Literacy", icon: DollarSign, color: "from-green-400 to-emerald-500", description: "Money basics and saving" },
  { value: "mental_health", label: "Mental Health", icon: Brain, color: "from-purple-400 to-indigo-500", description: "Emotions and wellbeing" },
  { value: "career_awareness", label: "Career Awareness", icon: Briefcase, color: "from-blue-400 to-cyan-500", description: "Jobs and future dreams" },
  { value: "communication_skills", label: "Communication", icon: MessageCircle, color: "from-orange-400 to-yellow-500", description: "Speaking and listening" },
  { value: "other", label: "Other Topics", icon: Sparkles, color: "from-gray-400 to-gray-500", description: "Custom learning themes" }
];

const AGE_GROUPS = [
  { value: "3-5", label: "3-5 years", description: "Early learners", icon: "🌱" },
  { value: "6-8", label: "6-8 years", description: "Growing minds", icon: "🌿" },
  { value: "9-12", label: "9-12 years", description: "Independent readers", icon: "🌳" }
];

export default function CreateStory() {
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    idea: "",
    age_group: "",
    focus_topic: "",
    page_length: 6, // Added page_length
    illustration_style: "cartoon",
    print_format: "A5 Portrait"
  });
  const [storyOutline, setStoryOutline] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState(null);
  const [generationError, setGenerationError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const authenticated = await base44.auth.isAuthenticated();
      if (!authenticated) {
        base44.auth.redirectToLogin(window.location.href);
        return;
      }
      setIsCheckingAuth(false);
    } catch (error) {
      console.error("Authentication check failed:", error);
      base44.auth.redirectToLogin(window.location.href);
    }
  };

  const handleFormSubmit = async (data) => {
    setFormData(data);
    setIsGenerating(true);
    setGenerationError(null);
    setCurrentStep(2);

    try {
      const outlineResult = await InvokeLLM({
        prompt: `Create a children's story outline based on this idea: "${data.idea}"

Age group: ${data.age_group} years old
Focus topic: ${data.focus_topic}
Title: ${data.title}
Story length: ${data.page_length} pages

Please create a detailed outline that includes:
1. A brief story summary (2-3 sentences)
2. Main characters with descriptions
3. Key lessons or messages
4. A ${data.page_length}-page story structure with brief descriptions of what happens on each page

Make sure the content is age-appropriate, engaging, and educational for the specified focus topic. The story should be properly paced for ${data.page_length} pages.`,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            characters: { type: "string" },
            lessons: { type: "string" },
            pages: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  page_number: { type: "number" },
                  description: { type: "string" }
                }
              }
            }
          }
        }
      });

      setStoryOutline(outlineResult);
      setCurrentStep(3);
    } catch (error) {
      console.error("Error generating outline:", error);
      setGenerationError("Failed to create the story outline. Please try again.");
      setCurrentStep(1);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFullStory = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    setCurrentStep('generating-full');
    
    try {
      const storyResult = await InvokeLLM({
        prompt: `Based on this story outline, create full page content for a children's book:

Title: ${formData.title}
Age group: ${formData.age_group} years
Focus topic: ${formData.focus_topic}
Story length: ${formData.page_length} pages
Outline: ${JSON.stringify(storyOutline)}

Create ${formData.page_length} pages of age-appropriate content. Each page should have:
- Engaging text suitable for ${formData.age_group} year olds (2-4 sentences per page for shorter stories, 3-6 sentences for longer stories)
- A detailed illustration prompt that maintains character consistency and matches the page text
- Educational elements related to ${formData.focus_topic}

Make sure the story flows well across all ${formData.page_length} pages and teaches the intended lesson in an engaging way.`,
        response_json_schema: {
          type: "object",
          properties: {
            pages: {
              type: "array",
              items: { "type": "object", "properties": { "page_number": { "type": "number" }, "text": { "type": "string" }, "illustration_prompt": { "type": "string" } }, "required": ["page_number", "text", "illustration_prompt"] }
            },
            character_description: { type: "string" }
          },
          required: ["pages", "character_description"]
        }
      });
      
      const pagesWithImages = [];
      for (const page of storyResult.pages) {
        const imageResult = await GenerateImage({
          prompt: `${page.illustration_prompt}, ${storyResult.character_description}, ${formData.illustration_style} style`
        });
        pagesWithImages.push({ ...page, illustration_url: imageResult.url });
      }
      
      const coverResult = await GenerateImage({
        prompt: `Children's book cover for "${formData.title}". Style: ${formData.illustration_style}. Featuring: ${storyResult.character_description}. Theme: ${formData.focus_topic}. Mood is bright, cheerful, and welcoming for ages ${formData.age_group}.`
      });

      // Get current user for author name
      const currentUser = await User.me();

      const bookData = {
        ...formData,
        author_name: currentUser.full_name || currentUser.email, // Add author_name
        story_outline: JSON.stringify(storyOutline),
        pages: pagesWithImages,
        character_description: storyResult.character_description,
        status: "completed",
        cover_image_url: coverResult.url
      };

      const book = await Book.create(bookData);
      setGeneratedStory(book);
      setCurrentStep(4);
    } catch (error) {
      console.error("Error generating full story:", error);
      setGenerationError("Oops! We had trouble creating your story. The AI might be busy. Please try again in a moment.");
      setCurrentStep(3);
    } finally {
      setIsGenerating(false);
    }
  };

  const goToEditor = () => {
    if (generatedStory) {
      navigate(createPageUrl(`Editor?id=${generatedStory.id}`));
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--mindbloom-background))' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: 'hsl(var(--mindbloom-background))' }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button 
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Create Your Story
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Transform your imagination into an interactive children's book with AI-powered storytelling
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                  currentStep >= step 
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg" 
                    : "bg-gray-200 text-gray-500"
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-16 h-1 mx-2 rounded transition-colors duration-300 ${
                    currentStep > step ? "bg-gradient-to-r from-purple-600 to-pink-600" : "bg-gray-200"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <StoryIdeaForm 
                onSubmit={handleFormSubmit}
                focusTopics={FOCUS_TOPICS}
                ageGroups={AGE_GROUPS}
                generationError={generationError}
              />
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <GeneratingStory message="Creating your story outline..." />
            </motion.div>
          )}

          {currentStep === 'generating-full' && (
             <motion.div
              key="step-generating-full"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <GeneratingStory message="Crafting your story and illustrations... This might take a moment!" />
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <StoryOutline 
                outline={storyOutline}
                formData={formData}
                onContinue={generateFullStory}
                onBack={() => setCurrentStep(1)}
                isGenerating={isGenerating}
                generationError={generationError}
              />
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <StoryPreview 
                story={generatedStory}
                onEdit={goToEditor}
                onNewStory={() => {
                  setCurrentStep(1);
                  setFormData({ title: "", idea: "", age_group: "", focus_topic: "", page_length: 6, illustration_style: "cartoon", print_format: "A5 Portrait" });
                  setGeneratedStory(null);
                  setGenerationError(null);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
