/**
 * CDN Configuration for SmarTalk Video Content
 * Supports CloudFlare, AWS CloudFront, and other CDN providers
 */

const CDN_CONFIG = {
  // Primary CDN Configuration
  primary: {
    provider: 'cloudflare', // 'cloudflare' | 'aws' | 'azure' | 'custom'
    baseUrl: 'https://cdn.smartalk.com',
    zones: {
      videos: 'smartalk-videos',
      audio: 'smartalk-audio',
      images: 'smartalk-images'
    }
  },

  // Content Distribution Settings
  distribution: {
    // Video content settings
    videos: {
      formats: ['mp4', 'webm'],
      qualities: ['720p', '480p', '360p'],
      cacheTTL: 86400, // 24 hours
      geoRestrictions: false,
      compressionLevel: 'high'
    },
    
    // Audio content settings
    audio: {
      formats: ['mp3', 'aac'],
      bitrates: ['128kbps', '64kbps'],
      cacheTTL: 86400,
      compressionLevel: 'medium'
    },
    
    // Image content settings
    images: {
      formats: ['webp', 'jpg', 'png'],
      sizes: ['original', '1080p', '720p', '480p'],
      cacheTTL: 604800, // 7 days
      optimization: true
    }
  },

  // Regional Edge Locations
  edgeLocations: [
    'asia-east1',      // Hong Kong
    'asia-southeast1', // Singapore
    'us-west1',        // California
    'europe-west1',    // Belgium
    'asia-northeast1'  // Tokyo
  ],

  // Performance Optimization
  optimization: {
    enableBrotli: true,
    enableGzip: true,
    minifyCSS: true,
    minifyJS: true,
    enableHTTP2: true,
    enableHTTP3: true
  },

  // Security Settings
  security: {
    enableHSTS: true,
    enableCSP: true,
    hotlinkProtection: true,
    rateLimiting: {
      requests: 1000,
      window: '1h'
    }
  }
};

// CloudFlare specific configuration
const CLOUDFLARE_CONFIG = {
  zoneId: process.env.CLOUDFLARE_ZONE_ID,
  apiToken: process.env.CLOUDFLARE_API_TOKEN,
  
  // Page Rules for different content types
  pageRules: [
    {
      pattern: '*/videos/*',
      settings: {
        cacheLevel: 'cache_everything',
        edgeCacheTtl: 86400,
        browserCacheTtl: 86400
      }
    },
    {
      pattern: '*/audio/*',
      settings: {
        cacheLevel: 'cache_everything',
        edgeCacheTtl: 86400,
        browserCacheTtl: 86400
      }
    }
  ],

  // Transform Rules for optimization
  transformRules: [
    {
      description: 'Optimize images',
      expression: 'http.request.uri.path matches "\\.(jpg|jpeg|png|gif|webp)$"',
      action: 'rewrite',
      parameters: {
        uri: {
          path: {
            value: '/cdn-cgi/image/format=auto,quality=85${http.request.uri.path}'
          }
        }
      }
    }
  ]
};

// AWS CloudFront configuration
const AWS_CLOUDFRONT_CONFIG = {
  distributionId: process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID,
  originDomain: 'smartalk-content.s3.amazonaws.com',
  
  behaviors: [
    {
      pathPattern: '/videos/*',
      targetOriginId: 'S3-smartalk-videos',
      viewerProtocolPolicy: 'redirect-to-https',
      cachePolicyId: 'video-cache-policy',
      compress: true
    },
    {
      pathPattern: '/audio/*',
      targetOriginId: 'S3-smartalk-audio',
      viewerProtocolPolicy: 'redirect-to-https',
      cachePolicyId: 'audio-cache-policy',
      compress: true
    }
  ],

  customErrorPages: [
    {
      errorCode: 404,
      responseCode: 200,
      responsePagePath: '/error/404.html',
      errorCachingMinTTL: 300
    }
  ]
};

// Content Upload and Management
class CDNManager {
  constructor(config = CDN_CONFIG) {
    this.config = config;
    this.provider = this.initializeProvider();
  }

  initializeProvider() {
    switch (this.config.primary.provider) {
      case 'cloudflare':
        return new CloudFlareProvider(CLOUDFLARE_CONFIG);
      case 'aws':
        return new AWSProvider(AWS_CLOUDFRONT_CONFIG);
      default:
        throw new Error(`Unsupported CDN provider: ${this.config.primary.provider}`);
    }
  }

  async uploadContent(filePath, contentType, metadata = {}) {
    const optimizedFile = await this.optimizeContent(filePath, contentType);
    const uploadResult = await this.provider.upload(optimizedFile, metadata);
    
    // Generate multiple formats/qualities if needed
    if (contentType === 'video') {
      await this.generateVideoVariants(uploadResult.url);
    }
    
    return uploadResult;
  }

  async optimizeContent(filePath, contentType) {
    switch (contentType) {
      case 'video':
        return this.optimizeVideo(filePath);
      case 'audio':
        return this.optimizeAudio(filePath);
      case 'image':
        return this.optimizeImage(filePath);
      default:
        return filePath;
    }
  }

  async optimizeVideo(filePath) {
    // Use FFmpeg for video optimization
    const qualities = this.config.distribution.videos.qualities;
    const optimizedVersions = [];

    for (const quality of qualities) {
      const outputPath = `${filePath}_${quality}.mp4`;
      // FFmpeg command would go here
      optimizedVersions.push(outputPath);
    }

    return optimizedVersions;
  }

  async purgeCache(urls) {
    return await this.provider.purgeCache(urls);
  }

  async getAnalytics(timeRange = '24h') {
    return await this.provider.getAnalytics(timeRange);
  }
}

// Export configuration and manager
module.exports = {
  CDN_CONFIG,
  CLOUDFLARE_CONFIG,
  AWS_CLOUDFRONT_CONFIG,
  CDNManager
};