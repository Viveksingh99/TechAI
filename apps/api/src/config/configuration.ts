export interface AppConfig {
  port: number;
  nodeEnv: string;
  apiPrefix: string;
  frontendUrl: string;
  jwt: {
    accessSecret: string;
    accessExpiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
  bcryptSaltRounds: number;
  cookie: {
    secret: string;
    domain?: string;
  };
  throttle: {
    ttl: number;
    limit: number;
  };
  oauth: {
    google: { clientId?: string; clientSecret?: string; callbackUrl?: string };
    github: { clientId?: string; clientSecret?: string; callbackUrl?: string };
  };
  mail: {
    from: string;
  };
  openai: {
    apiKey?: string;
    model: string;
  };
  uploads: {
    driver: 'cloudinary' | 's3' | 'local';
    cloudinary: {
      cloudName?: string;
      apiKey?: string;
      apiSecret?: string;
    };
    s3: {
      accessKeyId?: string;
      secretAccessKey?: string;
      region: string;
      bucket?: string;
    };
  };
}

export default (): AppConfig => ({
  port: parseInt(process.env.PORT ?? '4000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  apiPrefix: process.env.API_PREFIX ?? 'api/v1',
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  jwt: {
    accessSecret:
      process.env.JWT_ACCESS_SECRET ?? 'techai-dev-access-secret-change-me',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshSecret:
      process.env.JWT_REFRESH_SECRET ?? 'techai-dev-refresh-secret-change-me',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '12', 10),
  cookie: {
    secret: process.env.COOKIE_SECRET ?? 'techai-dev-cookie-secret-change-me',
    domain: process.env.COOKIE_DOMAIN,
  },
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL ?? '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10),
  },
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackUrl: process.env.GOOGLE_CALLBACK_URL,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackUrl: process.env.GITHUB_CALLBACK_URL,
    },
  },
  mail: {
    from: process.env.MAIL_FROM ?? 'TechAI <no-reply@techai.com>',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
  },
  uploads: {
    driver:
      (process.env.UPLOADS_DRIVER as
        'cloudinary' | 's3' | 'local' | undefined) ?? 'local',
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
    },
    s3: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION ?? 'us-east-1',
      bucket: process.env.AWS_S3_BUCKET,
    },
  },
});
