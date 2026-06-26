import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <>
      <PageHeader
        title="Reel planning hub"
        description="Scripts, sequences, and instructions for editors will appear here."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Plan reels</CardTitle>
            <CardDescription>
              Review generated hooks, screen copy, and captions in the plan sheet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Use the sidebar to open Plan or jump straight to Generator to draft new rows.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shared resources</CardTitle>
            <CardDescription>
              Screens, goals, CTAs, hashtags, and caption styles stay in sync for the team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Edits save automatically — pick a resource section from the sidebar to get started.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
