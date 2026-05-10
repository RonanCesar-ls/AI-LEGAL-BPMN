// apps/frontend/src/services/api.ts

import { FlowchartData } from '@ailegal/shared-types';

export async function generateFlowchart(prompt: string): Promise<FlowchartData> {
  const response = await fetch('http://localhost:3000/api/process/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error('Erro ao gerar o fluxograma');
  }

  return await response.json();
}