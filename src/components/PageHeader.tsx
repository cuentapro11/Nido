import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  caption?: string;
  right?: ReactNode;
  topSpacing?: boolean;
}

export default function PageHeader({ title, subtitle, caption, right, topSpacing }: PageHeaderProps) {
  return (
    <div className={`px-5 pb-4 flex-shrink-0 ${topSpacing ? 'pt-12' : 'pt-2'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {subtitle && (
            <p className="text-xs font-bold text-primary tracking-wide mb-0.5">{subtitle}</p>
          )}
          <h1 className="text-xl font-extrabold text-foreground tracking-tight text-balance leading-tight">{title}</h1>
          {caption && (
            <p className="text-xs text-muted-foreground mt-1">{caption}</p>
          )}
        </div>
        {right && <div className="flex-shrink-0">{right}</div>}
      </div>
    </div>
  );
}
