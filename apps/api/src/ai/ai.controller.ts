import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AiService } from './ai.service';
import { BreakdownTaskDto } from './dto/breakdown-task.dto';
import { EstimateProjectDto } from './dto/estimate-project.dto';
import { GenerateContractDto } from './dto/generate-contract.dto';
import { GenerateProposalDto } from './dto/generate-proposal.dto';
import { ReviewCodeDto } from './dto/review-code.dto';
import { SummarizeMeetingNotesDto } from './dto/summarize-meeting-notes.dto';
import { SummarizeTicketDto } from './dto/summarize-ticket.dto';
import { WriteEmailDto } from './dto/write-email.dto';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('proposal')
  @HttpCode(HttpStatus.OK)
  generateProposal(@Body() dto: GenerateProposalDto) {
    return this.aiService.generateProposal(dto);
  }

  @Post('contract')
  @HttpCode(HttpStatus.OK)
  generateContract(@Body() dto: GenerateContractDto) {
    return this.aiService.generateContract(dto);
  }

  @Post('meeting-notes')
  @HttpCode(HttpStatus.OK)
  summarizeMeetingNotes(@Body() dto: SummarizeMeetingNotesDto) {
    return this.aiService.summarizeMeetingNotes(dto);
  }

  @Post('task-breakdown')
  @HttpCode(HttpStatus.OK)
  breakdownTask(@Body() dto: BreakdownTaskDto) {
    return this.aiService.breakdownTask(dto);
  }

  @Post('code-review')
  @HttpCode(HttpStatus.OK)
  reviewCode(@Body() dto: ReviewCodeDto) {
    return this.aiService.reviewCode(dto);
  }

  @Post('ticket-summary')
  @HttpCode(HttpStatus.OK)
  summarizeTicket(@Body() dto: SummarizeTicketDto) {
    return this.aiService.summarizeTicket(dto);
  }

  @Post('email')
  @HttpCode(HttpStatus.OK)
  writeEmail(@Body() dto: WriteEmailDto) {
    return this.aiService.writeEmail(dto);
  }

  @Post('project-estimate')
  @HttpCode(HttpStatus.OK)
  estimateProject(@Body() dto: EstimateProjectDto) {
    return this.aiService.estimateProject(dto);
  }
}
