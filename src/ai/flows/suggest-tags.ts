// src/ai/flows/suggest-tags.ts
'use server';
/**
 * @fileOverview A flow that suggests tags for uploaded files and saved links.
 *
 * - suggestTags - A function that handles the tag suggestion process.
 * - SuggestTagsInput - The input type for the suggestTags function.
 * - SuggestTagsOutput - The return type for the suggestTags function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTagsInputSchema = z.object({
  contentDescription: z
    .string()
    .describe('A detailed description of the content, including its type, topic, and any relevant keywords.'),
});
export type SuggestTagsInput = z.infer<typeof SuggestTagsInputSchema>;

const SuggestTagsOutputSchema = z.object({
  tags: z
    .array(z.string())
    .describe('An array of suggested tags for the content, suitable for categorization and search.'),
});
export type SuggestTagsOutput = z.infer<typeof SuggestTagsOutputSchema>;

export async function suggestTags(input: SuggestTagsInput): Promise<SuggestTagsOutput> {
  return suggestTagsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTagsPrompt',
  input: {schema: SuggestTagsInputSchema},
  output: {schema: SuggestTagsOutputSchema},
  prompt: `You are an expert in content categorization. Given the following content description, suggest 5 relevant tags that can be used for categorization and search.

Content Description: {{{contentDescription}}}

Tags:`,
});

const suggestTagsFlow = ai.defineFlow(
  {
    name: 'suggestTagsFlow',
    inputSchema: SuggestTagsInputSchema,
    outputSchema: SuggestTagsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
