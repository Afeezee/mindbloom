import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, Palette, BrainCircuit, Download } from 'lucide-react';

const features = [
  {
    icon: Wand2,
    title: 'AI Story Crafting',
    description: 'Describe your idea, and our AI will write a unique, age-appropriate story for you, complete with characters and plot.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: Palette,
    title: 'Custom Illustrations',
    description: 'Bring your story to life with beautiful, AI-generated illustrations in various styles, from cartoon to watercolor.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: BrainCircuit,
    title: 'Educational Focus',
    description: 'Embed important lessons on topics like finance, morals, and mental health into engaging and memorable narratives.',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Download,
    title: 'Easy Editing & Export',
    description: 'Fine-tune your story and illustrations in our simple editor, then export your book to PDF or Word for printing or sharing.',
    color: 'from-orange-500 to-yellow-500'
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Everything You Need to Create</h2>
          <p className="max-w-2xl mx-auto mt-4 text-lg text-gray-600">
            MindBloom provides a complete toolkit to go from a simple idea to a finished, illustrated book.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full bg-gray-50/50 rounded-2xl border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-4`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}