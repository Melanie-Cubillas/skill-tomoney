import { useEffect, useRef } from "react";
import { getToken } from "@/lib/auth";

const PUSHER_KEY = import.meta.env.VITE_PUSHER_APP_KEY ?? "";
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_APP_CLUSTER ?? "sa1";

type PusherEvent = {
  channel: string;
  event: string;
  data: unknown;
};

export function usePusher(
  channels: string[],
  onEvent: (event: PusherEvent) => void,
  enabled = true,
) {
  const pusherRef = useRef<{ disconnect: () => void; unsubscribe: (name: string) => void } | null>(null);
  const channelsRef = useRef(channels);

  channelsRef.current = channels;

  useEffect(() => {
    if (!enabled || !PUSHER_KEY || typeof window === "undefined") return;

    let pusherInstance: {
      subscribe: (name: string) => { bind_global: (fn: (event: string, data: unknown) => void) => void };
      unsubscribe: (name: string) => void;
      disconnect: () => void;
    } | null = null;

    const init = async () => {
      const PusherModule = await import("pusher-js");
      const Pusher = PusherModule.default;

      const pusher = new Pusher(PUSHER_KEY, {
        cluster: PUSHER_CLUSTER,
        authEndpoint: `${import.meta.env.VITE_API_URL ?? "/api"}/broadcasting/auth`,
        auth: {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        },
      });

      pusherInstance = pusher;

      const currentChannels = channelsRef.current;
      currentChannels.forEach((channelName) => {
        const channel = pusher.subscribe(channelName);
        channel.bind_global((event: string, data: unknown) => {
          onEvent({ channel: channelName, event, data });
        });
      });
    };

    void init();

    return () => {
      if (pusherInstance) {
        channelsRef.current.forEach((channelName) => {
          pusherInstance!.unsubscribe(channelName);
        });
        pusherInstance.disconnect();
      }
    };
  }, [enabled]);
}

export function getPusherKey(): string {
  return PUSHER_KEY;
}
