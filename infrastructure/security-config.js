/**
 * Security Configuration for SmarTalk Production Environment
 * Implements comprehensive security measures including rate limiting,
 * authentication, authorization, and data protection
 */

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const jwt = require('jsonwebtoken');

// Rate Limiting Configuration
const RATE_LIMITS = {
  // General API rate limiting
  general: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Authentication endpoints (stricter)
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 auth attempts per windowMs
    message: {
      error: 'Too many authentication attempts, please try again later.',
      retryAfter: '15 minutes'
    },
    skipSuccessfulRequests: true,
  }),

  // Content API (more lenient for learning app)
  content: rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute for content
    message: {
      error: 'Content request limit exceeded, please slow down.',
      retryAfter: '1 minute'
    },
  }),

  // Analytics events (high volume expected)
  analytics: rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // 60 analytics events per minute
    message: {
      error: 'Analytics rate limit exceeded.',
      retryAfter: '1 minute'
    },
  })
};

// CORS Configuration
const CORS_CONFIG = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://smartalk.com',
      'https://www.smartalk.com',
      'https://app.smartalk.com',
      'https://admin.smartalk.com',
      // Development origins
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8081', // React Native Metro
    ];

    if (process.env.NODE_ENV === 'development') {
      // Allow all origins in development
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Device-ID',
    'X-App-Version'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining']
};

// Helmet Security Configuration
const HELMET_CONFIG = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://cdn.smartalk.com"],
      mediaSrc: ["'self'", "https://cdn.smartalk.com"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.smartalk.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for video content
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  }
};

// JWT Configuration
const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  expiresIn: '24h',
  issuer: 'smartalk-api',
  audience: 'smartalk-app'
};

// Input Validation Schemas
const VALIDATION_SCHEMAS = {
  // User creation
  createUser: {
    deviceId: {
      type: 'string',
      required: true,
      minLength: 10,
      maxLength: 100,
      pattern: /^[a-zA-Z0-9-_]+$/
    }
  },

  // Progress tracking
  updateProgress: {
    userId: {
      type: 'string',
      required: true,
      format: 'uuid'
    },
    keywordId: {
      type: 'string',
      required: true,
      format: 'uuid'
    },
    completed: {
      type: 'boolean',
      required: true
    }
  },

  // Analytics events
  analyticsEvent: {
    eventType: {
      type: 'string',
      required: true,
      enum: [
        'app_launched',
        'onboarding_started',
        'interest_selected',
        'preview_video_completed',
        'vtpr_learning_started',
        'first_clue_completed',
        'all_clues_completed',
        'magic_moment_completed',
        'user_feedback_submitted'
      ]
    },
    userId: {
      type: 'string',
      required: true,
      format: 'uuid'
    },
    metadata: {
      type: 'object',
      required: false
    }
  }
};

// Security Middleware Factory
class SecurityMiddleware {
  static rateLimiter(type = 'general') {
    return RATE_LIMITS[type] || RATE_LIMITS.general;
  }

  static cors() {
    return cors(CORS_CONFIG);
  }

  static helmet() {
    return helmet(HELMET_CONFIG);
  }

  static validateInput(schema) {
    return (req, res, next) => {
      const errors = [];
      
      for (const [field, rules] of Object.entries(schema)) {
        const value = req.body[field];
        
        // Required field check
        if (rules.required && (value === undefined || value === null)) {
          errors.push(`${field} is required`);
          continue;
        }
        
        if (value !== undefined && value !== null) {
          // Type validation
          if (rules.type && typeof value !== rules.type) {
            errors.push(`${field} must be of type ${rules.type}`);
          }
          
          // String validations
          if (rules.type === 'string' && typeof value === 'string') {
            if (rules.minLength && value.length < rules.minLength) {
              errors.push(`${field} must be at least ${rules.minLength} characters`);
            }
            if (rules.maxLength && value.length > rules.maxLength) {
              errors.push(`${field} must be no more than ${rules.maxLength} characters`);
            }
            if (rules.pattern && !rules.pattern.test(value)) {
              errors.push(`${field} format is invalid`);
            }
            if (rules.enum && !rules.enum.includes(value)) {
              errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
            }
            if (rules.format === 'uuid' && !isValidUUID(value)) {
              errors.push(`${field} must be a valid UUID`);
            }
          }
        }
      }
      
      if (errors.length > 0) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors
        });
      }
      
      next();
    };
  }

  static authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_CONFIG.secret, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
      }
      req.user = user;
      next();
    });
  }

  static generateToken(payload) {
    return jwt.sign(payload, JWT_CONFIG.secret, {
      expiresIn: JWT_CONFIG.expiresIn,
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience
    });
  }

  static sanitizeOutput(data) {
    // Remove sensitive fields from API responses
    const sensitiveFields = ['password', 'secret', 'token', 'key'];
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeOutput(item));
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized = { ...data };
      
      for (const field of sensitiveFields) {
        if (field in sanitized) {
          delete sanitized[field];
        }
      }
      
      // Recursively sanitize nested objects
      for (const [key, value] of Object.entries(sanitized)) {
        if (typeof value === 'object' && value !== null) {
          sanitized[key] = this.sanitizeOutput(value);
        }
      }
      
      return sanitized;
    }
    
    return data;
  }

  static logSecurityEvent(req, eventType, details = {}) {
    const securityLog = {
      timestamp: new Date().toISOString(),
      eventType,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      method: req.method,
      userId: req.user?.id,
      details
    };

    // In production, send to security monitoring system
    console.log('SECURITY_EVENT:', JSON.stringify(securityLog));
    
    // Critical events should trigger alerts
    const criticalEvents = ['BRUTE_FORCE_ATTEMPT', 'UNAUTHORIZED_ACCESS', 'INJECTION_ATTEMPT'];
    if (criticalEvents.includes(eventType)) {
      // Trigger alert system
      console.error('CRITICAL_SECURITY_EVENT:', JSON.stringify(securityLog));
    }
  }
}

// Utility functions
function isValidUUID(str) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Security monitoring middleware
const securityMonitoring = (req, res, next) => {
  // Monitor for suspicious patterns
  const suspiciousPatterns = [
    /(\bSELECT\b|\bUNION\b|\bINSERT\b|\bDELETE\b|\bDROP\b)/i, // SQL injection
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // XSS
    /(\.\.|\/etc\/|\/proc\/|\/sys\/)/i, // Path traversal
  ];

  const requestData = JSON.stringify(req.body) + req.url + (req.get('User-Agent') || '');
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(requestData)) {
      SecurityMiddleware.logSecurityEvent(req, 'INJECTION_ATTEMPT', {
        pattern: pattern.toString(),
        data: requestData.substring(0, 200) // Limit logged data
      });
      
      return res.status(400).json({
        error: 'Request blocked for security reasons'
      });
    }
  }

  next();
};

module.exports = {
  RATE_LIMITS,
  CORS_CONFIG,
  HELMET_CONFIG,
  JWT_CONFIG,
  VALIDATION_SCHEMAS,
  SecurityMiddleware,
  securityMonitoring
};