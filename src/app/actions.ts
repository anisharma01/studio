'use server';

import { suggestTags, type SuggestTagsInput } from '@/ai/flows/suggest-tags';

export async function getTagSuggestions(description: string): Promise<string[]> {
  try {
    const input: SuggestTagsInput = { contentDescription: description };
    const result = await suggestTags(input);
    return result.tags;
  } catch (error) {
    console.error('Error getting tag suggestions:', error);
    // In a real app, you might want to handle this error more gracefully
    return [];
  }
}
