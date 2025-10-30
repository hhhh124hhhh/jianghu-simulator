// Web Audio API 音效生成器
export class SoundGenerator {
  private audioContext: AudioContext | null = null;
  private isInitialized = false;

  // 初始化音频上下文
  initContext(): void {
    if (!this.isInitialized) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.isInitialized = true;
      } catch (error) {
        console.warn('音频上下文创建失败:', error);
      }
    }
  }

  // 确保音频上下文处于运行状态
  private ensureContextRunning(): void {
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  // 播放点击音效 - 短促的"滴"声
  playClick(): void {
    if (!this.audioContext || !this.isInitialized) return;
    
    this.ensureContextRunning();
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      // 设置频率为800Hz，产生清脆的点击声
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.type = 'sine';
      
      // 设置音量包络：快速启动，快速衰减
      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
      
      // 连接节点
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // 播放50ms
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.05);
    } catch (error) {
      console.warn('点击音效播放失败:', error);
    }
  }

  // 播放成功音效 - 上升的"叮"声
  playSuccess(): void {
    if (!this.audioContext || !this.isInitialized) return;
    
    this.ensureContextRunning();
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.type = 'sine';
      
      // 频率从600Hz上升到1200Hz，产生成功的感觉
      oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
      oscillator.frequency.linearRampToValueAtTime(1200, this.audioContext.currentTime + 0.2);
      
      // 音量包络：平滑的启动和衰减
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
      
      // 连接节点
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // 播放200ms
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.2);
    } catch (error) {
      console.warn('成功音效播放失败:', error);
    }
  }

  // 播放事件音效 - 低沉的"咚"声
  playEvent(): void {
    if (!this.audioContext || !this.isInitialized) return;
    
    this.ensureContextRunning();
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      // 使用三角波，设置低频200Hz，产生低沉的事件提示音
      oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
      oscillator.type = 'triangle';
      
      // 音量包络：快速衰减
      gainNode.gain.setValueAtTime(0.08, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
      
      // 连接节点
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // 播放100ms
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.1);
    } catch (error) {
      console.warn('事件音效播放失败:', error);
    }
  }

  // 检查音频支持
  isSupported(): boolean {
    return !!(window.AudioContext || (window as any).webkitAudioContext);
  }

  // 获取音频上下文状态
  getContextState(): AudioContextState | null {
    return this.audioContext?.state || null;
  }
}

// 创建全局音效生成器实例
export const soundGenerator = new SoundGenerator();