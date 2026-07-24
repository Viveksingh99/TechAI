import { PartialType } from '@nestjs/mapped-types';
import { CreateBugDto } from './create-bug.dto';

export class UpdateBugDto extends PartialType(CreateBugDto) {}
