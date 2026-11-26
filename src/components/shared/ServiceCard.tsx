import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Sparkles, Sun } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatIDR } from '@/lib/utils';
import type { ServiceWithCategory } from '@/types/database';

export function ServiceCard({ service }: { service: ServiceWithCategory }) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-forest-900 via-forest-800 to-leaf-600">
        {service.image_url ? (
          <img
            src={service.image_url}
            alt={service.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-103"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-leaf-100/90">
            <Sun className="h-10 w-10 text-solar-400" aria-hidden="true" />
            <span className="mt-2 text-xs font-medium uppercase tracking-wider text-leaf-100/75">
              {service.service_categories?.name || 'Energi Hijau'}
            </span>
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {service.service_categories?.name && (
            <Badge className="bg-white/92 text-forest-900 border-0 shadow-xs">
              {service.service_categories.name}
            </Badge>
          )}
          {service.is_featured && (
            <Badge variant="accent" className="shadow-xs">
              <Sparkles className="h-3 w-3" />
              Unggulan
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-bold text-ink group-hover:text-forest-800 transition-colors">
          {service.name}
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">
          {service.short_description}
        </p>

        <div className="mt-4 space-y-2 border-t border-forest-900/8 pt-4">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs font-medium text-muted">Estimasi Awal</span>
            <span className="text-sm font-bold text-forest-900">
              {service.price_from !== null ? `Mulai ${formatIDR(service.price_from)}` : 'Sesuai Kebutuhan'}
            </span>
          </div>
          {service.estimated_duration && (
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <Clock className="h-3.5 w-3.5 text-leaf-600" aria-hidden="true" />
              <span>Estimasi durasi: {service.estimated_duration}</span>
            </div>
          )}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <Link to={`/layanan/${service.slug}`}>
            <Button variant="outline" size="sm" className="w-full">
              Detail
            </Button>
          </Link>
          <Link to={`/pesan/${service.slug}`}>
            <Button variant="primary" size="sm" className="w-full">
              Pesan
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
