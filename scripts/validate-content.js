#!/usr/bin/env node

/**
 * SmarTalk内容质量验证脚本
 * 验证学习内容的完整性和质量
 */

const fs = require('fs');
const path = require('path');

// 内容验证配置
const VALIDATION_CONFIG = {
  // 视频质量标准
  video: {
    minDuration: 3, // 最小时长(秒)
    maxDuration: 70, // 最大时长(秒)
    requiredFormats: ['mp4'],
    minResolution: '720p',
    maxFileSize: 50 * 1024 * 1024, // 50MB
  },
  
  // 音频质量标准
  audio: {
    minDuration: 1,
    maxDuration: 10,
    requiredFormats: ['mp3'],
    minBitrate: 128, // kbps
    maxFileSize: 5 * 1024 * 1024, // 5MB
  },
  
  // 学习内容标准
  content: {
    keywordsPerTheme: 15,
    optionsPerKeyword: 4,
    requiredThemes: ['travel', 'movies', 'workplace'],
  }
};

// 内容完整性检查
const CONTENT_CHECKLIST = {
  mainVideos: [
    {
      id: 'travel-paris-cafe',
      title: '巴黎咖啡馆初遇',
      files: [
        'travel-paris-cafe-subtitled.mp4',
        'travel-paris-cafe-no-subs.mp4'
      ]
    },
    {
      id: 'movies-theater-encounter', 
      title: '电影院偶遇',
      files: [
        'movies-theater-encounter-subtitled.mp4',
        'movies-theater-encounter-no-subs.mp4'
      ]
    },
    {
      id: 'workplace-meeting-discussion',
      title: '会议室讨论', 
      files: [
        'workplace-meeting-discussion-subtitled.mp4',
        'workplace-meeting-discussion-no-subs.mp4'
      ]
    }
  ],
  
  keywords: {
    travel: [
      'Welcome', 'Recommend', 'Signature', 'Perfect', 'Window',
      'Beautiful', 'Wonderful', 'Atmosphere', 'Magical', 'Hope',
      'Smooth', 'Aromatic', 'Choice', 'View', 'Exactly'
    ],
    movies: [
      'Incredible', 'Plot', 'Twist', 'Ending', 'Cinematography',
      'Stunning', 'Soundtrack', 'Emotional', 'Performance', 'Outstanding',
      'Transformation', 'Recommendation', 'Realistic', 'Captured', 'Impressive'
    ],
    workplace: [
      'Status', 'Contribute', 'Challenges', 'Deadline', 'Obstacles',
      'Prioritize', 'Critical', 'Implement', 'Strategy', 'Iteration',
      'Proposal', 'Teamwork', 'Eager', 'Overcome', 'Elaborate'
    ]
  }
};

/**
 * 验证文件是否存在
 */
function validateFileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

/**
 * 验证视频文件质量
 */
function validateVideoFile(filePath) {
  const results = {
    exists: false,
    size: 0,
    format: null,
    issues: []
  };

  if (!validateFileExists(filePath)) {
    results.issues.push('文件不存在');
    return results;
  }

  results.exists = true;
  
  try {
    const stats = fs.statSync(filePath);
    results.size = stats.size;
    
    // 检查文件大小
    if (results.size > VALIDATION_CONFIG.video.maxFileSize) {
      results.issues.push(`文件过大: ${(results.size / 1024 / 1024).toFixed(2)}MB`);
    }
    
    if (results.size < 1024) {
      results.issues.push('文件过小，可能损坏');
    }
    
    // 检查文件格式
    const ext = path.extname(filePath).toLowerCase().slice(1);
    results.format = ext;
    
    if (!VALIDATION_CONFIG.video.requiredFormats.includes(ext)) {
      results.issues.push(`不支持的格式: ${ext}`);
    }
    
  } catch (error) {
    results.issues.push(`文件读取错误: ${error.message}`);
  }
  
  return results;
}

/**
 * 验证音频文件质量
 */
function validateAudioFile(filePath) {
  const results = {
    exists: false,
    size: 0,
    format: null,
    issues: []
  };

  if (!validateFileExists(filePath)) {
    results.issues.push('文件不存在');
    return results;
  }

  results.exists = true;
  
  try {
    const stats = fs.statSync(filePath);
    results.size = stats.size;
    
    // 检查文件大小
    if (results.size > VALIDATION_CONFIG.audio.maxFileSize) {
      results.issues.push(`文件过大: ${(results.size / 1024 / 1024).toFixed(2)}MB`);
    }
    
    // 检查文件格式
    const ext = path.extname(filePath).toLowerCase().slice(1);
    results.format = ext;
    
    if (!VALIDATION_CONFIG.audio.requiredFormats.includes(ext)) {
      results.issues.push(`不支持的格式: ${ext}`);
    }
    
  } catch (error) {
    results.issues.push(`文件读取错误: ${error.message}`);
  }
  
  return results;
}

/**
 * 验证主视频完整性
 */
function validateMainVideos() {
  console.log('🎬 验证主视频完整性...\n');
  
  const results = {
    total: CONTENT_CHECKLIST.mainVideos.length * 2, // 每个视频2个版本
    passed: 0,
    failed: 0,
    issues: []
  };
  
  CONTENT_CHECKLIST.mainVideos.forEach(video => {
    console.log(`📹 检查视频: ${video.title}`);
    
    video.files.forEach(filename => {
      const filePath = path.join('content/videos/main', filename);
      const validation = validateVideoFile(filePath);
      
      if (validation.exists && validation.issues.length === 0) {
        results.passed++;
        console.log(`  ✅ ${filename} - 通过`);
      } else {
        results.failed++;
        console.log(`  ❌ ${filename} - 失败`);
        validation.issues.forEach(issue => {
          console.log(`     - ${issue}`);
          results.issues.push(`${filename}: ${issue}`);
        });
      }
    });
    
    console.log('');
  });
  
  return results;
}

/**
 * 验证vTPR视频完整性
 */
function validateVTPRVideos() {
  console.log('🎯 验证vTPR练习视频完整性...\n');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    issues: []
  };
  
  Object.entries(CONTENT_CHECKLIST.keywords).forEach(([theme, keywords]) => {
    console.log(`📚 检查${theme}主题词汇视频:`);
    
    keywords.forEach(keyword => {
      ['a', 'b', 'c', 'd'].forEach(option => {
        results.total++;
        const filename = `${keyword.toLowerCase()}-option-${option}.mp4`;
        const filePath = path.join('content/videos/vtpr', theme, filename);
        const validation = validateVideoFile(filePath);
        
        if (validation.exists && validation.issues.length === 0) {
          results.passed++;
          console.log(`  ✅ ${keyword}-${option.toUpperCase()}`);
        } else {
          results.failed++;
          console.log(`  ❌ ${keyword}-${option.toUpperCase()}`);
          validation.issues.forEach(issue => {
            results.issues.push(`${filename}: ${issue}`);
          });
        }
      });
    });
    
    console.log('');
  });
  
  return results;
}

/**
 * 验证音频文件完整性
 */
function validateAudioFiles() {
  console.log('🔊 验证音频文件完整性...\n');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    issues: []
  };
  
  // 统计所有关键词
  const allKeywords = Object.values(CONTENT_CHECKLIST.keywords).flat();
  results.total = allKeywords.length;
  
  allKeywords.forEach(keyword => {
    const filename = `${keyword.toLowerCase()}.mp3`;
    const filePath = path.join('content/videos/audio', filename);
    const validation = validateAudioFile(filePath);
    
    if (validation.exists && validation.issues.length === 0) {
      results.passed++;
      console.log(`  ✅ ${keyword} - 音频正常`);
    } else {
      results.failed++;
      console.log(`  ❌ ${keyword} - 音频问题`);
      validation.issues.forEach(issue => {
        console.log(`     - ${issue}`);
        results.issues.push(`${filename}: ${issue}`);
      });
    }
  });
  
  return results;
}

/**
 * 验证学习内容逻辑
 */
function validateContentLogic() {
  console.log('🧠 验证学习内容逻辑...\n');
  
  const results = {
    issues: [],
    warnings: []
  };
  
  // 检查主题数量
  const themeCount = Object.keys(CONTENT_CHECKLIST.keywords).length;
  if (themeCount !== VALIDATION_CONFIG.content.requiredThemes.length) {
    results.issues.push(`主题数量不匹配: 期望${VALIDATION_CONFIG.content.requiredThemes.length}个，实际${themeCount}个`);
  }
  
  // 检查每个主题的词汇数量
  Object.entries(CONTENT_CHECKLIST.keywords).forEach(([theme, keywords]) => {
    if (keywords.length !== VALIDATION_CONFIG.content.keywordsPerTheme) {
      results.issues.push(`${theme}主题词汇数量不匹配: 期望${VALIDATION_CONFIG.content.keywordsPerTheme}个，实际${keywords.length}个`);
    }
    
    // 检查词汇重复
    const uniqueKeywords = [...new Set(keywords)];
    if (uniqueKeywords.length !== keywords.length) {
      results.issues.push(`${theme}主题存在重复词汇`);
    }
    
    // 检查词汇长度
    keywords.forEach(keyword => {
      if (keyword.length < 2) {
        results.warnings.push(`${theme}主题词汇"${keyword}"过短`);
      }
      if (keyword.length > 20) {
        results.warnings.push(`${theme}主题词汇"${keyword}"过长`);
      }
    });
  });
  
  // 检查跨主题词汇重复
  const allKeywords = Object.values(CONTENT_CHECKLIST.keywords).flat();
  const uniqueAllKeywords = [...new Set(allKeywords)];
  if (uniqueAllKeywords.length !== allKeywords.length) {
    results.warnings.push('存在跨主题重复词汇');
  }
  
  if (results.issues.length === 0) {
    console.log('✅ 学习内容逻辑验证通过');
  } else {
    console.log('❌ 学习内容逻辑存在问题:');
    results.issues.forEach(issue => console.log(`  - ${issue}`));
  }
  
  if (results.warnings.length > 0) {
    console.log('⚠️  学习内容警告:');
    results.warnings.forEach(warning => console.log(`  - ${warning}`));
  }
  
  console.log('');
  return results;
}

/**
 * 生成验证报告
 */
function generateValidationReport(mainVideos, vtprVideos, audioFiles, contentLogic) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: mainVideos.total + vtprVideos.total + audioFiles.total,
      passedFiles: mainVideos.passed + vtprVideos.passed + audioFiles.passed,
      failedFiles: mainVideos.failed + vtprVideos.failed + audioFiles.failed,
      overallStatus: 'UNKNOWN'
    },
    details: {
      mainVideos,
      vtprVideos,
      audioFiles,
      contentLogic
    },
    recommendations: []
  };
  
  // 计算总体状态
  const passRate = report.summary.passedFiles / report.summary.totalFiles;
  if (passRate >= 0.95) {
    report.summary.overallStatus = 'EXCELLENT';
  } else if (passRate >= 0.8) {
    report.summary.overallStatus = 'GOOD';
  } else if (passRate >= 0.6) {
    report.summary.overallStatus = 'NEEDS_IMPROVEMENT';
  } else {
    report.summary.overallStatus = 'CRITICAL';
  }
  
  // 生成建议
  if (mainVideos.failed > 0) {
    report.recommendations.push('重新生成失败的主视频文件');
  }
  if (vtprVideos.failed > 0) {
    report.recommendations.push('补充缺失的vTPR练习视频');
  }
  if (audioFiles.failed > 0) {
    report.recommendations.push('重新录制或生成音频文件');
  }
  if (contentLogic.issues.length > 0) {
    report.recommendations.push('修复学习内容逻辑问题');
  }
  
  return report;
}

/**
 * 主验证函数
 */
function main() {
  console.log('🔍 SmarTalk内容质量验证工具\n');
  console.log('=' * 50 + '\n');
  
  // 执行各项验证
  const mainVideosResult = validateMainVideos();
  const vtprVideosResult = validateVTPRVideos();
  const audioFilesResult = validateAudioFiles();
  const contentLogicResult = validateContentLogic();
  
  // 生成验证报告
  const report = generateValidationReport(
    mainVideosResult,
    vtprVideosResult, 
    audioFilesResult,
    contentLogicResult
  );
  
  // 输出总结
  console.log('📊 验证总结:');
  console.log('=' * 30);
  console.log(`总文件数: ${report.summary.totalFiles}`);
  console.log(`通过文件: ${report.summary.passedFiles}`);
  console.log(`失败文件: ${report.summary.failedFiles}`);
  console.log(`通过率: ${((report.summary.passedFiles / report.summary.totalFiles) * 100).toFixed(1)}%`);
  console.log(`总体状态: ${report.summary.overallStatus}\n`);
  
  // 输出建议
  if (report.recommendations.length > 0) {
    console.log('💡 改进建议:');
    report.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
    console.log('');
  }
  
  // 保存详细报告
  fs.writeFileSync('content/validation-report.json', JSON.stringify(report, null, 2));
  console.log('📄 详细报告已保存到: content/validation-report.json');
  
  // 返回状态码
  if (report.summary.overallStatus === 'CRITICAL') {
    process.exit(1);
  } else if (report.summary.overallStatus === 'NEEDS_IMPROVEMENT') {
    process.exit(2);
  } else {
    process.exit(0);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = {
  validateVideoFile,
  validateAudioFile,
  validateMainVideos,
  validateVTPRVideos,
  validateAudioFiles,
  validateContentLogic
};