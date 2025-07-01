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

const formSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  fileType: z.string().min(1, 'File type is required (e.g., pdf, jpg)'),
  size: z.coerce.number().min(0, 'Size must be a positive number'),
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
      fileType: 'txt',
      size: 1024
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAdd({
      ...values,
      parentId: currentFolderId,
      type: 'file',
    });
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add File</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File Name</FormLabel>
                  <FormControl>
                    <Input placeholder="report.docx" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="fileType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File Type (extension)</FormLabel>
                  <FormControl>
                    <Input placeholder="pdf" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Size (in bytes)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="1024" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Add File</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
