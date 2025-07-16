'use client';

import React, { useEffect, useRef, useState } from 'react';
import { doc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '@/database/firebase';

type Module = {
  id: string;
  title?: string;
  duration?: number;
  videoUrl?: string;
};

interface VideoPlayerProps {
  courseId: string;
  module: Module;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ courseId, module }) => {
  const playerRef = useRef<HTMLDivElement>(null);
  const playerInstance = useRef<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const interval = useRef<any>(null);
  const [initialTimestamp, setInitialTimestamp] = useState<number>(0);

  // Get user ID
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserId(user.uid);
    }
  }, []);

  // Get saved timestamp
  useEffect(() => {
    const fetchProgress = async () => {
      if (!userId || !module.id) return;

      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return;

      const data = userSnap.data();
      const savedProgress = data.courseProgress?.[courseId]?.videoProgress?.[module.id] || 0;
      setInitialTimestamp(savedProgress * 60); // Convert minutes to seconds
    };

    fetchProgress();
  }, [userId, courseId, module.id]);

  // Load YouTube player
  const loadYouTubePlayer = (videoId: string) => {
    if (!playerRef.current) return;

    if (playerInstance.current) {
      playerInstance.current.destroy();
    }

    playerRef.current.innerHTML = ''; // Clear old iframe

    playerInstance.current = new window.YT.Player(playerRef.current, {
      videoId,
      events: {
        onReady: (event: any) => {
          if (initialTimestamp > 0) {
            event.target.seekTo(initialTimestamp, true);
          }
        },
        onStateChange: async (event: any) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            clearInterval(interval.current);
            interval.current = setInterval(async () => {
              const currentSeconds = playerInstance.current.getCurrentTime();
              const durationSeconds = playerInstance.current.getDuration();

              const current = parseFloat((currentSeconds / 60).toFixed(2));
              const duration = parseFloat((durationSeconds / 60).toFixed(2));

              const userRef = doc(db, 'users', userId!);
              const userSnap = await getDoc(userRef);
              const saved = userSnap.data()?.courseProgress?.[courseId]?.videoProgress?.[module.id] || 0;

              if (current > saved) {
                await updateDoc(userRef, {
                  [`courseProgress.${courseId}.videoProgress.${module.id}`]: current,
                  [`courseProgress.${courseId}.videoDuration.${module.id}`]: duration,
                  [`courseProgress.${courseId}.lastWatched`]: new Date().toISOString(),
                });
              }
            }, 5000);
          } else if (event.data === window.YT.PlayerState.ENDED) {
            clearInterval(interval.current);
            if (userId && module.id) {
              await updateDoc(doc(db, 'users', userId), {
                [`courseProgress.${courseId}.modulesCompleted`]: arrayUnion(module.id),
              });
            }
          } else {
            clearInterval(interval.current);
          }
        },
      },
      playerVars: {
        modestbranding: 1,
        rel: 0,
        controls: 1,
      },
    });
  };

  // Watch for module.videoUrl changes
  useEffect(() => {
    if (!module.videoUrl || !userId) return;

    const match = module.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    if (!match) return;
    const videoId = match[1];

    const initialize = () => loadYouTubePlayer(videoId);

    if (window.YT && window.YT.Player) {
      initialize();
    } else {
      const existingScript = document.getElementById('youtube-api');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.id = 'youtube-api';
        document.body.appendChild(tag);
      }

      window.onYouTubeIframeAPIReady = () => {
        initialize();
      };
    }

    return () => {
      clearInterval(interval.current);
      if (playerInstance.current) {
        playerInstance.current.destroy();
        playerInstance.current = null;
      }
    };
  }, [module.videoUrl, userId, initialTimestamp]);

  return (
    <div className="mt-8 w-full relative" style={{ paddingTop: '56.25%' }}>
      <div
        ref={playerRef}
        className="absolute top-0 left-0 w-full h-full rounded-md overflow-hidden"
      />
    </div>
  );
};

export default VideoPlayer;
