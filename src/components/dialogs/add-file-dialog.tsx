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
import type { File as FileType } from '@/lib/types';
import { formatBytes } from '@/lib/utils';

// Schema for form validation
const formSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  file: z
    .custom<FileList>()
    .refine((files) => files?.length > 0, 'A file is required.'),
});

interface AddFileDialogProps {
  currentFolderId: string | null;
  onClose: () => void;
  onAdd: (fileMetadata: Omit<FileType, 'id' | 'tags' | 'downloadURL'>, fileObject: globalThis.File) => void;
}

export function AddFileDialog({ currentFolderId, onClose, onAdd }: AddFileDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      file: undefined,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const fileObject = values.file[0];
    const fileMetadata: Omit<FileType, 'id' | 'tags' | 'downloadURL'> = {
      name: values.name,
      parentId: currentFolderId,
      type: 'file',
      fileType: fileObject.type || 'unknown',
      size: fileObject.size,
    };
    onAdd(fileMetadata, fileObject);
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('name', file.name, { shouldValidate: true });
      form.setValue('file', event.target.files as FileList, { shouldValidate: true });
    }
  };

  const selectedFile = form.watch('file')?.[0];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add File</DialogTitle>
          <DialogDescription>
            Choose a file to upload to your CloudWeaver storage.
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
                    <Input
                      type="file"
                      onChange={handleFileChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedFile && (
              <>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>File Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-2 rounded-md border bg-muted/50 p-3 text-sm">
                  <p>
                    <strong>Type:</strong> {selectedFile.type || 'unknown'}
                  </p>
                  <p>
                    <strong>Size:</strong> {formatBytes(selectedFile.size)}
                  </p>
                </div>
              </>
            )}

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={!form.formState.isValid}>
                Upload & Add File
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
