import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';

describe('AiService', () => {
  async function buildService(configValues: Record<string, unknown>): Promise<AiService> {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn((key: string) => configValues[key]) },
        },
      ],
    }).compile();

    return module.get(AiService);
  }

  describe('when no OPENAI_API_KEY is configured', () => {
    it('flags itself as running in mock mode', async () => {
      const service = await buildService({ 'openai.apiKey': undefined, 'openai.model': 'gpt-4o-mini' });

      expect(service.isMock).toBe(true);
    });

    it('generateProposal falls back to a deterministic templated proposal', async () => {
      const service = await buildService({ 'openai.apiKey': undefined, 'openai.model': 'gpt-4o-mini' });

      const result = await service.generateProposal({
        clientName: 'Acme Corp',
        projectSummary: 'Build a marketing website',
      });

      expect(result.mock).toBe(true);
      expect(result.model).toBe('mock');
      expect(result.content).toContain('Acme Corp');
      expect(result.content).toContain('Build a marketing website');
    });

    it('breakdownTask returns a checklist of subtasks', async () => {
      const service = await buildService({ 'openai.apiKey': undefined, 'openai.model': 'gpt-4o-mini' });

      const result = await service.breakdownTask({ title: 'Implement login page' });

      expect(result.mock).toBe(true);
      expect(result.content).toContain('Implement login page');
      expect(result.content).toContain('- [ ]');
    });

    it('estimateProject returns an estimate summary', async () => {
      const service = await buildService({ 'openai.apiKey': undefined, 'openai.model': 'gpt-4o-mini' });

      const result = await service.estimateProject({ description: 'E-commerce platform' });

      expect(result.mock).toBe(true);
      expect(result.content).toContain('E-commerce platform');
      expect(result.content.toLowerCase()).toContain('estimate');
    });
  });
});
