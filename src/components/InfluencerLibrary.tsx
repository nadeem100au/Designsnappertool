import { useState } from 'react';
import { ArrowLeft, Check, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Influencer {
  id: string;
  name: string;
  role: string;
  image: string;
  description: string;
  tags: string[];
}

const INFLUENCERS: Influencer[] = [
  {
    id: 'chris-do',
    name: 'Chris Do',
    role: 'Business & Branding',
    image: 'https://images.unsplash.com/photo-1752486268262-6ce6b339a8de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    description: 'Expert in pricing strategy, negotiation, and business mindset for creatives.',
    tags: ['Business', 'Strategy', 'Sales']
  },
  {
    id: 'don-norman',
    name: 'Don Norman',
    role: 'Usability Expert',
    image: 'https://images.unsplash.com/photo-1758685734565-fc8ff6e9ffcc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    description: 'The father of cognitive engineering and user-centered design.',
    tags: ['UX', 'Psychology', 'Usability']
  },
  {
    id: 'ansh-mehra',
    name: 'Ansh Mehra',
    role: 'UX Storyteller',
    image: 'https://images.unsplash.com/photo-1756990909920-2dc76a19c154?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    description: 'Modern UX/UI educator focusing on storytelling and visual presentation.',
    tags: ['UI', 'Storytelling', 'Career']
  },
  {
    id: 'sarah-dribbble',
    name: 'Sarah Chen',
    role: 'Visual Design Lead',
    image: 'https://images.unsplash.com/photo-1614036634955-ae5e90f9b9eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aXN1YWwlMjBkZXNpZ25lciUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MDExMzIwNXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Specializes in high-fidelity UI, typography, and color theory.',
    tags: ['Visual', 'UI', 'Typography']
  },
  {
    id: 'mike-product',
    name: 'Mike Ross',
    role: 'Product Manager',
    image: 'https://images.unsplash.com/photo-1742119803195-aaf41d6b2e61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwZW50cmVwcmVuZXVyJTIwcG9ydHJhaXQlMjBtYW58ZW58MXx8fHwxNzcwMTEzMTg4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Focuses on product-market fit, metrics, and user retention.',
    tags: ['Product', 'Metrics', 'Strategy']
  },
  {
    id: 'jessica-access',
    name: 'Jessica Lee',
    role: 'Contrast Expert',
    image: 'https://images.unsplash.com/photo-1585244129648-5dc1f9cd9d7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY2Nlc3NpYmlsaXR5JTIwZXhwZXJ0JTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcwMTEzMjAwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Ensures digital products are legible and accessible to everyone.',
    tags: ['Contrast', 'Inclusive', 'Code']
  },
  {
    id: 'david-founder',
    name: 'David Kim',
    role: 'Startup Founder',
    image: 'https://images.unsplash.com/photo-1769071166862-8cc3a6f2ac5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGFydHVwJTIwZm91bmRlciUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MDEwNDMwNnww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Bootstrap founder perspective on shipping fast and validating ideas.',
    tags: ['Startup', 'Growth', 'MVP']
  },
  {
    id: 'elena-minimal',
    name: 'Elena Silva',
    role: 'Minimalist Designer',
    image: 'https://images.unsplash.com/photo-1740223544743-2aac7fb644c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwZGVzaWduZXIlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzAxMTMxOTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Less is more. Focusing on whitespace, layout, and essentialism.',
    tags: ['Minimalism', 'Layout', 'Print']
  },
  {
    id: 'marcus-brand',
    name: 'Marcus Thorne',
    role: 'Brand Strategist',
    image: 'https://images.unsplash.com/photo-1733231291455-3c4de1c24e20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmFuZGluZyUyMGV4cGVydCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MDExMzIwOHww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Helping companies find their voice and visual identity in a crowded market.',
    tags: ['Brand', 'Identity', 'Marketing']
  },
  {
    id: 'sophia-ux',
    name: 'Sophia Wu',
    role: 'Senior UX Researcher',
    image: 'https://images.unsplash.com/photo-1589220286904-3dcef62c68ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZW5pb3IlMjB1eCUyMGRlc2lnbmVyJTIwcG9ydHJhaXQlMjB3b21hbnxlbnwxfHx8fDE3NzAxMTMxODR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Data-driven design decisions based on user testing and analytics.',
    tags: ['Research', 'Data', 'Testing']
  }
];

interface InfluencerLibraryProps {
  onNavigate: (screen: string, data?: any) => void;
  data?: any;
}

export function InfluencerLibrary({ onNavigate, data }: InfluencerLibraryProps) {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(data?.selectedPersona || null);

  const filteredInfluencers = INFLUENCERS.filter(inf => 
    inf.name.toLowerCase().includes(search.toLowerCase()) || 
    inf.role.toLowerCase().includes(search.toLowerCase()) ||
    inf.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSave = () => {
    if (selectedId) {
      onNavigate('upload', { ...data, selectedPersona: selectedId });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => onNavigate('upload', data)}>
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Button>
          <h1 className="text-xl font-bold text-slate-900">Influencer Library</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            onClick={handleSave} 
            disabled={!selectedId}
            className="bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
          >
            Select Persona
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full p-6 lg:p-8 flex-1">
        <div className="relative mb-8 max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search by name, role, or skill..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white border-slate-200"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredInfluencers.map((inf) => {
            const isSelected = selectedId === inf.id;
            return (
              <div 
                key={inf.id}
                onClick={() => setSelectedId(inf.id)}
                className={`group cursor-pointer bg-white rounded-2xl border transition-all duration-200 overflow-hidden relative ${
                  isSelected 
                    ? 'border-[#0066ff] ring-2 ring-[#0066ff]/20 shadow-lg' 
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 z-10 w-6 h-6 bg-[#0066ff] text-white rounded-full flex items-center justify-center shadow-sm">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
                <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                  <ImageWithFallback 
                    src={inf.image} 
                    alt={inf.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-bold text-slate-900 leading-tight">{inf.name}</h3>
                      <p className="text-xs font-medium text-slate-500">{inf.role}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">{inf.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {inf.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold uppercase tracking-wider">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
