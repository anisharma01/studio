'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getTagSuggestions } from '@/app/actions';
import type { Item } from '@/lib/types';
import { Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TagSuggestionDialogProps {
  item: Item;
  description: string;
  onClose: () => void;
  onSave: (itemId: string, tags: string[]) => void;
}

export function TagSuggestionDialog({ item, description, onClose, onSave }: TagSuggestionDialogProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>(item.tags);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSuggestions() {
      setIsLoading(true);
      const fetchedSuggestions = await getTagSuggestions(description);
      const uniqueSuggestions = Array.from(new Set([...item.tags, ...fetchedSuggestions]));
      setSuggestions(uniqueSuggestions);
      setIsLoading(false);
    }
    fetchSuggestions();
  }, [description, item.tags]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = () => {
    onSave(item.id, selectedTags);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="text-accent" />
            AI Tag Suggestions for "{item.name}"
          </DialogTitle>
          <DialogDescription>
            We've suggested some tags to help you organize. Click to select or unselect.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-28 rounded-full" />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {suggestions.map(tag => (
                <button key={tag} onClick={() => toggleTag(tag)}>
                  <Badge
                    variant={selectedTags.includes(tag) ? 'default' : 'secondary'}
                    className={cn(
                      'cursor-pointer transition-all hover:ring-2 hover:ring-ring hover:ring-offset-1',
                       selectedTags.includes(tag) ? 'bg-primary hover:bg-primary/90' : 'bg-secondary hover:bg-secondary/80'
                    )}
                  >
                    {tag}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Skip
          </Button>
          <Button onClick={handleSave}>Save Tags</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
