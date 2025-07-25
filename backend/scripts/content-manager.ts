#!/usr/bin/env ts-node

/**
 * SmarTalk Content Management Tool
 * 内容管理和验证工具
 */

import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 内容文件路径配置
const CONTENT_BASE_PATH = path.join(__dirname, '../../content');
const THEMES = ['travel', 'movies', 'workplace'];

interface ContentManifest {
  videos: string[];
  audio: string[];
  clips: string[];
  images: string[];
  subtitles: string[];
  missing: string[];
  errors: string[];
}

// 生成内容清单
async function generateContentManifest(): Promise<ContentManifest> {
  console.log('📋 Generating content manifest...');
  
  const manifest: ContentManifest = {
    videos: [],
    audio: [],
    clips: [],
    images: [],
    subtitles: [],
    missing: [],
    errors: []
  };

  try {
    // 获取数据库中的所有内容引用
    const dramas = await prisma.drama.findMany({
      include: {
        keywords: {
          include: {
            videoClips: true
          }
        }
      }
    });

    // 检查视频文件
    for (const drama of dramas) {
      const videoFiles = [
        drama.videoUrl,
        drama.videoUrlNoSubs,
        drama.subtitleUrl
      ];

      for (const file of videoFiles) {
        if (file) {
          const filePath = path.join(CONTENT_BASE_PATH, file);
          if (fs.existsSync(filePath)) {
            if (file.endsWith('.mp4')) {
              manifest.videos.push(file);
            } else if (file.endsWith('.srt')) {
              manifest.subtitles.push(file);
            }
          } else {
            manifest.missing.push(file);
          }
        }
      }

      // 检查词汇音频和视频片段
      for (const keyword of drama.keywords) {
        // 音频文件
        if (keyword.audioUrl) {
          const audioPath = path.join(CONTENT_BASE_PATH, keyword.audioUrl);
          if (fs.existsSync(audioPath)) {
            manifest.audio.push(keyword.audioUrl);
          } else {
            manifest.missing.push(keyword.audioUrl);
          }
        }

        // 视频片段
        for (const clip of keyword.videoClips) {
          const clipPath = path.join(CONTENT_BASE_PATH, clip.videoUrl);
          if (fs.existsSync(clipPath)) {
            manifest.clips.push(clip.videoUrl);
          } else {
            manifest.missing.push(clip.videoUrl);
          }
        }
      }
    }

    // 检查图片文件
    const interests = await prisma.interest.findMany();
    for (const interest of interests) {
      if (interest.iconUrl) {
        const iconPath = path.join(CONTENT_BASE_PATH, interest.iconUrl);
        if (fs.existsSync(iconPath)) {
          manifest.images.push(interest.iconUrl);
        } else {
          manifest.missing.push(interest.iconUrl);
        }
      }
    }

  } catch (error) {
    manifest.errors.push(`Database error: ${error}`);
  }

  return manifest;
}

// 验证内容完整性
async function validateContent(): Promise<boolean> {
  console.log('🔍 Validating content integrity...');
  
  const manifest = await generateContentManifest();
  
  console.log('\n📊 Content Summary:');
  console.log(`  Videos: ${manifest.videos.length}`);
  console.log(`  Audio: ${manifest.audio.length}`);
  console.log(`  Clips: ${manifest.clips.length}`);
  console.log(`  Images: ${manifest.images.length}`);
  console.log(`  Subtitles: ${manifest.subtitles.length}`);
  
  if (manifest.missing.length > 0) {
    console.log(`\n❌ Missing files (${manifest.missing.length}):`);
    manifest.missing.forEach(file => console.log(`  - ${file}`));
  }
  
  if (manifest.errors.length > 0) {
    console.log(`\n⚠️  Errors (${manifest.errors.length}):`);
    manifest.errors.forEach(error => console.log(`  - ${error}`));
  }
  
  const isValid = manifest.missing.length === 0 && manifest.errors.length === 0;
  
  if (isValid) {
    console.log('\n✅ All content files are present and valid!');
  } else {
    console.log('\n❌ Content validation failed!');
  }
  
  return isValid;
}

// 创建内容目录结构
function createContentDirectories(): void {
  console.log('📁 Creating content directory structure...');
  
  const directories = [
    'videos/travel',
    'videos/movies', 
    'videos/workplace',
    'audio/travel',
    'audio/movies',
    'audio/workplace',
    'clips/travel',
    'clips/movies',
    'clips/workplace',
    'images/interests',
    'images/dramas',
    'images/ui',
    'subtitles/travel',
    'subtitles/movies',
    'subtitles/workplace'
  ];
  
  directories.forEach(dir => {
    const fullPath = path.join(CONTENT_BASE_PATH, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`  ✅ Created: ${dir}`);
    } else {
      console.log(`  📁 Exists: ${dir}`);
    }
  });
}

// 生成内容制作清单
async function generateProductionChecklist(): Promise<void> {
  console.log('📝 Generating content production checklist...');
  
  try {
    const dramas = await prisma.drama.findMany({
      include: {
        interest: true,
        keywords: {
          include: {
            videoClips: true
          }
        }
      }
    });

    let checklist = '# SmarTalk Content Production Checklist\n\n';
    checklist += '## 内容制作清单\n\n';
    
    for (const drama of dramas) {
      checklist += `### ${drama.interest.displayName} - ${drama.title}\n\n`;
      
      // 主视频
      checklist += '#### 主要视频内容\n';
      checklist += `- [ ] ${drama.videoUrl} (带字幕版本)\n`;
      checklist += `- [ ] ${drama.videoUrlNoSubs} (无字幕版本)\n`;
      checklist += `- [ ] ${drama.subtitleUrl} (字幕文件)\n`;
      checklist += `- [ ] ${drama.thumbnailUrl} (缩略图)\n\n`;
      
      // 词汇内容
      checklist += '#### 词汇内容\n';
      for (const keyword of drama.keywords) {
        checklist += `**${keyword.word} (${keyword.translation})**\n`;
        checklist += `- [ ] ${keyword.audioUrl} (发音音频)\n`;
        
        for (const clip of keyword.videoClips) {
          const type = clip.isCorrect ? '正确' : '干扰';
          checklist += `- [ ] ${clip.videoUrl} (${type}选项)\n`;
        }
        checklist += '\n';
      }
      
      checklist += '---\n\n';
    }
    
    // 写入文件
    const checklistPath = path.join(__dirname, '../docs/content-production-checklist.md');
    fs.writeFileSync(checklistPath, checklist);
    console.log(`✅ Checklist saved to: ${checklistPath}`);
    
  } catch (error) {
    console.error('❌ Failed to generate checklist:', error);
  }
}

// 主函数
async function main() {
  const command = process.argv[2];
  
  console.log('🎬 SmarTalk Content Manager');
  console.log('============================\n');
  
  switch (command) {
    case 'validate':
      await validateContent();
      break;
      
    case 'manifest':
      const manifest = await generateContentManifest();
      console.log(JSON.stringify(manifest, null, 2));
      break;
      
    case 'setup':
      createContentDirectories();
      break;
      
    case 'checklist':
      await generateProductionChecklist();
      break;
      
    case 'all':
      createContentDirectories();
      await generateProductionChecklist();
      await validateContent();
      break;
      
    default:
      console.log('Available commands:');
      console.log('  validate  - Validate content integrity');
      console.log('  manifest  - Generate content manifest');
      console.log('  setup     - Create directory structure');
      console.log('  checklist - Generate production checklist');
      console.log('  all       - Run all commands');
      console.log('\nUsage: npm run content-manager <command>');
  }
  
  await prisma.$disconnect();
}

// 运行主函数
if (require.main === module) {
  main().catch(console.error);
}

export { generateContentManifest, validateContent, createContentDirectories };
