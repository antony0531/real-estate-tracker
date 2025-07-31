// This utility generates PWA icons programmatically
// Run this in the browser console or as a separate script

export function generateIcons() {
  const sizes = [72, 96, 128, 144, 152, 167, 180, 192, 384, 512];
  
  sizes.forEach(size => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    
    // Background
    ctx.fillStyle = '#0073ea';
    ctx.fillRect(0, 0, size, size);
    
    // Letter B
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${size * 0.5}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('B', size / 2, size / 2);
    
    // Download link
    canvas.toBlob(blob => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `icon-${size}x${size}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  });
}