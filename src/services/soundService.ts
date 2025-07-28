class SoundService {
  private audioContext: AudioContext | null = null;
  private audioBuffer: AudioBuffer | null = null;
  private isLoaded = false;

  constructor() {
    this.initAudio();
  }

  private async initAudio() {
    try {
      // 创建音频上下文
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // 加载音频文件
      const response = await fetch('/sounds.mp3');
      const arrayBuffer = await response.arrayBuffer();
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.isLoaded = true;
    } catch (error) {
      console.warn('音效加载失败:', error);
    }
  }

  async playSound() {
    if (!this.isLoaded || !this.audioContext || !this.audioBuffer) {
      console.warn('音效未加载或不可用');
      return;
    }

    try {
      // 确保音频上下文处于运行状态
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // 创建音频源
      const source = this.audioContext.createBufferSource();
      source.buffer = this.audioBuffer;
      
      // 创建音量控制节点
      const gainNode = this.audioContext.createGain();
      
      // 设置初始音量为50%
      gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
      
      // 添加渐弱效果 - 在音频播放的最后0.5秒开始淡出
      const duration = this.audioBuffer.duration;
      const fadeOutStart = Math.max(0, duration - 0.5);
      gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime + fadeOutStart);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
      
      // 连接音频节点
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      source.start();
    } catch (error) {
      console.warn('音效播放失败:', error);
    }
  }

  // 预加载音效（用户交互后调用）
  async preload() {
    if (!this.isLoaded && this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
  }
}

// 创建全局实例
export const soundService = new SoundService();

// 导出播放函数
export const playAchievementSound = () => soundService.playSound();
export const playDiarySaveSound = () => soundService.playSound();
export const preloadSounds = () => soundService.preload();