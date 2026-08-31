import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CategoryBadge } from '@/components/CategoryBadge';
import StarRating from '@/components/StarRating';
import Tool from '@/data/Tool';

export const ToolCard = ({ tool }: { tool: Tool }) => (
  <Link href={`/tools/${tool.slug}`} className="block h-full">
    <Card className="h-full transition-shadow hover:shadow-lg">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-bold text-gray-900">
            {tool.name}
          </CardTitle>
          <CategoryBadge category={tool.category} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-600 leading-relaxed">
          {tool.description}
        </p>
        <div className="flex items-center gap-2">
          <StarRating rating={Math.round(tool.avg_rating ?? 0)} />
          <span className="text-sm text-gray-500">
            {tool.review_count === 0
              ? 'No reviews yet'
              : `${(tool.avg_rating ?? 0).toFixed(1)} (${tool.review_count} review${tool.review_count === 1 ? '' : 's'})`}
          </span>
        </div>
      </CardContent>
    </Card>
  </Link>
);
