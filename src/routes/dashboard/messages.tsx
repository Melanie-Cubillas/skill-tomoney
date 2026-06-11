import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Search, Send, User } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api, type ConversationItem, type MessageItem } from "@/lib/api";
import { getSessionUser, getToken } from "@/lib/auth";
import { usePusher } from "@/hooks/use-pusher";

export const Route = createFileRoute("/dashboard/messages")({
  head: () => ({ meta: [{ title: "Mensajes - SkilltoMoney" }] }),
  validateSearch: (search: Record<string, string | undefined>) => ({
    conversation: search.conversation ? Number(search.conversation) : undefined,
  }),
  component: MessagesPage,
});

function MessagesPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: Route.id });
  const token = getToken();
  const user = getSessionUser();
  const role = user?.account_type === "mype" ? "client" : "freelancer";

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const selectedConv = conversations.find((c) => c.id === selectedId);

  const loadConversations = useCallback(async () => {
    if (!token) return;
    setLoadingList(true);
    try {
      const res = await api.getConversations(token);
      setConversations(res.data?.conversations ?? []);
    } catch {
      setConversations([]);
    } finally {
      setLoadingList(false);
    }
  }, [token]);

  const loadMessages = useCallback(
    async (convId: number) => {
      if (!token) return;
      setLoadingMessages(true);
      try {
        const res = await api.getConversation(token, convId);
        setMessages(res.data?.messages ?? []);
      } catch {
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    },
    [token],
  );

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (search.conversation && search.conversation !== selectedId) {
      setSelectedId(search.conversation);
    }
  }, [search.conversation]);

  useEffect(() => {
    if (selectedId) {
      void loadMessages(selectedId);
      void api.markConversationRead(token!, selectedId).catch(() => {});
    }
  }, [selectedId, loadMessages, token]);

  usePusher(
    selectedId ? [`conversation.${selectedId}`] : [],
    (event) => {
      if (event.event === "message.sent") {
        const data = event.data as { sender_user_id: number; message: string };
        if (data.sender_user_id !== user?.id) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              conversation_id: selectedId!,
              sender: { id: data.sender_user_id, name: "" },
              is_mine: false,
              message: data.message,
              read_at: null,
              created_at: new Date().toISOString(),
            },
          ]);
          void loadConversations();
        }
      }
    },
    Boolean(selectedId && token),
  );

  const selectConversation = (id: number) => {
    setSelectedId(id);
    void navigate({ to: "/dashboard/messages", search: { conversation: id }, replace: true });
  };

  const sendMessage = async () => {
    const msg = text.trim();
    if (!msg || !token || !selectedId || sending) return;
    setSending(true);
    setText("");

    const optimistic: MessageItem = {
      id: Date.now(),
      conversation_id: selectedId,
      sender: { id: user?.id ?? 0, name: user?.name ?? "" },
      is_mine: true,
      message: msg,
      read_at: null,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimistic]);

    try {
      await api.sendMessage(token, selectedId, msg);
      void loadConversations();
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  const filtered = conversations.filter(
    (c) =>
      !filter.trim() ||
      c.other_user.name.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <DashboardShell role={role}>
      <Card className="grid h-[calc(100vh-12rem)] grid-cols-[300px_1fr] overflow-hidden rounded-2xl p-0 shadow-soft">
        <div className="flex flex-col border-r border-border">
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="rounded-xl pl-9"
                placeholder="Buscar conversacion..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
          </div>
          <div ref={listRef} className="flex-1 overflow-y-auto">
            {loadingList ? (
              <div className="grid place-items-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                {filter ? "Sin resultados" : "No tienes conversaciones aun."}
              </p>
            ) : (
              filtered.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv.id)}
                  className={`flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition hover:bg-muted/40 ${selectedId === conv.id ? "bg-muted/60" : ""}`}
                >
                  <div className="relative shrink-0">
                    {conv.other_user.photo_url ? (
                      <img
                        src={conv.other_user.photo_url}
                        alt=""
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-primary text-xs font-bold text-primary-foreground">
                        {conv.other_user.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 text-sm font-bold">
                      <span className="truncate">{conv.other_user.name}</span>
                      <span className="shrink-0 text-[10px] font-normal text-muted-foreground">
                        {formatRelativeTime(conv.last_message_at)}
                      </span>
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {conv.last_message}
                    </div>
                  </div>
                  {conv.unread_count > 0 ? (
                    <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-gradient-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                      {conv.unread_count}
                    </span>
                  ) : null}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col">
          {!selectedConv ? (
            <div className="grid flex-1 place-items-center text-sm text-muted-foreground">
              <div className="text-center">
                <User className="mx-auto h-12 w-12 text-muted-foreground/40" />
                <p className="mt-3 font-semibold">Selecciona una conversacion</p>
                <p className="text-xs">Elige un chat del panel izquierdo</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-border bg-background px-5 py-3">
                <div className="flex items-center gap-3">
                  {selectedConv.other_user.photo_url ? (
                    <img
                      src={selectedConv.other_user.photo_url}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-primary text-xs font-bold text-primary-foreground">
                      {selectedConv.other_user.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-bold">{selectedConv.other_user.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {role === "client" ? "Freelancer" : "MYPE"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto p-5">
                {loadingMessages ? (
                  <div className="grid place-items-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : messages.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No hay mensajes aun. Envia el primero.
                  </p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.is_mine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                          msg.is_mine
                            ? "bg-gradient-primary text-primary-foreground shadow-soft"
                            : "border border-border bg-card"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                        <div
                          className={`mt-1 text-[10px] ${
                            msg.is_mine ? "text-primary-foreground/60" : "text-muted-foreground"
                          }`}
                        >
                          {formatMessageTime(msg.created_at)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex items-center gap-2 border-t border-border bg-background p-3">
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 rounded-xl"
                  disabled={sending}
                />
                <Button
                  onClick={() => void sendMessage()}
                  disabled={!text.trim() || sending}
                  className="rounded-xl bg-gradient-primary"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </DashboardShell>
  );
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString("es-PE", { day: "numeric", month: "short" });
}

function formatMessageTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
}
