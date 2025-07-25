import Joi from 'joi';

/**
 * 验证分析事件数据
 */
export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
}

// 分析事件验证模式
const analyticsEventSchema = Joi.object({
  userId: Joi.string().required().min(1).max(100),
  eventType: Joi.string().required().min(1).max(50).pattern(/^[a-z_]+$/),
  eventData: Joi.object().optional().default({}),
  timestamp: Joi.date().optional().default(() => new Date()),
});

// 批量事件验证模式
const batchEventsSchema = Joi.object({
  events: Joi.array().items(analyticsEventSchema).min(1).max(100).required(),
});

/**
 * 验证单个分析事件
 */
export function validateAnalyticsEvent(data: any): ValidationResult {
  const { error } = analyticsEventSchema.validate(data, { abortEarly: false });
  
  if (error) {
    return {
      isValid: false,
      errors: error.details.map(detail => detail.message),
    };
  }
  
  return { isValid: true };
}

/**
 * 验证批量分析事件
 */
export function validateBatchEvents(data: any): ValidationResult {
  const { error } = batchEventsSchema.validate(data, { abortEarly: false });
  
  if (error) {
    return {
      isValid: false,
      errors: error.details.map(detail => detail.message),
    };
  }
  
  return { isValid: true };
}

/**
 * 验证用户ID
 */
export function validateUserId(userId: string): ValidationResult {
  if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
    return {
      isValid: false,
      errors: ['User ID is required and must be a non-empty string'],
    };
  }
  
  if (userId.length > 100) {
    return {
      isValid: false,
      errors: ['User ID must be less than 100 characters'],
    };
  }
  
  return { isValid: true };
}

/**
 * 验证事件类型
 */
export function validateEventType(eventType: string): ValidationResult {
  const validEventTypes = [
    // Onboarding events
    'app_launch',
    'onboarding_start',
    'onboarding_step_complete',
    'onboarding_complete',
    'onboarding_skip',
    
    // Interest selection events
    'interest_selection_start',
    'interest_selected',
    'interest_selection_complete',
    
    // Video preview events
    'video_preview_start',
    'video_preview_play',
    'video_preview_pause',
    'video_preview_complete',
    'video_preview_skip',
    
    // vTPR learning events
    'vtpr_start',
    'vtpr_audio_play',
    'vtpr_option_select',
    'vtpr_answer_correct',
    'vtpr_answer_incorrect',
    'vtpr_hint_used',
    'vtpr_keyword_complete',
    'vtpr_session_complete',
    'vtpr_session_abandon',
    
    // Magic moment events
    'magic_moment_trigger',
    'magic_moment_start',
    'magic_moment_video_play',
    'magic_moment_video_complete',
    'magic_moment_complete',
    'magic_moment_feedback',
    
    // Retention events
    'retention_day1',
    'retention_day7',
    'retention_day30',
    
    // Error events
    'error_video_load',
    'error_audio_load',
    'error_api_call',
    'error_network',
    
    // Performance events
    'performance_app_start',
    'performance_video_load_time',
    'performance_api_response_time',
  ];
  
  if (!validEventTypes.includes(eventType)) {
    return {
      isValid: false,
      errors: [`Invalid event type: ${eventType}. Must be one of: ${validEventTypes.join(', ')}`],
    };
  }
  
  return { isValid: true };
}

/**
 * 验证日期范围
 */
export function validateDateRange(startDate?: string, endDate?: string): ValidationResult {
  const errors: string[] = [];
  
  if (startDate) {
    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      errors.push('Invalid start date format');
    }
  }
  
  if (endDate) {
    const end = new Date(endDate);
    if (isNaN(end.getTime())) {
      errors.push('Invalid end date format');
    }
  }
  
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start.getTime() > end.getTime()) {
      errors.push('Start date must be before end date');
    }
    
    // 限制查询范围不超过1年
    const oneYearMs = 365 * 24 * 60 * 60 * 1000;
    if (end.getTime() - start.getTime() > oneYearMs) {
      errors.push('Date range cannot exceed 1 year');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * 清理和标准化事件数据
 */
export function sanitizeEventData(eventData: any): Record<string, any> {
  if (!eventData || typeof eventData !== 'object') {
    return {};
  }
  
  const sanitized: Record<string, any> = {};
  
  // 只保留安全的数据类型
  for (const [key, value] of Object.entries(eventData)) {
    if (typeof key === 'string' && key.length <= 50) {
      if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        value === null
      ) {
        // 限制字符串长度
        if (typeof value === 'string' && value.length > 1000) {
          sanitized[key] = value.substring(0, 1000);
        } else {
          sanitized[key] = value;
        }
      } else if (Array.isArray(value) && value.length <= 10) {
        // 限制数组长度和内容类型
        sanitized[key] = value.filter(item => 
          typeof item === 'string' || 
          typeof item === 'number' || 
          typeof item === 'boolean'
        ).slice(0, 10);
      }
    }
  }
  
  return sanitized;
}