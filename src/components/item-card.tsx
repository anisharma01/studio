'use client';

import React from 'react';
import type { FileSystemItem } from '@/lib/types';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, FileText, Link, Pencil, Trash2 } from 'lucide-react';
import { Icons } from './icons';
import { Badge } from './ui/badge';

interface ItemCardProps {
  item: FileSystemItem;
  onClick: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export function ItemCard({ item, onClick, onRename, onDelete }: ItemCardProps) {
  const Icon =
    item.type === 'folder'
      ? Icons.folder
      : item.type === 'link'
      ? Link
      : FileText;

  const handleDoubleClick = () => {
    onClick();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      onClick();
    }
  };

  return (
    <Card
      className="group relative flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:-translate-y-1 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label={`Item: ${item.name}`}
    >
      <div className="absolute top-1 right-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRename(); }}>
              <Pencil className="mr-2 h-4 w-4" />
              <span>Rename</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CardHeader className="flex-grow flex flex-col items-center justify-center p-4 cursor-pointer" onClick={onClick}>
        <Icon className="h-16 w-16 text-primary" strokeWidth={1.5}/>
      </CardHeader>
      <CardContent className="p-2 pt-0 text-center">
        <p className="text-sm font-medium truncate" title={item.name}>
          {item.name}
        </p>
      </CardContent>
      {item.tags.length > 0 && (
          <CardFooter className="p-2 justify-center flex-wrap gap-1">
              {item.tags.slice(0, 2).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
          </CardFooter>
      )}
    </Card>
  );
}
