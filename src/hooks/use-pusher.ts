import { useEffect, useRef } from "react";
import Pusher from "pusher-js";
import { getToken } from "@/lib/auth";

const PUSHER_KEY = import.meta.env.VITE_PUSHER_APP_KEY ?? "";
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_APP_CLUSTER ?? "mt1";

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
  const pusherRef = useRef<Pusher | null>(null);

  useEffect(() => {
    if (!enabled || !PUSHER_KEY) return;

    const pusher = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
      authEndpoint: `${import.meta.env.VITE_API_URL ?? "/api"}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      },
    });

    pusherRef.current = pusher;

    channels.forEach((channelName) => {
      const channel = pusher.subscribe(channelName);
      channel.bind_global((event: string, data: unknown) => {
        onEvent({ channel: channelName, event, data });
      });
    });

    return () => {
      channels.forEach((channelName) => {
        pusher.unsubscribe(channelName);
      });
      pusher.disconnect();
      pusherRef.current = null;
    };
  }, [channels.join(","), enabled]);
}

export function getPusherKey(): string {
  return PUSHER_KEY;
}
