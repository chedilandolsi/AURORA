export interface SimulationResponse {
  simulationId: string;
  resultImageUrl: string;
  originalMaskUrl: string;
  woodType?: string;
  maskTitle?: string;
  usedThisMonth: number;
  monthlyQuota: number;
  remainingQuota: number;
  simulatedAt: string;
}

export interface SimulationQuotaResponse {
  usedThisMonth: number;
  monthlyQuota: number;
  remainingQuota: number;
  hasQuotaRemaining: boolean;
  resetsAt: string;
}
