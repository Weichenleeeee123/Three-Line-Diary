import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Square, Check, RotateCcw } from 'lucide-react';
import { tencentASR } from '../services/tencentASR';
import { toast } from 'sonner';

interface VoiceInputProps {
  onTranscriptConfirm: (text: string) => void;
  placeholder?: string;
  className?: string;
}

interface VoiceInputState {
  isRecording: boolean;
  showTranscript: boolean;
  hasPermission: boolean;
  permissionRequested: boolean;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscriptConfirm,
  placeholder = '点击麦克风开始语音输入',
  className = ''
}) => {
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const browserSupportsSpeechRecognition = true; // 腾讯云ASR支持所有现代浏览器

  const [state, setState] = useState<VoiceInputState>({
    isRecording: false,
    showTranscript: false,
    hasPermission: false,
    permissionRequested: false
  });

  const [editableTranscript, setEditableTranscript] = useState('');
  const [waveHeights, setWaveHeights] = useState<number[]>([8, 12, 16, 10, 6]);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (transcript) {
      setEditableTranscript(transcript);
    }
  }, [transcript]);

  // 重置转录文本
  const resetTranscript = () => {
    setTranscript('');
  };

  // 初始化音频分析器
  const initAudioAnalyser = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const context = new AudioContext();
      const analyserNode = context.createAnalyser();
      const source = context.createMediaStreamSource(stream);
      
      analyserNode.fftSize = 256;
      analyserNode.smoothingTimeConstant = 0.8;
      source.connect(analyserNode);
      
      setAudioContext(context);
      setAnalyser(analyserNode);
      setMediaStream(stream);
      
      return { analyserNode, stream };
    } catch (error) {
      console.error('Failed to initialize audio analyser:', error);
      return null;
    }
  };

  // 清理音频资源
  const cleanupAudio = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    if (audioContext) {
      audioContext.close();
      setAudioContext(null);
    }
    setAnalyser(null);
  };

  // 基于实际音量的声纹波形动画效果
  useEffect(() => {
    let animationFrame: number;
    
    if (state.isRecording && analyser) {
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const animateWaves = () => {
        analyser.getByteFrequencyData(dataArray);
        
        // 计算音量级别
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        const volumeLevel = Math.min(average / 128, 1); // 归一化到0-1
        
        // 根据音量调整波形高度
        setWaveHeights(prev => 
          prev.map((_, i) => {
            const baseHeight = 4;
            const maxHeight = 20;
            const frequencyIndex = Math.floor((i / prev.length) * (dataArray.length / 4));
            const frequencyValue = dataArray[frequencyIndex] || 0;
            const normalizedFreq = frequencyValue / 255;
            
            // 结合整体音量和频率数据
            const combinedLevel = (volumeLevel * 0.7 + normalizedFreq * 0.3);
            const height = baseHeight + (maxHeight - baseHeight) * combinedLevel;
            
            return Math.max(baseHeight, Math.min(maxHeight, height));
          })
        );
        
        animationFrame = requestAnimationFrame(animateWaves);
      };
      animateWaves();
    } else {
      // 录音停止时重置波形
      setWaveHeights([8, 12, 16, 10, 6]);
    }
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [state.isRecording, analyser]);

  // 检查腾讯云ASR配置并预先获取麦克风权限
  useEffect(() => {
    const isConfigValid = tencentASR.isConfigValid();
    if (!isConfigValid) {
      toast.error('腾讯云ASR配置无效，请检查环境变量');
    }
    
    // 页面加载时预先获取麦克风权限
    const initPermission = async () => {
      if (!state.permissionRequested) {
        setState(prev => ({ ...prev, permissionRequested: true }));
        
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
          setState(prev => ({ ...prev, hasPermission: true }));
          console.log('麦克风权限已预先获取');
        } catch (error) {
          console.error('麦克风权限被拒绝:', error);
          toast.error('需要麦克风权限才能使用语音输入功能，请在浏览器设置中允许麦克风访问');
        }
      }
    };
    
    initPermission();
  }, []);

  // 监听录音状态变化 - 仅处理手动停止的情况
  useEffect(() => {
    if (!listening && state.isRecording && !transcript.trim()) {
      // 只有在没有转录文本且手动停止时才更新状态
      // 有转录文本的情况已在startRecording回调中处理
      setState(prev => ({ ...prev, isRecording: false }));
    }
  }, [listening, state.isRecording, transcript]);

  const requestPermission = async () => {
    if (state.permissionRequested) return;
    
    setState(prev => ({ ...prev, permissionRequested: true }));
    
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setState(prev => ({ ...prev, hasPermission: true }));
      toast.success('麦克风权限已获取');
    } catch (error) {
      console.error('麦克风权限被拒绝:', error);
      toast.error('需要麦克风权限才能使用语音输入功能，请在浏览器设置中允许麦克风访问');
    }
  };

  const startRecording = async () => {
    if (!tencentASR.isConfigValid()) {
      toast.error('腾讯云ASR配置无效，请检查环境变量');
      return;
    }

    // 检查权限状态
    if (!state.hasPermission) {
      toast.error('麦克风权限未获取，请刷新页面并允许麦克风访问');
      return;
    }

    // 初始化音频分析器
    const audioResult = await initAudioAnalyser();
    if (!audioResult) {
      toast.error('无法访问麦克风进行音频分析');
      return;
    }

    resetTranscript();
    setEditableTranscript('');
    setState(prev => ({ 
      ...prev, 
      isRecording: true, 
      showTranscript: false 
    }));
    setListening(true);
    
    // 使用腾讯云ASR开始录音
    await tencentASR.startRecording(
      (result) => {
        setTranscript(result.transcript);
        if (result.isFinal) {
          // 收到最终结果时，完全停止录音
          setListening(false);
          setState(prev => ({ ...prev, isRecording: false }));
          tencentASR.stopRecording();
          cleanupAudio();
          
          // 显示转录结果
          if (result.transcript.trim()) {
            setState(prev => ({ ...prev, showTranscript: true }));
          }
        }
      },
      (error) => {
        toast.error(error);
        setListening(false);
        setState(prev => ({ ...prev, isRecording: false }));
        cleanupAudio();
      }
    );
  };

  const stopRecording = () => {
    tencentASR.stopRecording();
    cleanupAudio();
    setListening(false);
    setState(prev => ({ ...prev, isRecording: false }));
    
    if (transcript.trim()) {
      setState(prev => ({ ...prev, showTranscript: true }));
    }
  };

  const confirmTranscript = () => {
    if (editableTranscript.trim()) {
      onTranscriptConfirm(editableTranscript.trim());
      resetTranscript();
      setEditableTranscript('');
      setState(prev => ({ ...prev, showTranscript: false }));
      toast.success('语音内容已添加');
    }
  };

  const retryRecording = () => {
    resetTranscript();
    setEditableTranscript('');
    setState(prev => ({ ...prev, showTranscript: false }));
    startRecording();
  };

  const cancelTranscript = () => {
    resetTranscript();
    setEditableTranscript('');
    setState(prev => ({ ...prev, showTranscript: false }));
  };

  // 组件卸载时清理音频资源
  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  // 即使不支持语音识别也显示按钮，提供用户反馈
  const handleUnsupportedClick = () => {
    toast.error('您的浏览器不支持语音识别功能，请尝试使用Chrome、Edge或Safari浏览器');
  };

  console.log('VoiceInput rendering:', { 
    browserSupportsSpeechRecognition, 
    isRecording: state.isRecording, 
    hasPermission: state.hasPermission,
    tencentASRConfig: tencentASR.isConfigValid()
  });
  
  return (
    <div className={`relative ${className}`} style={{ zIndex: 9999 }}>
      {/* 麦克风按钮 */}
      <button
        onClick={!browserSupportsSpeechRecognition ? handleUnsupportedClick : (state.isRecording ? stopRecording : startRecording)}
        className={`
          w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200
          ${!browserSupportsSpeechRecognition 
            ? 'bg-gray-400 hover:bg-gray-500' 
            : state.isRecording 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : 'bg-orange-500 hover:bg-orange-600'
          }
          text-white shadow-md hover:shadow-lg transform hover:scale-105
        `}
        title={!browserSupportsSpeechRecognition ? '浏览器不支持语音识别' : (state.isRecording ? '停止录音' : '开始语音输入')}
      >
        {!browserSupportsSpeechRecognition ? (
          <MicOff className="w-4 h-4" />
        ) : state.isRecording ? (
          <Square className="w-4 h-4" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </button>

      {/* 录音状态指示器 */}
      {browserSupportsSpeechRecognition && state.isRecording && (
        <div className="absolute top-10 right-0 bg-white rounded-lg shadow-lg p-3 min-w-48 z-50">
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            {/* 声纹波形可视化 */}
             <div className="flex items-center space-x-1">
               {waveHeights.map((height, i) => (
                 <div
                   key={i}
                   className="w-1 bg-gradient-to-t from-red-600 to-red-400 rounded-full transition-all duration-100 ease-out"
                   style={{
                     height: `${height}px`,
                     minHeight: '4px'
                   }}
                 ></div>
               ))}
             </div>
            <span>正在录音...</span>
          </div>
          {transcript && (
            <div className="mt-2 text-sm text-gray-800 max-h-20 overflow-y-auto">
              {transcript}
            </div>
          )}
        </div>
      )}

      {/* 转录文本预览和编辑 */}
      {browserSupportsSpeechRecognition && state.showTranscript && (
        <div className="absolute top-10 right-0 bg-white rounded-lg shadow-lg p-4 min-w-64 max-w-80 z-50">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              语音转换结果
            </label>
            <textarea
              value={editableTranscript}
              onChange={(e) => setEditableTranscript(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={3}
              placeholder="转换的文字将显示在这里..."
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={confirmTranscript}
              disabled={!editableTranscript.trim()}
              className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1"
            >
              <Check className="w-4 h-4" />
              <span>确认</span>
            </button>
            
            <button
              onClick={retryRecording}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1"
            >
              <RotateCcw className="w-4 h-4" />
              <span>重录</span>
            </button>
            
            <button
              onClick={cancelTranscript}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1"
            >
              <MicOff className="w-4 h-4" />
              <span>取消</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};