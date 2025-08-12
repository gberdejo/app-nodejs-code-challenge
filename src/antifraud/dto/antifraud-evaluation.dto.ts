export class AntifraudEvaluationDto {
  transactionId: string;
  decision: 'approved' | 'rejected';
  ruleApplied: string;
  details?: Record<string, any>;
}
