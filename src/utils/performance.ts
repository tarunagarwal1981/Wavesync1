/**
 * Performance monitoring utilities
 */

// Measure component render time
export const measureRenderTime = (componentName: string, callback: () => void): void => {
  const startTime = performance.now();
  callback();
  const endTime = performance.now();
  const renderTime = endTime - startTime;
  
  if (renderTime > 16.67) { // More than one frame (60fps)
    console.warn(`⚠️ ${componentName} took ${renderTime.toFixed(2)}ms to render`);
  }
};

// Check if animations are running at 60fps
export const checkAnimationPerformance = (): void => {
  let lastTime = performance.now();
  let frames = 0;
  
  const checkFrame = () => {
    const currentTime = performance.now();
    frames++;
    
    if (currentTime >= lastTime + 1000) {
      const fps = Math.round((frames * 1000) / (currentTime - lastTime));
      if (fps < 55) {
        console.warn(`⚠️ FPS dropped to ${fps}`);
      }
      frames = 0;
      lastTime = currentTime;
    }
    
    requestAnimationFrame(checkFrame);
  };
  
  requestAnimationFrame(checkFrame);
};

// Measure page load time
export const measurePageLoad = (): void => {
  window.addEventListener('load', () => {
    const perfData = performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
    
    console.log('📊 Performance Metrics:');
    console.log(`  Page Load Time: ${pageLoadTime}ms`);
    console.log(`  DOM Ready Time: ${domReadyTime}ms`);
    
    if (pageLoadTime > 3000) {
      console.warn('⚠️ Page load time is slower than 3 seconds');
    }
  });
};

// Check bundle size (development only)
export const checkBundleSize = (): void => {
  if (process.env.NODE_ENV === 'development') {
    const scripts = document.getElementsByTagName('script');
    let totalSize = 0;
    
    Array.from(scripts).forEach(script => {
      if (script.src) {
        fetch(script.src)
          .then(response => response.blob())
          .then(blob => {
            totalSize += blob.size;
            console.log(`📦 Script size: ${(blob.size / 1024).toFixed(2)}KB - ${script.src}`);
          });
      }
    });
  }
};


