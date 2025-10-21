import React from 'react';
import { NeuralCrewLogo } from '@/assets/logos';
import { BrandText } from '@/components/ui';
import BrandShowcase from '@/components/BrandShowcase';

export const TestPage: React.FC = () => {
  return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      minHeight: '100vh'
    }}>
      <div style={{ marginBottom: '60px' }}>
        <h1 style={{ color: '#94a3b8', marginBottom: '20px', fontSize: '2rem', fontWeight: 400 }}>
          Brand Identity Showcase
        </h1>
        <BrandText size="xl" variant="gradient" />
        
        <div style={{ 
          marginTop: '40px',
      padding: '20px', 
          background: 'rgba(6, 182, 212, 0.1)',
          borderRadius: '12px',
          display: 'inline-block'
        }}>
          <p style={{ color: '#94a3b8', marginBottom: '15px', fontSize: '0.9rem' }}>
            ✅ Clean Imports Verified
          </p>
          <code style={{ 
            color: '#06b6d4',
            background: 'rgba(15, 23, 42, 0.5)',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.85rem',
            display: 'block',
            marginBottom: '8px'
          }}>
            import &#123; NeuralCrewLogo &#125; from '@/assets/logos'
          </code>
          <code style={{ 
            color: '#06b6d4',
            background: 'rgba(15, 23, 42, 0.5)',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.85rem',
            display: 'block'
          }}>
            import &#123; BrandText &#125; from '@/components/ui'
          </code>
        </div>
      </div>

      {/* BrandShowcase Component Demo */}
      <div style={{ 
        marginBottom: '60px',
        padding: '40px',
        background: 'rgba(99, 102, 241, 0.05)',
        borderRadius: '16px',
        border: '2px solid rgba(99, 102, 241, 0.2)'
      }}>
        <h2 style={{ color: '#6366f1', marginBottom: '30px', fontSize: '1.8rem' }}>
          BrandShowcase Component
        </h2>
        <p style={{ color: '#94a3b8', marginBottom: '30px', fontSize: '1rem' }}>
          Pre-built component combining logo and text with clean imports
        </p>
        
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginTop: '30px'
        }}>
          <div style={{ 
            background: 'rgba(6, 182, 212, 0.1)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h3 style={{ color: '#06b6d4', fontSize: '1rem', marginBottom: '15px' }}>Compact</h3>
            <BrandShowcase layout="horizontal" size="compact" variant="cyan" />
          </div>
          
          <div style={{ 
            background: 'rgba(6, 182, 212, 0.1)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h3 style={{ color: '#06b6d4', fontSize: '1rem', marginBottom: '15px' }}>Standard</h3>
            <BrandShowcase layout="horizontal" size="standard" variant="cyan" />
          </div>
          
          <div style={{ 
            background: 'rgba(99, 102, 241, 0.1)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h3 style={{ color: '#6366f1', fontSize: '1rem', marginBottom: '15px' }}>Large Vertical</h3>
            <BrandShowcase layout="vertical" size="large" variant="indigo" />
          </div>
        </div>
      </div>
      
      <div style={{ 
        display: 'flex', 
        gap: '60px', 
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginTop: '40px'
      }}>
        {/* Cyan Variant - Animated */}
        <div style={{ 
          background: 'rgba(6, 182, 212, 0.1)', 
          padding: '40px', 
          borderRadius: '16px',
          border: '2px solid rgba(6, 182, 212, 0.3)',
          boxShadow: '0 0 40px rgba(6, 182, 212, 0.2)'
        }}>
          <h2 style={{ color: '#06b6d4', marginBottom: '20px' }}>Cyan Variant (Animated)</h2>
          <NeuralCrewLogo variant="cyan" animated={true} width={200} height={200} />
          <p style={{ color: '#94a3b8', marginTop: '20px' }}>
            Ocean Breeze Theme
          </p>
        </div>

        {/* Indigo Variant - Animated */}
        <div style={{ 
          background: 'rgba(99, 102, 241, 0.1)', 
          padding: '40px', 
          borderRadius: '16px',
          border: '2px solid rgba(99, 102, 241, 0.3)',
          boxShadow: '0 0 40px rgba(99, 102, 241, 0.2)'
        }}>
          <h2 style={{ color: '#6366f1', marginBottom: '20px' }}>Indigo Variant (Animated)</h2>
          <NeuralCrewLogo variant="indigo" animated={true} width={200} height={200} />
          <p style={{ color: '#94a3b8', marginTop: '20px' }}>
            Deep Ocean Theme
          </p>
        </div>

        {/* Cyan Static */}
        <div style={{ 
          background: 'rgba(6, 182, 212, 0.1)', 
          padding: '40px', 
          borderRadius: '16px',
          border: '2px solid rgba(6, 182, 212, 0.3)'
        }}>
          <h2 style={{ color: '#06b6d4', marginBottom: '20px' }}>Cyan (Static)</h2>
          <NeuralCrewLogo variant="cyan" animated={false} width={160} height={160} />
          <p style={{ color: '#94a3b8', marginTop: '20px' }}>
            No Animation
          </p>
        </div>

        {/* Small Size Demo */}
        <div style={{ 
          background: 'rgba(6, 182, 212, 0.1)', 
          padding: '40px', 
          borderRadius: '16px',
          border: '2px solid rgba(6, 182, 212, 0.3)'
        }}>
          <h2 style={{ color: '#06b6d4', marginBottom: '20px' }}>Small Size (80px)</h2>
          <NeuralCrewLogo variant="cyan" animated={true} width={80} height={80} />
          <p style={{ color: '#94a3b8', marginTop: '20px' }}>
            Icon Size
          </p>
        </div>
      </div>

      {/* Brand Typography Showcase */}
      <div style={{ 
        marginTop: '80px',
        padding: '40px',
        background: 'rgba(99, 102, 241, 0.05)',
        borderRadius: '16px',
        border: '2px solid rgba(99, 102, 241, 0.2)'
      }}>
        <h2 style={{ color: '#6366f1', marginBottom: '40px', fontSize: '2rem' }}>
          Brand Typography
        </h2>
        
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '40px',
          marginTop: '30px'
        }}>
          {/* Gradient Variant */}
          <div style={{ 
            background: 'rgba(6, 182, 212, 0.1)',
            padding: '30px',
            borderRadius: '12px',
            border: '1px solid rgba(6, 182, 212, 0.2)'
          }}>
            <h3 style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '20px' }}>
              Gradient Variant
            </h3>
            <div style={{ marginBottom: '15px' }}>
              <BrandText size="sm" variant="gradient" />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <BrandText size="md" variant="gradient" />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <BrandText size="lg" variant="gradient" />
            </div>
            <div>
              <BrandText size="xl" variant="gradient" />
            </div>
          </div>

          {/* Dual Variant */}
          <div style={{ 
            background: 'rgba(99, 102, 241, 0.1)',
            padding: '30px',
            borderRadius: '12px',
            border: '1px solid rgba(99, 102, 241, 0.2)'
          }}>
            <h3 style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '20px' }}>
              Dual Variant
            </h3>
            <div style={{ marginBottom: '15px' }}>
              <BrandText size="sm" variant="dual" />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <BrandText size="md" variant="dual" />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <BrandText size="lg" variant="dual" />
            </div>
            <div>
              <BrandText size="xl" variant="dual" />
            </div>
          </div>

          {/* Mono Variant */}
          <div style={{ 
            background: 'rgba(14, 165, 233, 0.1)',
            padding: '30px',
            borderRadius: '12px',
            border: '1px solid rgba(14, 165, 233, 0.2)'
          }}>
            <h3 style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '20px' }}>
              Mono Variant
            </h3>
            <div style={{ marginBottom: '15px' }}>
              <BrandText size="sm" variant="mono" />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <BrandText size="md" variant="mono" />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <BrandText size="lg" variant="mono" />
            </div>
            <div>
              <BrandText size="xl" variant="mono" />
            </div>
          </div>

          {/* Short Form */}
          <div style={{ 
            background: 'rgba(6, 182, 212, 0.1)',
            padding: '30px',
            borderRadius: '12px',
            border: '1px solid rgba(6, 182, 212, 0.2)'
          }}>
            <h3 style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '20px' }}>
              Short Form (WS)
            </h3>
            <div style={{ marginBottom: '15px' }}>
              <BrandText size="sm" variant="gradient" showFullName={false} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <BrandText size="md" variant="gradient" showFullName={false} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <BrandText size="lg" variant="dual" showFullName={false} />
            </div>
            <div>
              <BrandText size="xl" variant="mono" showFullName={false} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ 
        marginTop: '60px', 
        padding: '30px',
        background: 'rgba(6, 182, 212, 0.05)',
        borderRadius: '12px',
        maxWidth: '800px',
        margin: '60px auto 0'
      }}>
        <h3 style={{ color: '#0ea5e9', marginBottom: '20px' }}>Component Features</h3>
        
        <div style={{ textAlign: 'left', marginBottom: '30px' }}>
          <h4 style={{ color: '#06b6d4', marginBottom: '15px' }}>Neural Crew Logo</h4>
          <ul style={{ 
            color: '#cbd5e1', 
            lineHeight: '2',
            fontSize: '1.1rem'
          }}>
            <li>✨ Two color variants: Cyan and Indigo</li>
            <li>🎬 Optional SVG animations (pulsing core & synapse connections)</li>
            <li>📐 Scalable to any size</li>
            <li>🎨 Ocean Breeze theme colors (#06b6d4, #0ea5e9, #0284c7)</li>
            <li>🧠 Neural network visual metaphor for AI-powered crew management</li>
          </ul>
        </div>

        <div style={{ textAlign: 'left' }}>
          <h4 style={{ color: '#6366f1', marginBottom: '15px' }}>Brand Typography</h4>
          <ul style={{ 
            color: '#cbd5e1', 
            lineHeight: '2',
            fontSize: '1.1rem'
          }}>
            <li>🎨 Three style variants: Gradient, Dual, Mono</li>
            <li>📏 Four size options: sm, md, lg, xl</li>
            <li>✂️ Short form option (WS)</li>
            <li>🌊 Ocean Breeze gradient (Wave) + Deep Ocean (Sync)</li>
            <li>♿ Fully accessible and semantic</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
