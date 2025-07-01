'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FilePlus2, Link, FolderPlus, Search, Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onNewFolder: () => void;
  onAddFile: () => void;
  onAddLink: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export function Header({ onNewFolder, onAddFile, onAddLink, searchTerm, onSearchChange }: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-3">
        <Icons.logo className="h-7 w-7 text-primary" />
        <h1 className="text-xl font-semibold text-foreground">CloudWeaver</h1>
      </div>

      <div className="relative flex-1 max-w-md mx-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search files, folders, and links..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onAddFile}>
            <FilePlus2 className="mr-2 h-4 w-4" />
            Add File
            </Button>
            <Button variant="outline" size="sm" onClick={onAddLink}>
            <Link className="mr-2 h-4 w-4" />
            Add Link
            </Button>
            <Button size="sm" onClick={onNewFolder}>
            <FolderPlus className="mr-2 h-4 w-4" />
            New Folder
            </Button>
        </div>
        
        <div className="md:hidden">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-5 w-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48" align="end">
                    <DropdownMenuGroup>
                        <DropdownMenuItem onClick={onAddFile}>
                            <FilePlus2 className="mr-2 h-4 w-4" />
                            <span>Add File</span>
                        </DropdownMenuItem>
                            <DropdownMenuItem onClick={onAddLink}>
                            <Link className="mr-2 h-4 w-4" />
                            <span>Add Link</span>
                        </DropdownMenuItem>
                            <DropdownMenuItem onClick={onNewFolder}>
                            <FolderPlus className="mr-2 h-4 w-4" />
                            <span>New Folder</span>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
