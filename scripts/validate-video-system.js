#!/usr/bin/env node

/**
 * 视频内容系统验证脚本
 * 验证视频URL、CDN配置、内容可访问性等
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// 配置
const CONFIG = {
  timeout: 10000,
  maxRetries: 3,
  cdnBaseUrl: process.env.CDN_BASE_URL || 'https://cdn.smartalk.app',
  backupUrls: [
    'https://backup-cdn.smartalk.app',
    'https://static.smartalk.app'
  ]
};

// 测试URL列表
const TEST_URLS = [
  // 主要视频文件
  'videos/travel/airport-scene.mp4',
  'videos/movies/dialogue-scene.mp4',
  'videos/workplace/meeting-scene.mp4',
  
  // 字幕文件
  'subtitles/travel/airport-scene.srt',
  'subtitles/movies/dialogue-scene.srt',
  'subtitles/workplace/meeting-scene.srt',
  
  // 音频文件
  'audio/travel/airport-vocabulary.mp3',
  'audio/movies/dialogue-vocabulary.mp3',
  'audio/workplace/meeting-vocabulary.mp3',
  
  // 缩略图
  'thumbnails/travel/airport-thumb.jpg',
  'thumbnails/movies/dialogue-thumb.jpg',
  'thumbnails/workplace/meeting-thumb.jpg'
];

/**
 * 检查URL可访问性
 */
async function checkUrl(url, retries = 0) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const request = protocol.get(url, { timeout: CONFIG.timeout }, (response) => {
      const { statusCode, headers } = response;
      
      resolve({
        url,
        status: statusCode,
        accessible: statusCode >= 200 && statusCode < 400,
        contentType: headers['content-type'],
        contentLength: headers['content-length'],
        lastModified: headers['last-modified'],
        cacheControl: headers['cache-control']
      });
    });

    request.on('error', (error) => {
      if (retries < CONFIG.maxRetries) {
        console.log(`⚠️  Retrying ${url} (attempt ${retries + 1})`);
        setTimeout(() => {
          checkUrl(url, retries + 1).then(resolve);
        }, 1000 * (retries + 1));
      } else {
        resolve({
          url,
          status: 0,
          accessible: false,
          error: error.message
        });
      }
    });

    request.on('timeout', () => {
      request.destroy();
      if (retries < CONFIG.maxRetries) {
        console.log(`⏰ Timeout for ${url}, retrying...`);
        setTimeout(() => {
          checkUrl(url, retries + 1).then(resolve);
        }, 1000 * (retries + 1));
      } else {
        resolve({
          url,
          status: 0,
          accessible: false,
          error: 'Request timeout'
        });
      }
    });
  });
}

/**
 * 验证CDN配置
 */
async function validateCDNConfig() {
  console.log('🌐 Validating CDN Configuration...\n');
  
  const results = {
    primary: [],
    backup: [],
    summary: {
      total: 0,
      accessible: 0,
      failed: 0
    }
  };

  // 测试主CDN
  console.log(`📡 Testing Primary CDN: ${CONFIG.cdnBaseUrl}`);
  for (const testPath of TEST_URLS) {
    const url = `${CONFIG.cdnBaseUrl}/${testPath}`;
    const result = await checkUrl(url);
    results.primary.push(result);
    results.summary.total++;
    
    if (result.accessible) {
      results.summary.accessible++;
      console.log(`✅ ${testPath} - ${result.status} (${result.contentType})`);
    } else {
      results.summary.failed++;
      console.log(`❌ ${testPath} - ${result.error || result.status}`);
    }
  }

  // 测试备用CDN
  console.log(`\n🔄 Testing Backup CDNs...`);
  for (const backupUrl of CONFIG.backupUrls) {
    console.log(`📡 Testing: ${backupUrl}`);
    const backupResults = [];
    
    for (const testPath of TEST_URLS.slice(0, 3)) { // 只测试前3个
      const url = `${backupUrl}/${testPath}`;
      const result = await checkUrl(url);
      backupResults.push(result);
      
      if (result.accessible) {
        console.log(`✅ ${testPath} - ${result.status}`);
      } else {
        console.log(`❌ ${testPath} - ${result.error || result.status}`);
      }
    }
    
    results.backup.push({
      baseUrl: backupUrl,
      results: backupResults
    });
  }

  return results;
}

/**
 * 验证本地内容文件
 */
function validateLocalContent() {
  console.log('\n📁 Validating Local Content Files...\n');
  
  const contentDir = path.join(__dirname, '..', 'content');
  const results = {
    videos: [],
    audio: [],
    subtitles: [],
    thumbnails: [],
    summary: {
      total: 0,
      found: 0,
      missing: 0
    }
  };

  const categories = ['videos', 'audio', 'subtitles', 'thumbnails'];
  
  categories.forEach(category => {
    const categoryDir = path.join(contentDir, category);
    
    if (fs.existsSync(categoryDir)) {
      const files = fs.readdirSync(categoryDir, { recursive: true });
      
      files.forEach(file => {
        if (typeof file === 'string') {
          const filePath = path.join(categoryDir, file);
          const stats = fs.statSync(filePath);
          
          results[category].push({
            path: file,
            size: stats.size,
            modified: stats.mtime,
            accessible: true
          });
          
          results.summary.found++;
          console.log(`✅ ${category}/${file} - ${(stats.size / 1024).toFixed(1)}KB`);
        }
      });
    } else {
      console.log(`⚠️  Directory not found: ${categoryDir}`);
    }
    
    results.summary.total += results[category].length;
  });

  return results;
}

/**
 * 生成验证报告
 */
function generateReport(cdnResults, localResults) {
  const report = {
    timestamp: new Date().toISOString(),
    cdn: cdnResults,
    local: localResults,
    recommendations: []
  };

  // 生成建议
  if (cdnResults.summary.failed > 0) {
    report.recommendations.push('修复失败的CDN URL访问问题');
  }
  
  if (localResults.summary.missing > 0) {
    report.recommendations.push('补充缺失的本地内容文件');
  }
  
  if (cdnResults.summary.accessible / cdnResults.summary.total < 0.8) {
    report.recommendations.push('CDN可用性低于80%，需要检查配置');
  }

  // 保存报告
  const reportPath = path.join(__dirname, '..', 'reports', 'video-system-validation.json');
  const reportDir = path.dirname(reportPath);
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  return report;
}

/**
 * 主验证函数
 */
async function main() {
  console.log('🎬 SmarTalk Video System Validation\n');
  console.log('=' * 50 + '\n');

  try {
    // 验证CDN配置
    const cdnResults = await validateCDNConfig();
    
    // 验证本地内容
    const localResults = validateLocalContent();
    
    // 生成报告
    const report = generateReport(cdnResults, localResults);
    
    // 显示总结
    console.log('\n📊 Validation Summary');
    console.log('====================');
    console.log(`CDN Accessibility: ${cdnResults.summary.accessible}/${cdnResults.summary.total} (${(cdnResults.summary.accessible/cdnResults.summary.total*100).toFixed(1)}%)`);
    console.log(`Local Files Found: ${localResults.summary.found}/${localResults.summary.total}`);
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      report.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }
    
    console.log(`\n📄 Full report saved to: reports/video-system-validation.json`);
    
    // 退出码
    const success = cdnResults.summary.accessible > 0 || localResults.summary.found > 0;
    process.exit(success ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  }
}

// 运行验证
if (require.main === module) {
  main();
}

module.exports = { checkUrl, validateCDNConfig, validateLocalContent };
