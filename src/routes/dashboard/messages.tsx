import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send, Search, Paperclip, Smile } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { conversations, messages } from "@/data/mock";

export const Route = createFileRoute("/dashboard/messages")({
  head: () => ({ meta: [{ title: "Mensajes · SkilltoMoney" }] }),
  component: Messages,
});

function Messages() {
  const [active, setActive] = useState(conversations[0].id);
  const conv = conversations.find(c=>c.id===active)!;
  return (
    <DashboardShell role="freelancer">
      <h1 className="font-display text-3xl font-bold">Mensajes</h1>
      <Card className="mt-6 grid h-[70vh] overflow-hidden p-0 lg:grid-cols-[320px_1fr]">
        <div className="border-r border-border bg-muted/30">
          <div className="border-b border-border p-3"><div className="flex items-center gap-2 rounded-xl bg-background px-3 py-2"><Search className="h-4 w-4 text-muted-foreground" /><input placeholder="Buscar..." className="flex-1 bg-transparent text-sm outline-none" /></div></div>
          <div className="overflow-y-auto">
            {conversations.map(c=>(
              <button key={c.id} onClick={()=>setActive(c.id)} className={`flex w-full items-center gap-3 border-b border-border/60 px-4 py-3 text-left transition ${active===c.id?"bg-accent/60":"hover:bg-muted"}`}>
                <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">{c.avatar}</div>
                <div className="min-w-0 flex-1"><div className="flex justify-between"><span className="truncate text-sm font-semibold">{c.name}</span><span className="text-xs text-muted-foreground">{c.time}</span></div><div className="truncate text-xs text-muted-foreground">{c.last}</div></div>
                {c.unread>0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">{c.unread}</span>}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-3 border-b border-border bg-background px-5 py-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">{conv.avatar}</div>
            <div><div className="text-sm font-semibold">{conv.name}</div><div className="text-xs text-success">● Online</div></div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto bg-muted/20 p-5">
            {messages.map((m,i)=>(
              <div key={i} className={`flex ${m.from==="me"?"justify-end":"justify-start"}`}>
                <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${m.from==="me"?"bg-gradient-primary text-primary-foreground":"bg-background border border-border"}`}>{m.text}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 border-t border-border bg-background p-3">
            <Button size="icon" variant="ghost"><Paperclip className="h-4 w-4" /></Button>
            <Input placeholder="Escribe un mensaje..." className="flex-1" />
            <Button size="icon" variant="ghost"><Smile className="h-4 w-4" /></Button>
            <Button className="bg-gradient-primary"><Send className="h-4 w-4" /></Button>
          </div>
        </div>
      </Card>
    </DashboardShell>
  );
}
