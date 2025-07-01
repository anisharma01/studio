'use client';

import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Item } from '@/lib/types';
import { cn } from '@/lib/utils';

interface BreadcrumbProps {
  items: Item[];
  onNavigate: (id: string | null) => void;
}

export function Breadcrumb({ items, onNavigate }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 pl-1 pr-2"
        onClick={() => onNavigate(null)}
      >
        <Home className="h-4 w-4" />
        Home
      </Button>
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          <ChevronRight className="h-4 w-4" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate(item.id)}
            className={cn(
              'px-2',
              index === items.length - 1 && 'font-semibold text-foreground'
            )}
            disabled={index === items.length - 1}
          >
            {item.name}
          </Button>
        </React.Fragment>
      ))}
    </nav>
  );
}
