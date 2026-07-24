import { Module } from '@nestjs/common';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';

@Module({
  controllers: [BlogController, ContentController, PublicController],
  providers: [BlogService, ContentService, PublicService],
  exports: [BlogService, ContentService, PublicService],
})
export class CmsModule {}
