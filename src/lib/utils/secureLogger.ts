export const secureLogger = {
  error: (message: string, error?: any, context?: Record<string, any>) => {
    const sanitize = (obj: any): any => {
      if (typeof obj === 'string') {
        // Mask typical API key patterns (keep first 4 and last 4, mask middle)
        return obj.replace(/([a-zA-Z0-9]{4})[a-zA-Z0-9_-]{10,}([a-zA-Z0-9]{4})/g, '$1***MASKED***$2');
      }
      if (obj instanceof Error) {
        return {
          message: sanitize(obj.message),
          stack: sanitize(obj.stack || '')
        };
      }
      return obj;
    };
    
    console.error(`[SECURE_LOG] ${message}`, error ? sanitize(error) : '', context ? sanitize(JSON.stringify(context)) : '');
  },
  info: (message: string, context?: Record<string, any>) => {
    console.info(`[INFO] ${message}`, context ? JSON.stringify(context) : '');
  }
};
