import React from 'react';
import { useSound } from '../hooks/useSound';
import { Volume2, VolumeX } from 'lucide-react';

export const SoundToggle: React.FC = () => {
  const { isMuted, toggleMute, isSupported } = useSound();

  // 如果浏览器不支持音效，不显示组件
  if (!isSupported) {
    return null;
  }

  return (
    <button
      onClick={toggleMute}
      className="
        fixed top-4 right-4 z-40
        w-10 h-10 rounded-full
        bg-background-dark/80 backdrop-blur-sm
        border border-gold-primary/30
        flex items-center justify-center
        text-gold-primary hover:text-gold-light
        transition-all duration-200
        hover:bg-gold-primary/10 hover:border-gold-primary/50
        group
      "
      title={isMuted ? '开启音效' : '关闭音效'}
    >
      {isMuted ? (
        <VolumeX className="w-5 h-5" />
      ) : (
        <Volume2 className="w-5 h-5" />
      )}
      
      {/* 提示文字 */}
      <span className="
        absolute right-full mr-2 top-1/2 -translate-y-1/2
        bg-background-dark border border-gold-primary/30
        px-2 py-1 rounded text-xs text-gold-primary
        opacity-0 group-hover:opacity-100 transition-opacity
        whitespace-nowrap pointer-events-none
      ">
        {isMuted ? '音效已关闭' : '音效已开启'}
      </span>
    </button>
  );
};