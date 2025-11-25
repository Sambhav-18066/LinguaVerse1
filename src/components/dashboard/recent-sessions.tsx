import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const sessions = [
  {
    name: 'Agentic AI',
    mode: 'Topic: Travel',
    duration: '15 min',
  },
  {
    name: 'Peer-to-Peer',
    mode: 'With Alex Ray',
    duration: '30 min',
  },
  {
    name: 'Non-Agentic AI',
    mode: 'Topic: Food',
    duration: '10 min',
  },
  {
    name: 'Assessment',
    mode: 'Post-test',
    duration: '5 min',
  },
  {
    name: 'Agentic AI',
    mode: 'Topic: Hobbies',
    duration: '20 min',
  },
];

export function RecentSessions() {
  const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar-1');

  return (
    <div className="space-y-6">
      {sessions.map((session, index) => (
        <div key={index} className="flex items-center">
          <Avatar className="h-9 w-9">
            {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="Avatar" data-ai-hint="person face" />}
            <AvatarFallback>{session.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{session.name}</p>
            <p className="text-sm text-muted-foreground">{session.mode}</p>
          </div>
          <div className="ml-auto font-medium">{session.duration}</div>
        </div>
      ))}
    </div>
  );
}
