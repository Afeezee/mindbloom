import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { clerkSetupMessage } from '@/lib/clerk-client';
import { cn } from '@/lib/utils';

interface ClerkSetupNoticeProps {
  title?: string;
  description?: string;
  className?: string;
}

export function ClerkSetupNotice({
  title = 'Clerk authentication is not configured.',
  description = 'MindBloom can run for UI and build validation without Clerk, but sign-in, protected routes, and saved stories stay disabled until real keys are configured.',
  className,
}: ClerkSetupNoticeProps) {
  return (
    <Card className={cn('mx-auto max-w-3xl border border-bloom-plum/20 bg-white/90', className)}>
      <CardHeader>
        <Badge variant="gold" className="w-fit">
          Setup required
        </Badge>
        <CardTitle className="text-3xl">{title}</CardTitle>
        <CardDescription className="max-w-2xl text-base leading-7">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="normal-case tracking-[0.08em]">
            NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
          </Badge>
          <Badge variant="outline" className="normal-case tracking-[0.08em]">
            CLERK_SECRET_KEY
          </Badge>
        </div>
        <p className="text-sm leading-7 text-slate-600">{clerkSetupMessage}</p>
      </CardContent>
    </Card>
  );
}