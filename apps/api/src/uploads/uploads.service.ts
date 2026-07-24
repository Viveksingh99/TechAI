import { randomUUID } from 'crypto';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { AppConfig } from '../config/configuration';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUploadRecordDto } from './dto/create-upload-record.dto';
import { RequestUploadSignatureDto } from './dto/request-upload-signature.dto';

export interface UploadSignatureResult {
  driver: 'cloudinary' | 's3' | 'local';
  uploadUrl: string;
  fields?: Record<string, string>;
  publicId?: string;
  expiresAt: string;
}

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  constructor(
    private readonly config: ConfigService<AppConfig, true>,
    private readonly prisma: PrismaService,
  ) {}

  async generateSignature(
    dto: RequestUploadSignatureDto,
  ): Promise<UploadSignatureResult> {
    const driver = this.config.get('uploads.driver', { infer: true });

    if (driver === 'cloudinary' && this.hasCloudinaryCredentials()) {
      return this.signCloudinaryUpload(dto);
    }

    if (driver === 's3' && this.hasS3Credentials()) {
      return this.signS3Upload(dto);
    }

    if (driver !== 'local') {
      this.logger.warn(
        `Uploads driver "${driver}" is not fully configured — falling back to a local mock upload URL.`,
      );
    }

    return this.mockLocalUpload(dto);
  }

  /** Persists metadata for a file after it has been uploaded client-side. */
  createRecord(dto: CreateUploadRecordDto, uploadedById?: string) {
    return this.prisma.media.create({ data: { ...dto, uploadedById } });
  }

  listRecords() {
    return this.prisma.media.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  private hasCloudinaryCredentials(): boolean {
    const { cloudName, apiKey, apiSecret } = this.config.get(
      'uploads.cloudinary',
      {
        infer: true,
      },
    );

    return Boolean(cloudName && apiKey && apiSecret);
  }

  private hasS3Credentials(): boolean {
    const { accessKeyId, secretAccessKey, bucket } = this.config.get(
      'uploads.s3',
      {
        infer: true,
      },
    );

    return Boolean(accessKeyId && secretAccessKey && bucket);
  }

  private signCloudinaryUpload(
    dto: RequestUploadSignatureDto,
  ): UploadSignatureResult {
    const { cloudName, apiKey, apiSecret } = this.config.get(
      'uploads.cloudinary',
      {
        infer: true,
      },
    );

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    const timestamp = Math.round(Date.now() / 1000);
    const folder = dto.folder ?? 'techai';
    const paramsToSign = { timestamp, folder };
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      apiSecret as string,
    );

    return {
      driver: 'cloudinary',
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      fields: {
        api_key: apiKey as string,
        timestamp: String(timestamp),
        signature,
        folder,
      },
      expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
    };
  }

  private async signS3Upload(
    dto: RequestUploadSignatureDto,
  ): Promise<UploadSignatureResult> {
    const { accessKeyId, secretAccessKey, region, bucket } = this.config.get(
      'uploads.s3',
      {
        infer: true,
      },
    );

    const client = new S3Client({
      region,
      credentials: {
        accessKeyId: accessKeyId as string,
        secretAccessKey: secretAccessKey as string,
      },
    });

    const key = `${dto.folder ?? 'techai'}/${randomUUID()}-${dto.fileName}`;
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: dto.fileType,
    });

    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 });

    return {
      driver: 's3',
      uploadUrl,
      publicId: key,
      expiresAt: new Date(Date.now() + 300_000).toISOString(),
    };
  }

  private mockLocalUpload(
    dto: RequestUploadSignatureDto,
  ): UploadSignatureResult {
    const key = `${dto.folder ?? 'techai'}/${randomUUID()}-${dto.fileName}`;

    return {
      driver: 'local',
      uploadUrl: `/api/v1/uploads/local/${encodeURIComponent(key)}`,
      publicId: key,
      expiresAt: new Date(Date.now() + 300_000).toISOString(),
    };
  }
}
