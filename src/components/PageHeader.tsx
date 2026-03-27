import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}

export default function PageHeader({ title, subtitle, right }: PageHeaderProps) {
  return (
    <div className="px-5 pt-2 pb-4 flex-shrink-0">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {subtitle && (
            <p className="text-xs font-bold text-primary tracking-wide mb-0.5">{subtitle}</p>
          )}
          <h1 className="text-xl font-extrabold text-foreground tracking-tight text-balance leading-tight">{title}</h1>
        </div>
        {right && <div className="flex-shrink-0">{right}</div>}
      </div>
    </div>
  );
}
