import { openai } from '../lib/openai';

export type InitialIntakeResult = {
  recommended_speciality: string;
  follow_up_questions: string[];
  draft_summary: string;
};

export type FinalIntakeReport = {
  chief_complaint: string;
  summary: string;
  symptoms: string[];
  duration: string;
  severity: string;
  medications: string[];
  relevant_history: string[];
  possible_conditions: string[];
  recommended_speciality: string;
  urgency: 'routine' | 'urgent' | 'emergency';
};

export async function generateFollowUpQuestions(
  description: string
): Promise<InitialIntakeResult> {
  const response = await openai.responses.create({
    model: 'gpt-4.1-mini',
    input: [
      {
        role: 'system',
        content:
          'You are a medical intake assistant. Do not diagnose with certainty. Extract a likely speciality, a short draft summary, and 3 to 5 follow-up questions. Return only JSON matching the schema.',
      },
      {
        role: 'user',
        content: `Patient description: ${description}`,
      },
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'initial_intake',
        strict: true,
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            recommended_speciality: { type: 'string' },
            draft_summary: { type: 'string' },
            follow_up_questions: {
              type: 'array',
              items: { type: 'string' },
            },
          },
          required: [
            'recommended_speciality',
            'draft_summary',
            'follow_up_questions',
          ],
        },
      },
    },
  });

  return JSON.parse(response.output_text) as InitialIntakeResult;
}

export async function finalizeIntakeReport(args: {
  description: string;
  followUpQuestions: string[];
  followUpAnswers: string[];
}): Promise<FinalIntakeReport> {
  const { description, followUpQuestions, followUpAnswers } = args;

  const qaText = followUpQuestions
    .map((q, i) => `Q: ${q}\nA: ${followUpAnswers[i] || ''}`)
    .join('\n\n');

  const response = await openai.responses.create({
    model: 'gpt-4.1-mini',
    input: [
      {
        role: 'system',
        content:
          'You are a medical intake assistant. Do not diagnose with certainty. Build a structured intake report from the original patient description plus follow-up answers. Return only JSON matching the schema.',
      },
      {
        role: 'user',
        content: `Original patient description:
${description}

Follow-up responses:
${qaText}`,
      },
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'final_intake_report',
        strict: true,
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            chief_complaint: { type: 'string' },
            summary: { type: 'string' },
            symptoms: {
              type: 'array',
              items: { type: 'string' },
            },
            duration: { type: 'string' },
            severity: { type: 'string' },
            medications: {
              type: 'array',
              items: { type: 'string' },
            },
            relevant_history: {
              type: 'array',
              items: { type: 'string' },
            },
            possible_conditions: {
              type: 'array',
              items: { type: 'string' },
            },
            recommended_speciality: { type: 'string' },
            urgency: {
              type: 'string',
              enum: ['routine', 'urgent', 'emergency'],
            },
          },
          required: [
            'chief_complaint',
            'summary',
            'symptoms',
            'duration',
            'severity',
            'medications',
            'relevant_history',
            'possible_conditions',
            'recommended_speciality',
            'urgency',
          ],
        },
      },
    },
  });

  return JSON.parse(response.output_text) as FinalIntakeReport;
}