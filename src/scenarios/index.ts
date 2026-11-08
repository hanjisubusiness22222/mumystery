import { ScenarioPackage } from '@/types/scenario';
import { newFrontierScenario } from './new-frontier';

// 등록된 시나리오 레지스트리 (새 시나리오 추가 시 여기에 등록만 하면 됨)
export const SCENARIOS: Record<string, ScenarioPackage> = {
  'new-frontier': newFrontierScenario,
};

export const DEFAULT_SCENARIO_ID = 'new-frontier';

export function getScenario(scenarioId?: string): ScenarioPackage {
  if (scenarioId && SCENARIOS[scenarioId]) {
    return SCENARIOS[scenarioId];
  }
  return SCENARIOS[DEFAULT_SCENARIO_ID];
}
