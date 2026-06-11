import { useEffect, useRef } from "react";
import { getToken } from "@/lib/auth";

const PUSHER_KEY = import.meta.env.VITE_PUSHER_APP_KEY ?? "";
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_APP_CLUSTER ?? "sa1";

type PusherEvent = {
  channel: string;
  event: string;
  data: unknown;
};

type PusherClient = {
  subscribe: (name: string) => { bind_global: (fn: (event: string, data: unknown) => void) => void };
  unsubscribe: (name: string) => void;
  disconnect: () => void;
};

declare global {
  interface Window {
    Pusher: new (key: string, config: Record<string, unknown>) => PusherClient;
  }
}

function loadPusherScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Not browser"));
      return;
    }
    if (window.Pusher) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.pusher.com/8.5/pusher.min.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Pusher"));
    document.head.appendChild(script);
  });
}

export function usePusher(
  channels: string[],
  onEvent: (event: PusherEvent) => void,
  enabled = true,
) {
  const clientRef = useRef<PusherClient | null>(null);
  const channelsRef = useRef<string[]>(channels);
  channelsRef.current = channels;

  useEffect(() => {
    if (!enabled || !PUSHER_KEY || typeof window === "undefined") return;

    let client: PusherClient | null = null;

    const init = async () => {
      try {
        await loadPusherScript();
        const instance = new window.Pusher(PUSHER_KEY, {
          cluster: PUSHER_CLUSTER,
          authEndpoint: `${import.meta.env.VITE_API_URL ?? "/api"}/broadcasting/auth`,
          auth: { headers: { Authorization: `Bearer ${getToken()}` } },
        });
        client = instance;
        clientRef.current = client;

        channelsRef.current.forEach((channelName) => {
          const channel = instance.subscribe(channelName);
          channel.bind_global((event: string, data: unknown) => {
            onEvent({ channel: channelName, event, data });
          });
        });
      } catch (e) {
        console.warn("Pusher no disponible, mensajes sin tiempo real:", e);
      }
    };

    void init();

    return () => {
      if (client) {
        channelsRef.current.forEach((name) => client!.unsubscribe(name));
        client.disconnect();
        clientRef.current = null;
      }
    };
  }, [enabled]);
}

export function getPusherKey(): string {
  return PUSHER_KEY;
}
