import CryptoJS from 'crypto-js';

interface ASRResult {
  transcript: string;
  isFinal: boolean;
}

interface TencentASRConfig {
  secretId: string;
  secretKey: string;
  appId: string;
  engineType: string;
}

export class TencentASRService {
  private config: TencentASRConfig;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording = false;
  private onResult?: (result: ASRResult) => void;
  private onError?: (error: string) => void;
  private websocket: WebSocket | null = null;
  private voiceId: string = '';
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private stream: MediaStream | null = null;

  constructor() {
    this.config = {
      secretId: import.meta.env.VITE_TENCENT_SECRET_ID || '',
      secretKey: import.meta.env.VITE_TENCENT_SECRET_KEY || '',
      appId: import.meta.env.VITE_TENCENT_APP_ID || '1259228442', // AppId保持原始格式
      engineType: '16k_zh'
    };
    
    // 验证配置
    console.log('腾讯云ASR初始化配置:', {
      hasSecretId: !!this.config.secretId,
      hasSecretKey: !!this.config.secretKey,
      appId: this.config.appId,
      engineType: this.config.engineType
    });
  }

  // 生成WebSocket连接的签名 - 严格按照腾讯云官方文档
  private generateWebSocketSignature(): string {
    const { secretId, secretKey, appId, engineType } = this.config;
    const timestamp = Math.floor(Date.now() / 1000);
    const expired = timestamp + 86400; // 24小时后过期
    const nonce = Math.floor(Math.random() * 1000000000);
    this.voiceId = this.generateVoiceId();

    console.log('ASR配置信息:', {
      appId,
      secretId: secretId ? secretId.substring(0, 8) + '***' : 'undefined',
      secretKey: secretKey ? '***' : 'undefined',
      timestamp,
      expired,
      nonce,
      voiceId: this.voiceId
    });

    // 构建参数对象 - 严格按照腾讯云ASR官方文档的参数名称和格式
    const params: Record<string, string | number> = {
      engine_model_type: engineType,
      expired: expired,
      needvad: 1,
      nonce: nonce,
      secretid: secretId, // 注意：官方文档中是小写的secretid
      timestamp: timestamp,
      voice_format: 1,
      voice_id: this.voiceId
    };

    // 对除signature外的所有参数按字典序进行排序
    const sortedKeys = Object.keys(params).sort();
    const queryString = sortedKeys
      .map(key => `${key}=${params[key]}`)
      .join('&');

    // 构造签名原文 - 按照官方文档：不包含协议部分wss://
    const signStr = `asr.cloud.tencent.com/asr/v2/${appId}?${queryString}`;
    
    console.log('签名原文:', signStr);
    
    // 使用SecretKey对签名原文进行HmacSha1加密，之后再进行base64编码
    const signature = CryptoJS.HmacSHA1(signStr, secretKey).toString(CryptoJS.enc.Base64);
    
    console.log('生成的签名:', signature);
    
    // 构建最终WebSocket URL - signature需要进行URL编码
    const encodedSignature = encodeURIComponent(signature);
    const finalUrl = `wss://asr.cloud.tencent.com/asr/v2/${appId}?${queryString}&signature=${encodedSignature}`;
    
    console.log('最终WebSocket URL:', finalUrl);
    
    return finalUrl;
  }

  // 生成唯一的voice_id
  private generateVoiceId(): string {
    return 'voice_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // 连接WebSocket
  private connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = this.generateWebSocketSignature();
        console.log('连接WebSocket:', wsUrl);
        
        this.websocket = new WebSocket(wsUrl);
        
        this.websocket.onopen = () => {
          console.log('WebSocket连接已建立');
          resolve();
        };
        
        this.websocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('收到ASR响应:', data);
            
            if (data.code === 0 && data.result) {
              const transcript = data.result.voice_text_str || '';
              if (transcript && this.onResult) {
                this.onResult({
                  transcript,
                  isFinal: data.result.slice_type === 2
                });
              }
            } else if (data.code !== 0) {
              console.error('ASR错误详情:', {
                code: data.code,
                message: data.message,
                requestId: data.request_id,
                appId: this.config.appId
              });
              if (this.onError) {
                this.onError(`鉴权失败，请检查输入的 AppID 与实际访问的 AppID 是否一致。`);
              }
            }
          } catch (error) {
            console.error('解析ASR响应失败:', error);
            if (this.onError) {
              this.onError('解析服务器响应失败');
            }
          }
        };
        
        this.websocket.onerror = (error) => {
          console.error('WebSocket错误:', error);
          reject(new Error('WebSocket连接失败'));
        };
        
        this.websocket.onclose = (event) => {
          console.log('WebSocket连接已关闭:', event.code, event.reason);
          this.cleanup();
        };
        
      } catch (error) {
        reject(error);
      }
    });
  }

  // 发送音频数据
  private sendAudioData(audioData: ArrayBuffer): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(audioData);
    }
  }

  // 设置音频处理
  private setupAudioProcessing(stream: MediaStream): void {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: 16000
    });
    
    const source = this.audioContext.createMediaStreamSource(stream);
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
    
    this.processor.onaudioprocess = (event) => {
      if (!this.isRecording) return;
      
      const inputBuffer = event.inputBuffer;
      const inputData = inputBuffer.getChannelData(0);
      
      // 转换为16位PCM
      const pcmData = this.convertToPCM16(inputData);
      this.sendAudioData(pcmData.buffer);
    };
    
    source.connect(this.processor);
    this.processor.connect(this.audioContext.destination);
  }

  // 转换为16位PCM格式
  private convertToPCM16(input: Float32Array): Int16Array {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const sample = Math.max(-1, Math.min(1, input[i]));
      output[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    }
    return output;
  }

  // 开始录音
  async startRecording(
    onResult: (result: ASRResult) => void,
    onError: (error: string) => void
  ): Promise<void> {
    if (!this.isConfigValid()) {
      onError('腾讯云ASR配置无效，请检查密钥设置');
      return;
    }

    if (this.isRecording) {
      return;
    }

    this.onResult = onResult;
    this.onError = onError;

    try {
      // 先建立WebSocket连接
      await this.connectWebSocket();
      
      // 请求麦克风权限
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      
      // 设置音频处理
      this.setupAudioProcessing(this.stream);
      
      this.isRecording = true;
      console.log('开始录音和实时识别');
      
    } catch (error) {
      console.error('启动录音失败:', error);
      onError('启动录音失败: ' + (error as Error).message);
      this.cleanup();
    }
  }

  // 停止录音
  stopRecording(): void {
    if (this.isRecording) {
      this.isRecording = false;
      console.log('停止录音');
      this.cleanup();
    }
  }

  // 清理资源
  private cleanup(): void {
    // 关闭WebSocket连接
    if (this.websocket) {
      if (this.websocket.readyState === WebSocket.OPEN) {
        this.websocket.close();
      }
      this.websocket = null;
    }

    // 停止音频处理
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }

    // 关闭音频上下文
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    // 停止媒体流
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    this.isRecording = false;
  }

  // 检查是否正在录音
  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  // 检查配置是否有效
  isConfigValid(): boolean {
    return !!(this.config.secretId && this.config.secretKey);
  }

  // 检查浏览器支持
  static isSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.AudioContext);
  }
}

// 导出单例实例
export const tencentASR = new TencentASRService();