import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[500px] bg-gradient-to-br from-secondary via-accent/30 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center">
          <div className="text-center space-y-6">
            <h1 className="text-5xl lg:text-7xl" style={{ fontFamily: 'Tan Nimbus, serif' }}>
              Our Story
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Redefining beauty through luxury, sustainability, and self-love
            </p>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl lg:text-5xl" style={{ fontFamily: 'Tan Nimbus, serif' }}>
              Beauty That Empowers
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Founded in 2020, Cosmeo Beauty Studio was born from a simple belief: 

              beauty should be accessible, empowering, and sustainable. We create 
              products that not only make you look beautiful but also make you feel 
              confident in your own skin.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our founder, inspired by the natural beauty of women around the world, 
              set out to create a brand that celebrates individuality while providing 
              luxurious, high-quality products that deliver real results.
            </p>
          </div>
          <div className="rounded-3xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1768818590457-94bc4479bdbb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dHklMjBzdHVkaW8lMjBlbGVnYW50JTIwaW50ZXJpb3J8ZW58MXx8fHwxNzc0OTg1MTk2fDA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Beauty Studio"
              className="w-full h-[500px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="bg-secondary py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl mb-4" style={{ fontFamily: 'Tan Nimbus, serif' }}>
              Our Values
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🌿</span>
              </div>
              <h3 className="text-2xl mb-4" style={{ fontFamily: 'Tan Nimbus, serif' }}>
                Natural Ingredients
              </h3>
              <p className="text-muted-foreground">
                We use only the finest botanical extracts and natural ingredients, 
                carefully sourced for their effectiveness and purity.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🐰</span>
              </div>
              <h3 className="text-2xl mb-4" style={{ fontFamily: 'Tan Nimbus, serif' }}>
                Cruelty-Free
              </h3>
              <p className="text-muted-foreground">
                100% cruelty-free and vegan. We never test on animals and ensure 
                our suppliers share our ethical values.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">♻️</span>
              </div>
              <h3 className="text-2xl mb-4" style={{ fontFamily: 'Tan Nimbus, serif' }}>
                Sustainable
              </h3>
              <p className="text-muted-foreground">
                Eco-friendly packaging and sustainable practices. We're committed 
                to reducing our environmental impact at every step.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Image Gallery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl overflow-hidden h-[400px]">
            <img
              src="https://images.unsplash.com/photo-1614159102349-eddb8b985aa9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2luY2FyZSUyMHJvdXRpbmUlMjBmbGF0bGF5fGVufDF8fHx8MTc3NDk4NTE5NXww&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Skincare products"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="rounded-3xl overflow-hidden h-[400px]">
            <img
              src="https://images.unsplash.com/photo-1761864293818-603c23655cee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXR1cmFsJTIwYmVhdXR5JTIwcHJvZHVjdHN8ZW58MXx8fHwxNzc0OTAyNDg5fDA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Natural beauty"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </section>

      {/* Our Promise */}
      <section className="bg-gradient-to-br from-primary via-primary/90 to-accent text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl mb-6" style={{ fontFamily: 'Tan Nimbus, serif' }}>
                The Cosmeo Promise

              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xl">✓</span>
                  </div>
                  <div>
                    <h4 className="text-xl mb-2">Quality You Can Trust</h4>
                    <p className="text-white/90">
                      Every product is dermatologist-tested and clinically proven 
                      to deliver results you can see and feel.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xl">✓</span>
                  </div>
                  <div>
                    <h4 className="text-xl mb-2">Transparent Ingredients</h4>
                    <p className="text-white/90">
                      We believe in full transparency. Know exactly what you're 
                      putting on your skin.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xl">✓</span>
                  </div>
                  <div>
                    <h4 className="text-xl mb-2">Customer Satisfaction</h4>
                    <p className="text-white/90">
                      30-day money-back guarantee. If you're not completely 
                      satisfied, we'll make it right.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-3xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1747324831504-5ee9aa8eec59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGJlYXV0eSUyMG5hdHVyYWwlMjBnbG93aW5nJTIwc2tpbnxlbnwxfHx8fDE3NzQ5ODUxOTV8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Happy customer"
                className="w-full h-[500px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center">
          <h2 className="text-4xl lg:text-5xl mb-6" style={{ fontFamily: 'Tan Nimbus, serif' }}>
            Join Our Beauty Community
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Experience the Cosmeo difference. Discover products that celebrate your 

            unique beauty and enhance your natural radiance.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center px-8 py-4 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors group"
          >
            Explore Our Collection
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
};
