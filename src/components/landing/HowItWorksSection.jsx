import React from 'react';
import { Lightbulb, Wand2, BookCheck } from 'lucide-react';

const steps = [
  {
    icon: Lightbulb,
    title: '1. Spark an Idea',
    description: 'Describe your story concept, characters, and the valuable lessons you want to teach.',
  },
  {
    icon: Wand2,
    title: '2. AI Creates Magic',
    description: 'Our AI generates a complete story with a structured outline and unique illustrations for every page.',
  },
  {
    icon: BookCheck,
    title: '3. Customize & Share',
    description: 'Fine-tune the text, regenerate images, and export your masterpiece to share with the world.',
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-purple-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Create a Story in 3 Simple Steps</h2>
          <p className="max-w-2xl mx-auto mt-4 text-lg text-gray-600">
            From imagination to a finished book in just a few clicks.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border border-gray-100">
                <step.icon className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}