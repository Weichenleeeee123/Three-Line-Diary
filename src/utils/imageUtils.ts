/**
 * 图片处理工具函数
 */

// 压缩图片到指定大小
export const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // 计算新的尺寸，保持宽高比
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxWidth) {
          width = (width * maxWidth) / height;
          height = maxWidth;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // 绘制压缩后的图片
      ctx?.drawImage(img, 0, 0, width, height);
      
      // 转换为base64
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };
    
    img.onerror = () => {
      reject(new Error('图片加载失败'));
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// 验证文件类型
export const validateImageFile = (file: File): boolean => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return allowedTypes.includes(file.type);
};

// 验证文件大小（MB）
export const validateImageSize = (file: File, maxSizeMB: number = 10): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

// 从相机或相册选择图片
export const selectImage = (): Promise<File> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // 优先使用后置摄像头
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        resolve(file);
      } else {
        reject(new Error('未选择文件'));
      }
    };
    
    input.oncancel = () => {
      reject(new Error('用户取消选择'));
    };
    
    input.click();
  });
};

// 获取图片预览URL
export const getImagePreviewUrl = (base64Data: string): string => {
  return base64Data;
};

// 删除图片的base64前缀，获取纯数据
export const getBase64Data = (dataUrl: string): string => {
  return dataUrl.split(',')[1] || dataUrl;
};

// 检查是否为有效的base64图片数据
export const isValidImageData = (data: string): boolean => {
  if (!data) return false;
  
  // 检查是否为data URL格式
  if (data.startsWith('data:image/')) {
    return true;
  }
  
  // 检查是否为纯base64数据
  try {
    return btoa(atob(data)) === data;
  } catch {
    return false;
  }
};