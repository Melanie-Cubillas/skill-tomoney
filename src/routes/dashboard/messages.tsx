import { createFileRoute } from "@tanstack/react-router";
import { Paperclip, Search, Send } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { conversations, messages } from "@/data/mock";
import { getSessionUser } from "@/lib/auth";

export const Route = createFileRoute("/dashboard/messages")({
  head: () => ({ meta: [{ title: "Mensajes - SkilltoMoney" }] }),
  component: MessagesPage,
});

function MessagesPage() {
  const user = getSessionUser();
  const role = user?.account_type === "mype" ? "client" : "freelancer";

  return (
    <DashboardShell role={role}>
      <h1 className="font-display text-3xl font-bold">Mensajes</h1>
      <Card className="mt-6 grid h-[640px] grid-cols-[280px_1fr] overflow-hidden p-0 shadow-soft">
        <div className="flex flex-col border-r border-border">
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Buscar conversacion" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conversation, index) => (
              <button
                key={conversation.id}
                className={`flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition hover:bg-muted/60 ${index === 0 ? "bg-muted/60" : ""}`}
              >
                <div className="relative">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-primary text-xs font-bold text-primary-foreground">{conversation.avatar}</div>
                  {conversation.online ? <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-success" /> : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span className="truncate">{conversation.name}</span>
                    <span className="text-[10px] font-normal text-muted-foreground">{conversation.time}</span>
                  </div>
                  <div className="truncate text-xs text-muted-foreground">{conversation.last}</div>
                </div>
                {conversation.unread > 0 ? (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-gradient-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                    {conversation.unread}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col bg-muted/20">
          <div className="flex items-center justify-between border-b border-border bg-background px-5 py-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-primary text-xs font-bold text-primary-foreground">CR</div>
              <div>
                <div className="text-sm font-semibold">Camila Rojas</div>
                <div className="text-xs text-success">Online</div>
              </div>
            </div>
            <Button size="sm" variant="outline">Ver perfil</Button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-6">
            {messages.map((message, index) => (
              <div key={`${message.time}-${index}`} className={`flex ${message.from === "me" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${message.from === "me" ? "bg-gradient-primary text-primary-foreground shadow-soft" : "border border-border bg-card"}`}>
                  {message.text}
                  <div className={`mt-1 text-[10px] ${message.from === "me" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{message.time}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 border-t border-border bg-background p-3">
            <Button size="icon" variant="ghost"><Paperclip className="h-4 w-4" /></Button>
            <Input placeholder="Escribe un mensaje..." className="flex-1" />
            <Button className="bg-gradient-primary"><Send className="h-4 w-4" /></Button>
          </div>
        </div>
      </Card>
    </DashboardShell>
  );
}
