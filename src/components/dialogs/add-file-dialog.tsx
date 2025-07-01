'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { File } from '@/lib/types';
import { formatBytes } from '@/lib/utils';

const formSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  fileType: z.string().min(1, 'File type is required (e.g., pdf, jpg)'),
  size: z.coerce.number().min(0, 'Size must be a positive number'),
  file: z.any().optional(), // We'll use this for the input, but not for submission
});

interface AddFileDialogProps {
  currentFolderId: string | null;
  onClose: () => void;
  onAdd: (file: Omit<File, 'id' | 'tags'>) => void;
}

export function AddFileDialog({ currentFolderId, onClose, onAdd }: AddFileDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      fileType: '',
      size: 0,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // We don't submit the 'file' field itself, just its metadata
    const { file, ...metadata } = values;
    onAdd({
      ...metadata,
      parentId: currentFolderId,
      type: 'file',
    });
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('name', file.name);
      form.setValue('size', file.size);
      const extension = file.name.split('.').pop() || '';
      form.setValue('fileType', extension);
    }
  };

  const nameValue = form.watch('name');
  const sizeValue = form.watch('size');

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add File</DialogTitle>
          <DialogDescription>
            Choose a file to upload. Its metadata will be saved.
            Actual file storage is not implemented in this demo.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File</FormLabel>
                  <FormControl>
                    <Input type="file" onChange={handleFileChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {nameValue && (
              <div className="space-y-2 rounded-md border bg-muted/50 p-3 text-sm">
                <p><strong>Name:</strong> {nameValue}</p>
                <p><strong>Size:</strong> {formatBytes(sizeValue)}</p>
              </div>
            )}

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={!nameValue}>Add File</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
