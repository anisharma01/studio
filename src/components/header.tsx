'use client';

import React from 'react';
import { User } from 'firebase/auth';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FilePlus2, Link, FolderPlus, Search, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onNewFolder: () => void;
  onAddFile: () => void;
  onAddLink: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onSignOut: () => void;
  user: User | null;
}

export function Header({ onNewFolder, onAddFile, onAddLink, searchTerm, onSearchChange, onSignOut, user }: HeaderProps) {
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

        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={user?.photoURL ?? ''} alt={user?.displayName ?? 'User'} />
                        <AvatarFallback>{user?.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="md:hidden"/>
                 <DropdownMenuGroup className="md:hidden">
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
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
