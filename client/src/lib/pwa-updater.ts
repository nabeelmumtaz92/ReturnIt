// PWA Update Detection and Management for Android devices
export class PWAUpdater {
  private registration: ServiceWorkerRegistration | null = null;
  private newWorkerAvailable = false;
  private refreshing = false;
  
  constructor() {
    this.init();
  }

  private async init() {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        this.setupUpdateListeners();
        
        // Force update check on page load (critical for Android)
        await this.checkForUpdates();
        
        console.log('PWA: Service Worker registered successfully');
      } catch (error) {
        console.error('PWA: Service Worker registration failed:', error);
      }
    }
  }

  private setupUpdateListeners() {
    if (!this.registration) return;

    // Listen for new service worker installations
    this.registration.addEventListener('updatefound', () => {
      const newWorker = this.registration!.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content is available; please refresh.
            this.newWorkerAvailable = true;
            this.showUpdateNotification();
          }
        });
      }
    });

    // Listen for controlling service worker change
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (this.refreshing) return;
      this.refreshing = true;
      window.location.reload();
    });
  }

  public async checkForUpdates(): Promise<boolean> {
    if (!this.registration) return false;
    
    try {
      await this.registration.update();
      return true;
    } catch (error) {
      console.error('PWA: Update check failed:', error);
      return false;
    }
  }

  public async forceUpdate(): Promise<void> {
    if (!this.registration) return;

    // Clear all caches and force refresh
    const sw = this.registration.active || this.registration.waiting;
    if (sw) {
      sw.postMessage({ type: 'FORCE_REFRESH' });
    } else {
      // Fallback: clear caches manually and reload
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      window.location.reload();
    }
  }

  public skipWaiting(): void {
    if (!this.registration) return;
    
    const sw = this.registration.waiting;
    if (sw) {
      sw.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  private showUpdateNotification() {
    // Create a subtle notification for updates
    const notification = document.createElement('div');
    notification.id = 'pwa-update-notification';
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #f97316;
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 300px;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        line-height: 1.4;
      ">
        <div style="margin-bottom: 12px;">
          <strong>ReturnIt Update Available</strong>
        </div>
        <div style="margin-bottom: 12px; opacity: 0.9;">
          A new version is ready. Refresh to update.
        </div>
        <div style="display: flex; gap: 8px;">
          <button id="pwa-update-btn" style="
            background: white;
            color: #f97316;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
          ">Update Now</button>
          <button id="pwa-dismiss-btn" style="
            background: transparent;
            color: white;
            border: 1px solid rgba(255,255,255,0.3);
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
          ">Later</button>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // Add event listeners
    document.getElementById('pwa-update-btn')?.addEventListener('click', () => {
      this.skipWaiting();
      notification.remove();
    });

    document.getElementById('pwa-dismiss-btn')?.addEventListener('click', () => {
      notification.remove();
    });

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (document.getElementById('pwa-update-notification')) {
        notification.remove();
      }
    }, 10000);
  }

  // Android-specific cache clearing method
  public async clearAllCaches(): Promise<void> {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        console.log('PWA: All caches cleared');
      }
      
      // Also clear service worker if possible
      if (this.registration) {
        const sw = this.registration.active;
        if (sw) {
          sw.postMessage({ type: 'CLEAR_CACHE' });
        }
      }
    } catch (error) {
      console.error('PWA: Cache clearing failed:', error);
    }
  }

  // Get current cache version
  public async getCacheVersion(): Promise<string | null> {
    return new Promise((resolve) => {
      if (!this.registration) {
        resolve(null);
        return;
      }

      const sw = this.registration.active;
      if (sw) {
        const channel = new MessageChannel();
        channel.port1.onmessage = (event) => {
          resolve(event.data.version || null);
        };
        sw.postMessage({ type: 'GET_VERSION' }, [channel.port2]);
      } else {
        resolve(null);
      }
    });
  }
}

// Global instance
export const pwaUpdater = new PWAUpdater();

// Utility function for manual refresh (can be called from anywhere)
export const refreshPWA = () => {
  pwaUpdater.forceUpdate();
};

// Check for updates periodically (every 5 minutes)
setInterval(() => {
  pwaUpdater.checkForUpdates();
}, 5 * 60 * 1000);