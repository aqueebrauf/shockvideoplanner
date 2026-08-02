import { Link } from 'react-router-dom';
import { UserCircle, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const homeViews = [
  {
    to: '/home/character-walkthrough',
    title: 'Character Walkthrough',
    description: 'Browse character plans with hooks, captions, screen sequences, and goal links.',
    icon: Users,
  },
  {
    to: '/home/this-person',
    title: 'This person',
    description:
      'Pick a goal and scroll through all This person hooks, captions, and drive links in one view.',
    icon: UserCircle,
  },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 max-w-3xl">
        {homeViews.map(({ to, title, description, icon: Icon }) => (
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
    </div>
  );
}
