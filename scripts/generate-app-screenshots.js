#!/usr/bin/env node

/**
 * SmarTalk App Store Screenshots Generator
 * 
 * This script generates the required App Store screenshots by capturing
 * key screens from the UI prototypes and mobile app components.
 * 
 * Required screenshots for App Store:
 * 1. Onboarding/Welcome Screen - "30分钟英语思维突破"
 * 2. Interest Selection Screen - "选择您感兴趣的主题"
 * 3. Video Learning Screen - "沉浸式迷你剧学习"
 * 4. vTPR Practice Screen - "音画匹配，直觉理解"
 * 5. Achievement Screen - "体验英语思维突破时刻"
 */

const fs = require('fs');
const path = require('path');

// Screenshot specifications for different device types
const SCREENSHOT_SPECS = {
  'iPhone 6.7"': {
    width: 1290,
    height: 2796,
    name: 'iPhone 14 Pro Max'
  },
  'iPhone 6.5"': {
    width: 1242,
    height: 2688,
    name: 'iPhone 11 Pro Max'
  },
  'iPhone 5.5"': {
    width: 1242,
    height: 2208,
    name: 'iPhone 8 Plus'
  }
};

// Screenshot content definitions
const SCREENSHOTS = [
  {
    id: 'onboarding',
    title: '30分钟英语思维突破',
    description: '展示应用核心价值主张和品牌形象',
    source: 'ui-prototypes/onboarding-screen.html',
    priority: 1
  },
  {
    id: 'interest-selection',
    title: '选择您感兴趣的主题',
    description: '展示个性化学习路径（旅行、电影、职场）',
    source: 'ui-prototypes/interest-selection-screen.html',
    priority: 2
  },
  {
    id: 'video-learning',
    title: '沉浸式迷你剧学习',
    description: '展示高质量视频内容和字幕功能',
    source: 'ui-prototypes/theater-mode-screen.html',
    priority: 3
  },
  {
    id: 'vtpr-practice',
    title: '音画匹配，直觉理解',
    description: '展示核心学习功能和互动体验',
    source: 'ui-prototypes/vtpr-learning-screen.html',
    priority: 4
  },
  {
    id: 'achievement',
    title: '体验英语思维突破时刻',
    description: '展示学习成果和激励系统',
    source: 'ui-prototypes/achievement-screen.html',
    priority: 5
  }
];

class ScreenshotGenerator {
  constructor() {
    this.outputDir = path.join(__dirname, '../app-store/screenshots');
    this.ensureOutputDirectory();
  }

  ensureOutputDirectory() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Generate HTML template for screenshot capture
   */
  generateScreenshotHTML(screenshot, deviceSpec) {
    const sourceFile = path.join(__dirname, '..', screenshot.source);
    
    if (!fs.existsSync(sourceFile)) {
      console.warn(`⚠️ Source file not found: ${sourceFile}`);
      return this.generatePlaceholderHTML(screenshot, deviceSpec);
    }

    const sourceContent = fs.readFileSync(sourceFile, 'utf8');
    
    // Extract body content from source HTML
    const bodyMatch = sourceContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const bodyContent = bodyMatch ? bodyMatch[1] : sourceContent;

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${screenshot.title} - SmarTalk</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            width: ${deviceSpec.width}px;
            height: ${deviceSpec.height}px;
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            overflow: hidden;
            position: relative;
        }
        
        .screenshot-container {
            width: 100%;
            height: 100%;
            position: relative;
            display: flex;
            flex-direction: column;
        }
        
        .status-bar {
            height: 44px;
            background: rgba(0, 0, 0, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 20px;
            color: white;
            font-size: 16px;
            font-weight: 600;
        }
        
        .content-area {
            flex: 1;
            position: relative;
        }
        
        /* Import styles from source if available */
        ${this.extractStylesFromSource(sourceContent)}
        
        /* Screenshot-specific optimizations */
        .screenshot-overlay {
            position: absolute;
            bottom: 40px;
            left: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 16px;
            border-radius: 12px;
            text-align: center;
        }
        
        .screenshot-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 8px;
        }
        
        .screenshot-description {
            font-size: 14px;
            opacity: 0.9;
        }
    </style>
</head>
<body>
    <div class="screenshot-container">
        <div class="status-bar">
            <span>9:41</span>
            <span>SmarTalk</span>
            <span>100%</span>
        </div>
        
        <div class="content-area">
            ${bodyContent}
        </div>
        
        <div class="screenshot-overlay">
            <div class="screenshot-title">${screenshot.title}</div>
            <div class="screenshot-description">${screenshot.description}</div>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Generate placeholder HTML for missing source files
   */
  generatePlaceholderHTML(screenshot, deviceSpec) {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${screenshot.title} - SmarTalk</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            width: ${deviceSpec.width}px;
            height: ${deviceSpec.height}px;
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
            text-align: center;
            padding: 40px;
        }
        
        .placeholder-icon {
            font-size: 120px;
            margin-bottom: 40px;
            opacity: 0.8;
        }
        
        .placeholder-title {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 20px;
        }
        
        .placeholder-description {
            font-size: 18px;
            opacity: 0.9;
            line-height: 1.5;
            max-width: 600px;
        }
        
        .smartalk-logo {
            position: absolute;
            top: 60px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 24px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="smartalk-logo">SmarTalk</div>
    <div class="placeholder-icon">${this.getScreenshotIcon(screenshot.id)}</div>
    <div class="placeholder-title">${screenshot.title}</div>
    <div class="placeholder-description">${screenshot.description}</div>
</body>
</html>`;
  }

  /**
   * Extract CSS styles from source HTML
   */
  extractStylesFromSource(sourceContent) {
    const styleMatch = sourceContent.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
    if (styleMatch) {
      return styleMatch.map(style => 
        style.replace(/<\/?style[^>]*>/gi, '')
      ).join('\n');
    }
    return '';
  }

  /**
   * Get appropriate icon for screenshot type
   */
  getScreenshotIcon(screenshotId) {
    const icons = {
      'onboarding': '🚀',
      'interest-selection': '🎯',
      'video-learning': '🎬',
      'vtpr-practice': '🎪',
      'achievement': '🏆'
    };
    return icons[screenshotId] || '📱';
  }

  /**
   * Generate all screenshots
   */
  async generateAllScreenshots() {
    console.log('📱 Generating App Store screenshots...\n');

    for (const deviceType of Object.keys(SCREENSHOT_SPECS)) {
      const deviceSpec = SCREENSHOT_SPECS[deviceType];
      console.log(`📱 Generating screenshots for ${deviceSpec.name}...`);

      const deviceDir = path.join(this.outputDir, deviceType.replace(/[^a-zA-Z0-9]/g, '_'));
      if (!fs.existsSync(deviceDir)) {
        fs.mkdirSync(deviceDir, { recursive: true });
      }

      for (const screenshot of SCREENSHOTS) {
        const htmlContent = this.generateScreenshotHTML(screenshot, deviceSpec);
        const htmlFile = path.join(deviceDir, `${screenshot.id}.html`);
        
        fs.writeFileSync(htmlFile, htmlContent);
        console.log(`  ✅ Generated: ${screenshot.title}`);
      }
    }

    this.generateScreenshotInstructions();
    console.log('\n🎉 Screenshot generation completed!');
    console.log(`📁 Screenshots saved to: ${this.outputDir}`);
  }

  /**
   * Generate instructions for capturing screenshots
   */
  generateScreenshotInstructions() {
    const instructions = `# App Store Screenshots Instructions

## 📱 Generated Screenshot Files

This directory contains HTML files that can be used to capture App Store screenshots.

### Device Types Generated:
${Object.entries(SCREENSHOT_SPECS).map(([type, spec]) => 
  `- **${type}** (${spec.name}): ${spec.width}x${spec.height}px`
).join('\n')}

### Screenshots Generated:
${SCREENSHOTS.map((screenshot, index) => 
  `${index + 1}. **${screenshot.title}**
   - File: \`${screenshot.id}.html\`
   - Description: ${screenshot.description}`
).join('\n\n')}

## 🛠️ How to Capture Screenshots

### Method 1: Browser Screenshot (Recommended)
1. Open each HTML file in Chrome/Safari
2. Set browser window to exact device dimensions
3. Use browser dev tools device emulation
4. Take screenshot or use browser screenshot extensions

### Method 2: Automated Screenshot Tool
\`\`\`bash
# Install puppeteer for automated screenshots
npm install -g puppeteer

# Run screenshot capture script
node capture-screenshots.js
\`\`\`

### Method 3: Manual Capture
1. Open HTML files in browser
2. Resize window to match device dimensions
3. Use system screenshot tools
4. Crop to exact specifications

## 📋 App Store Requirements

### Screenshot Specifications:
- **iPhone 6.7"**: 1290 x 2796 pixels (iPhone 14 Pro Max)
- **iPhone 6.5"**: 1242 x 2688 pixels (iPhone 11 Pro Max)  
- **iPhone 5.5"**: 1242 x 2208 pixels (iPhone 8 Plus)

### File Requirements:
- Format: PNG or JPEG
- Color space: sRGB or P3
- Maximum file size: 8MB per screenshot
- Minimum 3 screenshots, maximum 10 screenshots

## ✅ Quality Checklist

Before submitting screenshots:
- [ ] All text is clearly readable
- [ ] Screenshots show actual app functionality
- [ ] No placeholder or lorem ipsum text
- [ ] Consistent visual style across all screenshots
- [ ] Screenshots highlight key app features
- [ ] All screenshots are properly sized for target devices

## 📝 Screenshot Descriptions for App Store

Use these descriptions when uploading to App Store Connect:

1. **${SCREENSHOTS[0].title}**: ${SCREENSHOTS[0].description}
2. **${SCREENSHOTS[1].title}**: ${SCREENSHOTS[1].description}
3. **${SCREENSHOTS[2].title}**: ${SCREENSHOTS[2].description}
4. **${SCREENSHOTS[3].title}**: ${SCREENSHOTS[3].description}
5. **${SCREENSHOTS[4].title}**: ${SCREENSHOTS[4].description}

---

Generated on: ${new Date().toISOString()}
`;

    fs.writeFileSync(path.join(this.outputDir, 'README.md'), instructions);
  }
}

// Main execution
if (require.main === module) {
  const generator = new ScreenshotGenerator();
  generator.generateAllScreenshots().catch(console.error);
}

module.exports = ScreenshotGenerator;