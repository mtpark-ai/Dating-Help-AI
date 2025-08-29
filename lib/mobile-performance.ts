// 移动端性能优化工具函数

// 主线程任务分割器 - 避免长任务
export function splitLongTask<T>(
  items: T[],
  processor: (item: T, index: number) => void,
  batchSize: number = 5
): Promise<void> {
  return new Promise((resolve) => {
    let index = 0;
    
    function processBatch() {
      const endIndex = Math.min(index + batchSize, items.length);
      
      // 处理当前批次
      for (let i = index; i < endIndex; i++) {
        processor(items[i], i);
      }
      
      index = endIndex;
      
      if (index < items.length) {
        // 使用 scheduler.postTask 或 setTimeout 让出主线程
        if ('scheduler' in window && 'postTask' in (window as any).scheduler) {
          (window as any).scheduler.postTask(processBatch, { priority: 'background' });
        } else {
          setTimeout(processBatch, 0);
        }
      } else {
        resolve();
      }
    }
    
    processBatch();
  });
}

// 移动端图片懒加载优化
export function createMobileIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
) {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px', // 移动端提前加载
    threshold: 0.1,
    ...options
  };

  return new IntersectionObserver(callback, defaultOptions);
}

// 移动端资源预加载管理
export class MobileResourceManager {
  private preloadedResources = new Set<string>();
  private loadingQueue: string[] = [];
  private isProcessing = false;

  // 智能预加载 - 基于用户行为
  preloadResource(url: string, priority: 'high' | 'low' = 'low') {
    if (this.preloadedResources.has(url)) return;

    if (priority === 'high') {
      this.loadingQueue.unshift(url);
    } else {
      this.loadingQueue.push(url);
    }

    this.processQueue();
  }

  private async processQueue() {
    if (this.isProcessing || this.loadingQueue.length === 0) return;
    
    this.isProcessing = true;

    while (this.loadingQueue.length > 0) {
      const url = this.loadingQueue.shift()!;
      
      try {
        await this.loadResource(url);
        this.preloadedResources.add(url);
      } catch (error) {
        console.warn(`Failed to preload resource: ${url}`, error);
      }

      // 移动端友好的延迟
      await new Promise(resolve => {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(resolve as IdleRequestCallback);
        } else {
          setTimeout(resolve, 16); // ~60fps
        }
      });
    }

    this.isProcessing = false;
  }

  private loadResource(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to load ${url}`));
      
      document.head.appendChild(link);
    });
  }
}

// 移动端性能监控
export class MobilePerformanceMonitor {
  private metrics: Map<string, number> = new Map();
  
  // 标记性能时间点
  mark(name: string) {
    if ('performance' in window && 'mark' in performance) {
      performance.mark(name);
    }
    this.metrics.set(name, Date.now());
  }

  // 测量性能间隔
  measure(name: string, startMark: string, endMark?: string) {
    const startTime = this.metrics.get(startMark);
    const endTime = endMark ? this.metrics.get(endMark) : Date.now();
    
    if (startTime && endTime) {
      const duration = endTime - startTime;
      console.log(`🚀 ${name}: ${duration}ms`);
      
      // 报告到Analytics（如果需要）
      if ('gtag' in window) {
        (window as any).gtag('event', 'timing_complete', {
          name: name,
          value: duration
        });
      }
      
      return duration;
    }
    
    return 0;
  }

  // 移动端内存使用监控
  checkMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
      };
    }
    return null;
  }
}

// 移动端电池状态优化
export function optimizeForBattery() {
  if ('getBattery' in navigator) {
    (navigator as any).getBattery().then((battery: any) => {
      // 电量低时降低动画和更新频率
      if (battery.level < 0.2) {
        document.documentElement.style.setProperty('--animation-speed', '0.5s');
        console.log('🔋 Low battery mode: Reduced animations');
      }
      
      // 监听电池状态变化
      battery.addEventListener('levelchange', () => {
        if (battery.level < 0.2) {
          document.documentElement.style.setProperty('--animation-speed', '0.5s');
        } else {
          document.documentElement.style.removeProperty('--animation-speed');
        }
      });
    });
  }
}

// 导出单例实例
export const mobileResourceManager = new MobileResourceManager();
export const mobilePerformanceMonitor = new MobilePerformanceMonitor();
