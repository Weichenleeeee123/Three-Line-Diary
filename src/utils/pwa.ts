// PWA相关功能

// 注册Service Worker
export const registerSW = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('Service Worker注册成功:', registration.scope);
      
      // 监听更新
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // 新版本可用，提示用户刷新
              showUpdateAvailable();
            }
          });
        }
      });
      
    } catch (error) {
      console.error('Service Worker注册失败:', error);
    }
  }
};

// 显示更新可用提示
const showUpdateAvailable = (): void => {
  if (confirm('发现新版本，是否立即更新？')) {
    window.location.reload();
  }
};

// 检查是否可以安装PWA
export const checkInstallPrompt = (): void => {
  let deferredPrompt: any;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    // 阻止默认的安装提示
    e.preventDefault();
    deferredPrompt = e;
    
    // 显示自定义安装按钮
    showInstallButton(deferredPrompt);
  });
  
  // 监听安装完成
  window.addEventListener('appinstalled', () => {
    console.log('PWA安装成功');
    hideInstallButton();
    deferredPrompt = null;
  });
};

// 显示安装按钮
const showInstallButton = (deferredPrompt: any): void => {
  // 创建安装提示
  const installBanner = document.createElement('div');
  installBanner.id = 'install-banner';
  installBanner.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #f97316;
      color: white;
      padding: 12px 20px;
      border-radius: 25px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
    ">
      <span>📱</span>
      <span>安装到桌面</span>
      <button id="install-close" style="
        background: none;
        border: none;
        color: white;
        font-size: 16px;
        cursor: pointer;
        padding: 0;
        margin-left: 10px;
      ">×</button>
    </div>
  `;
  
  document.body.appendChild(installBanner);
  
  // 点击安装
  installBanner.addEventListener('click', async (e) => {
    if ((e.target as HTMLElement).id === 'install-close') {
      hideInstallButton();
      return;
    }
    
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('用户接受了安装');
      } else {
        console.log('用户拒绝了安装');
      }
      
      deferredPrompt = null;
      hideInstallButton();
    }
  });
  
  // 关闭按钮
  const closeBtn = installBanner.querySelector('#install-close');
  closeBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    hideInstallButton();
  });
};

// 隐藏安装按钮
const hideInstallButton = (): void => {
  const banner = document.getElementById('install-banner');
  if (banner) {
    banner.remove();
  }
};

// 检查是否在PWA模式下运行
export const isPWA = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone ||
         document.referrer.includes('android-app://');
};

// 获取安装状态
export const getInstallStatus = (): string => {
  if (isPWA()) {
    return 'installed';
  }
  
  if ('serviceWorker' in navigator) {
    return 'installable';
  }
  
  return 'not-supported';
};

// 初始化PWA功能
export const initPWA = (): void => {
  // 注册Service Worker
  registerSW();
  
  // 检查安装提示
  checkInstallPrompt();
  
  // 在控制台显示PWA状态
  console.log('PWA状态:', getInstallStatus());
  
  // 如果已经是PWA模式，隐藏浏览器UI
  if (isPWA()) {
    document.documentElement.classList.add('pwa-mode');
  }
};