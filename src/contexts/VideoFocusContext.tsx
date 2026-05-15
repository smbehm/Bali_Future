/* eslint-disable react-refresh/only-export-components -- provider + hooks in one module */
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

type VideoFocusApi = {
  register: (id: string, el: HTMLVideoElement) => void;
  unregister: (id: string) => void;
  /** Id of the video that may play with sound, or null when all are muted. */
  audioOwnerId: string | null;
  requestAudioFocus: (id: string) => void;
  releaseAudioFocus: (id: string) => void;
};

const VideoFocusContext = createContext<VideoFocusApi | null>(null);

function applyRegistryPolicy(map: Map<string, HTMLVideoElement>, owner: string | null) {
  map.forEach((el, key) => {
    if (owner === null) {
      el.muted = true;
      el.volume = 1;
      void el.play().catch(() => {});
    } else if (key === owner) {
      el.muted = false;
      el.volume = 1;
      void el.play().catch(() => {});
    } else {
      /* Keep non-owner clips playing muted so visible cards still autoplay; visibility handlers may pause. */
      el.muted = true;
      el.volume = 1;
      void el.play().catch(() => {});
    }
  });
}

export function VideoFocusProvider({ children }: { children: ReactNode }) {
  const registry = useRef(new Map<string, HTMLVideoElement>());
  const [audioOwnerId, setAudioOwnerId] = useState<string | null>(null);
  const audioOwnerIdRef = useRef<string | null>(null);
  audioOwnerIdRef.current = audioOwnerId;

  const register = useCallback((id: string, el: HTMLVideoElement) => {
    registry.current.set(id, el);
    applyRegistryPolicy(registry.current, audioOwnerIdRef.current);
  }, []);

  const unregister = useCallback((id: string) => {
    const wasOwner = audioOwnerIdRef.current === id;
    registry.current.delete(id);
    if (wasOwner) {
      applyRegistryPolicy(registry.current, null);
    }
    setAudioOwnerId((current) => (current === id ? null : current));
  }, []);

  const requestAudioFocus = useCallback((id: string) => {
    applyRegistryPolicy(registry.current, id);
    setAudioOwnerId(id);
  }, []);

  const releaseAudioFocus = useCallback((id: string) => {
    if (audioOwnerIdRef.current !== id) return;
    applyRegistryPolicy(registry.current, null);
    setAudioOwnerId(null);
  }, []);

  useLayoutEffect(() => {
    applyRegistryPolicy(registry.current, audioOwnerId);
  }, [audioOwnerId]);

  const value = useMemo(
    () => ({
      register,
      unregister,
      audioOwnerId,
      requestAudioFocus,
      releaseAudioFocus,
    }),
    [register, unregister, audioOwnerId, requestAudioFocus, releaseAudioFocus],
  );

  return <VideoFocusContext.Provider value={value}>{children}</VideoFocusContext.Provider>;
}

export function useVideoFocus(): VideoFocusApi {
  const ctx = useContext(VideoFocusContext);
  if (!ctx) {
    throw new Error('useVideoFocus must be used within VideoFocusProvider');
  }
  return ctx;
}

/** Single audio owner: `muted` is derived from context so React never fights imperative mute. */
export function useManagedVideo(uniqueId: string) {
  const { register, unregister, audioOwnerId, requestAudioFocus, releaseAudioFocus } = useVideoFocus();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const muted = audioOwnerId !== uniqueId;

  useLayoutEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    register(uniqueId, el);
    return () => {
      unregister(uniqueId);
    };
  }, [uniqueId, register, unregister]);

  const toggleMute = useCallback(() => {
    if (audioOwnerId === uniqueId) {
      releaseAudioFocus(uniqueId);
    } else {
      requestAudioFocus(uniqueId);
    }
  }, [audioOwnerId, uniqueId, requestAudioFocus, releaseAudioFocus]);

  const abandonAudioIfOwner = useCallback(() => {
    if (audioOwnerId === uniqueId) {
      releaseAudioFocus(uniqueId);
    }
  }, [audioOwnerId, uniqueId, releaseAudioFocus]);

  return { videoRef, muted, toggleMute, abandonAudioIfOwner };
}
