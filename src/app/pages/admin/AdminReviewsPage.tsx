import { useState, useEffect } from 'react';
import { CheckCircle2, Trash2, MessageSquareText, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (data) setReviews(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleApprove = async (id: number) => {
    const { error } = await supabase.from('reviews').update({ status: 'Approved' }).eq('id', id);
    if (!error) fetchReviews();
  };

  const handleDelete = async (id: number) => {
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (!error) fetchReviews();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-semibold text-foreground tracking-tight mb-1" style={{ fontFamily: 'Tan Nimbus, serif' }}>
          Customer Reviews
        </h2>
        <p className="text-muted-foreground text-sm">Moderate and manage product reviews from your customers.</p>
      </div>

      <div className="bg-background rounded-2xl shadow-sm border border-border overflow-hidden">
        <ul className="divide-y divide-border">
          {loading ? (
             <li className="p-6 text-center text-muted-foreground">Loading reviews...</li>
          ) : reviews.length === 0 ? (
             <li className="p-6 text-center text-muted-foreground">No reviews found.</li>
          ) : reviews.map((review) => (
            <li key={review.id} className="p-6 transition-colors hover:bg-muted/5 group">
              <div className="flex justify-between items-start gap-4 flex-col sm:flex-row">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-foreground">{review.customer_name}</span>
                    <span className="text-muted-foreground text-xs">•</span>
                    <span className="text-primary text-sm font-medium">{review.product_name}</span>
                    <span className="text-muted-foreground text-xs">•</span>
                    <span className="text-muted-foreground text-xs">{new Date(review.created_at).toLocaleDateString()}</span>
                    {review.status === 'Pending' && (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200 text-xs font-semibold ml-2">Needs Moderation</span>
                    )}
                  </div>
                  <div className="flex text-primary">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-primary' : 'text-muted/50'}`} />
                    ))}
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed max-w-3xl flex items-start">
                    <MessageSquareText className="w-5 h-5 text-muted-foreground mr-3 mt-0.5 shrink-0" />
                    "{review.comment}"
                  </p>
                </div>

                <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                  {review.status === 'Pending' && (
                    <button onClick={() => handleApprove(review.id)} className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg text-sm font-medium transition-colors">
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                    </button>
                  )}
                  <button onClick={() => handleDelete(review.id)} className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-sm font-medium transition-colors">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
