import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function FortunetellerAvatar() {
  return (
    <Avatar className="w-16 h-16">
      <AvatarImage 
        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=128&h=128" 
        alt="Fortune Teller Avatar" 
      />
      <AvatarFallback>FL</AvatarFallback>
    </Avatar>
  );
}
