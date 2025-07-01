import { Cloud, File as FileIcon, Folder as FolderIcon, Link as LinkIcon } from 'lucide-react';
import type { SVGProps } from 'react';

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <Cloud {...props} />
  ),
  folder: FolderIcon,
  file: FileIcon,
  link: LinkIcon,
};
