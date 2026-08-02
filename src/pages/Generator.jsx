import { Link } from 'react-router-dom';
import { UserCircle, Users } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const generators = [
  {
    to: '/generator/character-walkthrough',
    title: 'Character Walkthrough',
    description:
      'Combine a hook, goals, and characters with screen sequences to draft full reel plans with AI captions.',
    icon: Users,
  },
  {
    to: '/generator/this-person',
    title: 'This person',
    description:
      'Generate hook, caption, and hashtag pairs for a goal — saved to the This person resource table.',
    icon: UserCircle,
  },
];

export default function Generator() {
  return (
    <>
      <PageHeader
        title="Generator"
        description="Choose a generator style to create reel content."
      />

      <div className="grid gap-4 sm:grid-cols-2 max-w-3xl">
        {generators.map(({ to, title, description, icon: Icon }) => (
          <Link key={to} to={to} className="block h-full">
            <Card className="h-full transition-colors hover:border-primary/50 hover:bg-muted/30">
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-muted">
                  <Icon className="size-5" />
                </div>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-sm font-medium text-primary">Open →</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
