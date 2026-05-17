import Link from 'next/link';
import { Sparkles, Shield, Wand2, Book, Smile, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-bloom-cream to-white">
      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b border-white/60 bg-white/75 backdrop-blur-xl">
        <div className="section-shell flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 64 64" aria-hidden="true" className="h-10 w-10">
              <circle cx="32" cy="32" r="8" fill="#ffd166" />
              <ellipse cx="32" cy="14" rx="10" ry="14" fill="#9d8cf4" />
              <ellipse cx="48" cy="24" rx="10" ry="14" fill="#71d6cf" transform="rotate(40 48 24)" />
              <ellipse cx="46" cy="44" rx="10" ry="14" fill="#ff8b7b" transform="rotate(80 46 44)" />
              <ellipse cx="18" cy="42" rx="10" ry="14" fill="#ffd166" transform="rotate(130 18 42)" />
              <ellipse cx="16" cy="22" rx="10" ry="14" fill="#1e8f92" transform="rotate(-35 16 22)" />
            </svg>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-bloom-teal">MindBloom</p>
              <p className="text-sm text-slate-600">Stories kids ask for again</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/sign-in">
              <Button variant="outline" className="border-bloom-plum text-bloom-plum hover:bg-bloom-plum/10">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-bloom-plum hover:bg-bloom-plum/90">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="section-shell py-20 lg:py-32">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-bloom-plum/10 px-4 py-2 mb-6">
            <Sparkles className="h-4 w-4 text-bloom-plum" />
            <span className="text-sm font-semibold text-bloom-plum">Made for real bedtime moments</span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-bloom-ink leading-tight mb-6">
            Turn tonight into <span className="bg-gradient-to-r from-bloom-plum via-bloom-teal to-bloom-coral bg-clip-text text-transparent">story night</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 mb-8 leading-relaxed">
            Pick a theme, add a name, choose a setting, and watch a beautiful story come to life. Gentle, playful, and made to calm busy evenings.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/sign-up">
              <Button className="bg-gradient-to-r from-bloom-plum to-bloom-teal hover:shadow-bloom w-full sm:w-auto" size="lg">
                <Wand2 className="h-5 w-5 mr-2" />
                Start My First Story
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="outline" className="border-2 border-slate-300 hover:bg-slate-50 w-full sm:w-auto" size="lg">
                Already have an account?
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-shell py-16 lg:py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-bloom-ink mb-4">Why parents love MindBloom</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">Built to make evenings softer, happier, and easier</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="rounded-2xl bg-white/60 backdrop-blur p-8 border border-white/80 hover:shadow-lg transition">
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-bloom-plum to-bloom-teal flex items-center justify-center mb-4">
              <Zap className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-bloom-ink mb-3">Create in Seconds</h3>
            <p className="text-slate-600 leading-relaxed">
              Choose a theme, add your child&apos;s name, and pick a setting. Your story shows up fast and feels personal.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="rounded-2xl bg-white/60 backdrop-blur p-8 border border-white/80 hover:shadow-lg transition">
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-bloom-teal to-bloom-coral flex items-center justify-center mb-4">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-bloom-ink mb-3">100% Family-Friendly</h3>
            <p className="text-slate-600 leading-relaxed">
              Every story is warm and kid-safe. No harsh surprises, just thoughtful adventures matched to your child&apos;s age.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="rounded-2xl bg-white/60 backdrop-blur p-8 border border-white/80 hover:shadow-lg transition">
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-bloom-coral to-bloom-gold flex items-center justify-center mb-4">
              <Book className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-bloom-ink mb-3">Your Library of Memories</h3>
            <p className="text-slate-600 leading-relaxed">
              Keep the stories your family loves most. Re-read favorites anytime and build a shelf of feel-good memories.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-shell py-16 lg:py-24">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-bloom-ink mb-16 text-center">How it works</h2>

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bloom-plum text-white font-bold text-lg">
                  1
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-bloom-ink mb-2">Pick a theme</h3>
                <p className="text-slate-600 text-lg">
                  Choose adventure, friendship, wonder, or calm. Match the story to tonight&apos;s mood.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bloom-teal text-white font-bold text-lg">
                  2
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-bloom-ink mb-2">Tell us about your child</h3>
                <p className="text-slate-600 text-lg">
                  Share an age range, a name, and a place. That&apos;s enough to make the story feel special.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bloom-coral text-white font-bold text-lg">
                  3
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-bloom-ink mb-2">Sit back and listen</h3>
                <p className="text-slate-600 text-lg">
                  Open your story, read it together, and enjoy the giggles, gasps, and sleepy smiles.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonial */}
      <section className="section-shell py-16 lg:py-24 bg-gradient-to-r from-bloom-plum/5 via-bloom-teal/5 to-bloom-coral/5 rounded-3xl">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Smile key={i} className="h-6 w-6 text-bloom-gold" />
            ))}
          </div>
          <p className="text-2xl md:text-3xl font-bold text-bloom-ink mb-6 leading-relaxed">
            &ldquo;Bedtime used to be a struggle. Now my kids race to pick tonight&apos;s story.&rdquo;
          </p>
          <p className="text-lg text-slate-600">— Sarah, parent of two</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-shell py-16 lg:py-24">
        <div className="rounded-3xl bg-gradient-to-br from-bloom-plum via-bloom-teal to-bloom-coral p-12 md:p-16 text-white text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready for bedtime magic?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Create your first story in minutes and make tonight feel extra special.
          </p>
          <Link href="/sign-up">
            <Button className="bg-white text-bloom-plum hover:bg-bloom-cream font-bold text-lg" size="lg">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-24 border-t border-slate-200 bg-white/50">
        <div className="section-shell py-12 text-center text-slate-600">
          <div className="flex items-center justify-center gap-2 mb-6">
            <svg viewBox="0 0 64 64" aria-hidden="true" className="h-8 w-8">
              <circle cx="32" cy="32" r="8" fill="#ffd166" />
              <ellipse cx="32" cy="14" rx="10" ry="14" fill="#9d8cf4" />
              <ellipse cx="48" cy="24" rx="10" ry="14" fill="#71d6cf" transform="rotate(40 48 24)" />
              <ellipse cx="46" cy="44" rx="10" ry="14" fill="#ff8b7b" transform="rotate(80 46 44)" />
              <ellipse cx="18" cy="42" rx="10" ry="14" fill="#ffd166" transform="rotate(130 18 42)" />
              <ellipse cx="16" cy="22" rx="10" ry="14" fill="#1e8f92" transform="rotate(-35 16 22)" />
            </svg>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-bloom-teal">MindBloom</p>
          </div>
          <p className="mb-2 text-sm">Magical stories for magical bedtimes</p>
          <p className="text-xs text-slate-500">© 2026 MindBloom. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
