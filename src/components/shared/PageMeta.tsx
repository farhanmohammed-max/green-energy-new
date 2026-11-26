import { useEffect } from 'react';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants';

interface PageMetaProps {
  title?: string;
  description?: string;
}

export function PageMeta({ title, description }: PageMetaProps) {
  useEffect(() => {
    document.title = title ? `${title} — ${APP_NAME}` : `${APP_NAME} — ${APP_TAGLINE}`;
    if (description) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute('content', description);
      }
    }
  }, [title, description]);

  return null;
}
