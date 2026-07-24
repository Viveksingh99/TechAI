import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { AppConfig } from '../config/configuration';
import { BreakdownTaskDto } from './dto/breakdown-task.dto';
import { EstimateProjectDto } from './dto/estimate-project.dto';
import { GenerateContractDto } from './dto/generate-contract.dto';
import { GenerateProposalDto } from './dto/generate-proposal.dto';
import { ReviewCodeDto } from './dto/review-code.dto';
import { SummarizeMeetingNotesDto } from './dto/summarize-meeting-notes.dto';
import { SummarizeTicketDto } from './dto/summarize-ticket.dto';
import { WriteEmailDto } from './dto/write-email.dto';

export interface AiResult {
  content: string;
  mock: boolean;
  model: string;
}

/**
 * Thin wrapper around the OpenAI Chat Completions API. When no
 * `OPENAI_API_KEY` is configured (or a request fails), every method falls
 * back to a deterministic, templated mock response so the rest of the
 * platform keeps working end-to-end without a live API key.
 */
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly client?: OpenAI;
  private readonly model: string;

  readonly isMock: boolean;

  constructor(private readonly config: ConfigService<AppConfig, true>) {
    const apiKey = this.config.get('openai.apiKey', { infer: true });
    this.model = this.config.get('openai.model', { infer: true });
    this.isMock = !apiKey;
    this.client = apiKey ? new OpenAI({ apiKey }) : undefined;
  }

  async generateProposal(dto: GenerateProposalDto): Promise<AiResult> {
    return this.complete(
      'You are a senior business development writer at a software development agency. Write clear, persuasive, well-structured client proposals in markdown.',
      `Write a professional project proposal for the following engagement.\n\nClient: ${dto.clientName}\nProject summary: ${dto.projectSummary}\nBudget: ${dto.budget ?? 'To be discussed'}\nTimeline: ${dto.timeline ?? 'To be discussed'}\nScope: ${dto.scope ?? 'To be defined during discovery'}\n\nInclude sections: Overview, Objectives, Scope of Work, Timeline, Investment, Next Steps.`,
      () =>
        [
          `# Project Proposal for ${dto.clientName}`,
          '',
          '## Overview',
          dto.projectSummary,
          '',
          '## Objectives',
          '- Deliver a high-quality solution that meets the stated requirements',
          '- Maintain clear communication and predictable delivery milestones',
          '',
          '## Scope of Work',
          dto.scope ?? 'To be finalized during the discovery phase.',
          '',
          '## Timeline',
          dto.timeline ?? 'To be determined based on final scope.',
          '',
          '## Investment',
          dto.budget ?? 'To be determined based on final scope.',
          '',
          '## Next Steps',
          '1. Review and approve this proposal',
          '2. Sign the service agreement',
          '3. Kick off discovery and planning',
        ].join('\n'),
    );
  }

  async generateContract(dto: GenerateContractDto): Promise<AiResult> {
    return this.complete(
      'You are a legal drafting assistant for a software agency. Draft clear, plain-language service contracts. Include a disclaimer that this is a draft and should be reviewed by legal counsel before use.',
      `Draft a service contract.\n\nClient: ${dto.clientName}\nProject: ${dto.projectTitle}\nContract value: ${dto.value}\nDuration: ${dto.duration ?? 'Not specified'}\nAdditional terms: ${dto.terms ?? 'Standard terms apply'}`,
      () =>
        [
          `# Service Agreement — ${dto.projectTitle}`,
          '',
          `This agreement is entered into between TechAI ("Agency") and ${dto.clientName} ("Client").`,
          '',
          '## 1. Scope of Services',
          `The Agency shall deliver services related to "${dto.projectTitle}" as agreed with the Client.`,
          '',
          '## 2. Contract Value',
          `Total contract value: ${dto.value}.`,
          '',
          '## 3. Duration',
          dto.duration ?? 'To be agreed by both parties.',
          '',
          '## 4. Additional Terms',
          dto.terms ?? 'Standard payment, confidentiality and IP terms apply.',
          '',
          '_This is an AI-generated draft. Please have it reviewed by legal counsel before signing._',
        ].join('\n'),
    );
  }

  async summarizeMeetingNotes(
    dto: SummarizeMeetingNotesDto,
  ): Promise<AiResult> {
    return this.complete(
      'You summarize meeting transcripts into concise notes with clear action items. Respond in markdown with "Summary" and "Action Items" sections.',
      `Summarize the following meeting transcript:\n\n${dto.transcript}`,
      () => {
        const firstLines = dto.transcript.split(/\n+/).slice(0, 3).join(' ');
        return [
          '## Summary',
          firstLines || 'No transcript content provided.',
          '',
          '## Action Items',
          '- Review discussed points and confirm ownership',
          '- Schedule a follow-up if any items remain open',
        ].join('\n');
      },
    );
  }

  async breakdownTask(dto: BreakdownTaskDto): Promise<AiResult> {
    return this.complete(
      'You break down software engineering tasks into a checklist of concrete, actionable subtasks. Respond as a markdown checklist.',
      `Break down this task into actionable subtasks.\n\nTitle: ${dto.title}\nDescription: ${dto.description ?? 'N/A'}`,
      () =>
        [
          `## Subtasks for: ${dto.title}`,
          '- [ ] Clarify requirements and acceptance criteria',
          '- [ ] Design the technical approach',
          '- [ ] Implement the core functionality',
          '- [ ] Write/update tests',
          '- [ ] Update documentation',
          '- [ ] Submit for code review',
          '- [ ] QA verification',
        ].join('\n'),
    );
  }

  async reviewCode(dto: ReviewCodeDto): Promise<AiResult> {
    return this.complete(
      'You are a senior software engineer performing a thorough, constructive code review. Point out bugs, security issues, style problems and suggest improvements. Respond in markdown.',
      `Review the following ${dto.language ?? ''} code:\n\n\`\`\`${dto.language ?? ''}\n${dto.code}\n\`\`\``,
      () =>
        [
          '## Code Review',
          `- Language: ${dto.language ?? 'unspecified'}`,
          `- Lines analyzed: ${dto.code.split('\n').length}`,
          '- No live AI model configured — perform a manual review focusing on correctness, error handling, security and readability.',
          '- Consider adding/updating tests to cover this change.',
        ].join('\n'),
    );
  }

  async summarizeTicket(dto: SummarizeTicketDto): Promise<AiResult> {
    return this.complete(
      'You summarize customer support ticket threads into a short summary and the current status/next steps. Respond in markdown.',
      `Ticket subject: ${dto.subject}\n\nConversation:\n${dto.conversation}`,
      () =>
        [
          `## Ticket Summary: ${dto.subject}`,
          dto.conversation.split(/\n+/).slice(0, 3).join(' ') ||
            'No conversation content provided.',
          '',
          '**Suggested next step:** Follow up with the customer to confirm resolution.',
        ].join('\n'),
    );
  }

  async writeEmail(dto: WriteEmailDto): Promise<AiResult> {
    return this.complete(
      'You write clear, professional business emails. Respond with a subject line and body.',
      `Write an email.\n\nPurpose: ${dto.purpose}\nRecipient: ${dto.recipientName ?? 'the recipient'}\nTone: ${dto.tone ?? 'professional'}\nContext: ${dto.context ?? 'N/A'}`,
      () =>
        [
          `Subject: Regarding ${dto.purpose}`,
          '',
          `Hi ${dto.recipientName ?? 'there'},`,
          '',
          `I'm reaching out regarding ${dto.purpose}. ${dto.context ?? ''}`.trim(),
          '',
          'Please let me know if you have any questions.',
          '',
          'Best regards,',
          'TechAI Team',
        ].join('\n'),
    );
  }

  async estimateProject(dto: EstimateProjectDto): Promise<AiResult> {
    return this.complete(
      'You are a technical project estimator for a software agency. Given a project description, provide an estimated timeline, team composition and rough cost range. Respond in markdown.',
      `Estimate the following project.\n\nDescription: ${dto.description}\nTech stack: ${dto.techStack ?? 'Not specified'}`,
      () =>
        [
          '## Project Estimate',
          `- **Description:** ${dto.description}`,
          `- **Tech stack:** ${dto.techStack ?? 'Not specified'}`,
          '- **Estimated timeline:** 6–10 weeks (indicative — configure OPENAI_API_KEY for a tailored estimate)',
          '- **Suggested team:** 1 PM, 2 developers, 1 QA, 1 designer (part-time)',
          '- **Rough cost range:** Depends on region and team composition; request a detailed quote.',
        ].join('\n'),
    );
  }

  // ---------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------

  private async complete(
    systemPrompt: string,
    userPrompt: string,
    mockFallback: () => string,
  ): Promise<AiResult> {
    if (!this.client) {
      return { content: mockFallback(), mock: true, model: 'mock' };
    }

    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      });

      const content = completion.choices[0]?.message?.content;

      if (!content) {
        return { content: mockFallback(), mock: true, model: 'mock' };
      }

      return { content, mock: false, model: this.model };
    } catch (error) {
      this.logger.warn(
        `OpenAI request failed, falling back to a mock response: ${(error as Error).message}`,
      );

      return { content: mockFallback(), mock: true, model: 'mock' };
    }
  }
}
