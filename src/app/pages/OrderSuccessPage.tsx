import { Link } from 'react-router';
import { CheckCircle, ArrowRight } from 'lucide-react';

export const OrderSuccessPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-secondary/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-border">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-primary" />
          </div>

          <h1 className="text-4xl lg:text-5xl mb-4" style={{ fontFamily: 'Tan Nimbus, serif' }}>
            Order Confirmed!
          </h1>

          <p className="text-xl text-muted-foreground mb-8">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>

          <div className="bg-secondary rounded-2xl p-6 mb-8 text-left">
            <h3 className="text-lg mb-4">What's Next?</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">1</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  You'll receive an email confirmation shortly with your order details.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">2</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your order will be prepared and shipped within 2-3 business days.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">3</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Track your package with the tracking number we'll send you.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors group"
            >
              Continue Shopping
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center px-8 py-4 bg-secondary text-foreground rounded-full hover:bg-accent transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
