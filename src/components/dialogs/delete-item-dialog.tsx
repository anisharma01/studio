'use client';

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Item } from '@/lib/types';

interface DeleteItemDialogProps {
  item: Item;
  onClose: () => void;
  onDelete: (item: Item) => void;
}

export function DeleteItemDialog({ item, onClose, onDelete }: DeleteItemDialogProps) {
  const handleDelete = () => {
    onDelete(item);
  };

  return (
    <AlertDialog open onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete "{item.name}".
            {item.type === 'folder' && ' All contents within this folder will also be deleted.'}
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
