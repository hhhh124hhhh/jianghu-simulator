import { useState, useEffect, useCallback } from 'react';
import { soundGenerator } from '../utils/soundGenerator';

export type SoundType = 'click' | 'success' | 'event';

interface UseSoundReturn {
  playSound: (type: SoundType) => void;
  isMuted: boolean;
  toggleMute: () => void;
  isSupported: boolean;
}

export const useSound = (): UseSoundReturn => {
  const [isMuted, setIsMuted] = useState(() => {
    // 从localStorage读取静音偏好
    return localStorage.getItem('sound-muted') === 'true';
  });

  const [isSupported, setIsSupported] = useState(false);

  // 初始化音效系统
  useEffect(() => {
    // 检查浏览器支持
    if (!soundGenerator.isSupported()) {
      console.warn('当前浏览器不支持Web Audio API');
      return;
    }

    setIsSupported(true);
    
    // 初始化音频上下文（延迟到用户第一次交互时）
    const handleUserInteraction = () => {
      soundGenerator.initContext();
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };

    // 监听用户交互事件以初始化音频上下文
    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  // 播放音效
  const playSound = useCallback((type: SoundType) => {
    if (isMuted || !isSupported) return;

    try {
      switch (type) {
        case 'click':
          soundGenerator.playClick();
          break;
        case 'success':
          soundGenerator.playSuccess();
          break;
        case 'event':
          soundGenerator.playEvent();
          break;
        default:
          console.warn('未知的音效类型:', type);
      }
    } catch (error) {
      console.warn('音效播放失败:', error);
    }
  }, [isMuted, isSupported]);

  // 切换静音状态
  const toggleMute = useCallback(() => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    localStorage.setItem('sound-muted', newMutedState.toString());
  }, [isMuted]);

  return {
    playSound,
    isMuted,
    toggleMute,
    isSupported,
  };
};