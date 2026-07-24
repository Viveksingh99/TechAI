import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateUploadRecordDto } from './dto/create-upload-record.dto';
import { RequestUploadSignatureDto } from './dto/request-upload-signature.dto';
import { UploadsService } from './uploads.service';

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('signature')
  generateSignature(@Body() dto: RequestUploadSignatureDto) {
    return this.uploadsService.generateSignature(dto);
  }

  @Post()
  createRecord(
    @Body() dto: CreateUploadRecordDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.uploadsService.createRecord(dto, userId);
  }

  @Get()
  listRecords() {
    return this.uploadsService.listRecords();
  }
}
