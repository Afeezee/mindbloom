import React from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const testimonials = [
  {
    quote: "MindBloom made my daughter the hero of her own story. Watching her face light up while reading a book we created together was a truly magical experience.",
    name: 'Sarah J.',
    role: 'Parent & Aspiring Author'
  },
  {
    quote: "As a teacher, I'm always looking for new ways to engage my students. MindBloom is a fantastic tool for creating custom stories that teach complex topics in a fun, accessible way.",
    name: 'David L.',
    role: 'Elementary School Teacher'
  },
  {
    quote: "I was amazed at how quickly I could go from a simple idea to a beautifully illustrated book. The quality of the AI-generated content is top-notch!",
    name: 'Emily R.',
    role: 'Creative Professional'
  }
];

export default function CommunityLoveSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Loved by Parents & Educators</h2>
          <p className="max-w-2xl mx-auto mt-4 text-lg text-gray-600">
            See what our community is saying about their creative journeys with MindBloom.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-0 shadow-sm">
              <CardContent className="p-8">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 italic mb-6">"{testimonial.quote}"</p>
                <div>
                  <p className="font-bold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}