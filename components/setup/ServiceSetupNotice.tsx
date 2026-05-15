import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ServiceSetupNoticeProps {
  title: string;
  description: string;
  envVars: string[];
  className?: string;
}

export function ServiceSetupNotice({
  title,
  description,
  envVars,
  className,
}: ServiceSetupNoticeProps) {
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
          {envVars.map((envVar) => (
            <Badge key={envVar} variant="outline" className="normal-case tracking-[0.08em]">
              {envVar}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}