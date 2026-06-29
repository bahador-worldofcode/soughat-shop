'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Star, Package, User, Reply, Loader2 } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

const BATCH_SIZE = 6;

export default function ReviewsFeed() {
  const t = useTranslations('Home');
  const locale = useLocale();
  const isEn = locale === 'en';

  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef<IntersectionObserver | null>(null);

  const lastReviewElementRef = useCallback((node: HTMLDivElement) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchReviews(false);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);

  useEffect(() => {
    fetchReviews(true);
  }, []);

  const fetchReviews = async (isInitial = true) => {
    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    const currentOffset = isInitial ? 0 : reviews.length;

    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .range(currentOffset, currentOffset + BATCH_SIZE - 1);

    if (data) {
      if (data.length < BATCH_SIZE) setHasMore(false);
      setReviews(prev => isInitial ? data : [...prev, ...data]);
    }
    
    setLoading(false);
    setLoadingMore(false);
  };

  if (loading && reviews.length === 0) return <div className="py-20 text-center text-blue-200"><Loader2 className="animate-spin mx-auto h-8 w-8" /></div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" dir={isEn ? 'ltr' : 'rtl'}>
      {reviews.map((review, index) => {
        const isLast = index === reviews.length - 1;
        return (
          <div 
            key={review.id} 
            ref={isLast ? lastReviewElementRef : null}
            className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-xl flex flex-col transition-all duration-300 hover:-translate-y-1"
          >
            {/* ستاره‌ها */}
            <div className="flex text-yellow-400 mb-4">
              {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-gray-400/30'}`} />
              ))}
            </div>

            {/* متن نظر */}
            <p className="text-blue-50 text-sm leading-8 mb-6 text-justify flex-1">
              "{review.comment}"
            </p>

            {/* پاسخ ادمین */}
            {review.admin_reply && (
                <div className="mb-6 bg-blue-900/40 p-4 rounded-2xl border border-blue-400/20 text-xs">
                    <div className="flex items-center gap-1.5 text-blue-300 font-bold mb-2">
                        <Reply className="h-3 w-3" /> {t('admin_reply_label')}
                    </div>
                    <p className="text-blue-100 leading-6 text-justify">{review.admin_reply}</p>
                </div>
            )}

            {/* اطلاعات فرستنده و اقلام */}
            <div className="mt-auto pt-4 border-t border-white/10 flex items-start gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex flex-shrink-0 items-center justify-center text-white font-bold shadow-md">
                 <User className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm mb-1">{review.sender_name}</h4>
                <div className="text-blue-200/70 text-[10px] flex items-start gap-1">
                    <Package className="h-3 w-3 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2 leading-5">{review.items_summary}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {loadingMore && (
         <div className="col-span-full flex justify-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-white/50" />
         </div>
      )}
    </div>
  );
}