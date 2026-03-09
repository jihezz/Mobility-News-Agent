/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { 
  FileText, 
  Globe, 
  MapPin, 
  Filter, 
  Plus, 
  Check, 
  ChevronRight,
  Newspaper,
  Calendar,
  Layers,
  Search,
  ArrowRight,
  UserCircle,
  TrendingUp,
  Settings,
  ShieldCheck,
  Wrench,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- TYPES ---
interface NewsItem {
  sentiment: 'positive' | 'negative' | 'neutral';
  headline: string;
  source: string;
  date: string;
  summary: string;
  insights: string[];
  keyword?: string;
}

interface Source {
  id: string;
  name: string;
  tags: string;
}

interface Role {
  id: string;
  title: string;
  description: string;
  icon: any;
  defaultSources: string[];
  defaultKeywords: string[];
}

// --- CONSTANTS ---
const DEFAULT_SOURCES: Source[] = [
  { id: 'dt', name: 'Digital Today', tags: 'autonomous driving, connected car' },
  { id: 'ed', name: 'Economic Daily', tags: 'EV, battery' },
  { id: 'af', name: 'AutoFork', tags: 'policy, charging' }
];

const CANDIDATE_SOURCES: Source[] = [
  { id: 'et', name: 'Electronic Times', tags: 'semiconductor, SDV' },
  { id: 'km', name: 'Korea Mobility News', tags: 'market trends' }
];

const ALL_SOURCES = [...DEFAULT_SOURCES, ...CANDIDATE_SOURCES];

const KEYWORDS = [
  "EV / Battery / Charging",
  "Connected Car / OTA / OnStar",
  "Autonomous Driving / SDV",
  "Manufacturing / Cost",
  "Korea Market / Policy",
  "Subscription / Software Revenue"
];

const ROLES: Role[] = [
  {
    id: 'marketing',
    title: 'Marketing Manager',
    description: 'Focus on market trends, brand reputation, and consumer campaigns.',
    icon: TrendingUp,
    defaultSources: ['dt', 'ed', 'km'],
    defaultKeywords: ['Korea Market / Policy', 'Subscription / Software Revenue']
  },
  {
    id: 'sales',
    title: 'Sales Manager',
    description: 'Monitor regional sales data, pricing strategies, and dealer networks.',
    icon: Zap,
    defaultSources: ['ed', 'km', 'af'],
    defaultKeywords: ['Manufacturing / Cost', 'Korea Market / Policy']
  },
  {
    id: 'onstar',
    title: 'OnStar Manager',
    description: 'Connectivity, OTA updates, and software-defined vehicle services.',
    icon: ShieldCheck,
    defaultSources: ['dt', 'af', 'et'],
    defaultKeywords: ['Connected Car / OTA / OnStar', 'Subscription / Software Revenue']
  },
  {
    id: 'service',
    title: 'Service Manager',
    description: 'Quality reports, recall info, and maintenance technology trends.',
    icon: Wrench,
    defaultSources: ['af', 'km', 'et'],
    defaultKeywords: ['Autonomous Driving / SDV', 'Manufacturing / Cost']
  }
];

const MOCK_NEWS: Record<string, NewsItem[]> = {
  global: [
    { sentiment: 'positive', headline: 'Global EV Sales Reach Record High in Q1 2026', source: 'Reuters', date: '2026-03-08', summary: 'The global electric vehicle market saw a 25% year-over-year growth, driven by falling battery prices and infrastructure expansion. General Motors noted a significant uptick in Equinox EV deliveries overseas.', insights: ['GM is well-positioned with its new platform', 'Battery cost parity reached in 3 key markets'] },
    { sentiment: 'neutral', headline: 'Solid-State Battery Research Hits New Milestone', source: 'Scientific American', date: '2026-03-07', summary: 'Researchers have identified a new ceramic electrolyte that could potentially double the range of standard passenger EVs. Commercialization is expected within 5-7 years.', insights: ['Long-term technology horizon', 'No immediate impact on current manufacturing lines'] },
    { sentiment: 'negative', headline: 'Competitor X Announces $20k Affordable EV for European Market', source: 'Automotive News', date: '2026-03-06', summary: 'A primary competitor has unveiled a sub-$20,000 electric compact aimed at the entry-level market, potentially putting pressure on GM’s regional pricing strategy.', insights: ['Increased pricing competition in EU', 'May require GM to accelerate cost-reduction plans'] },
    { sentiment: 'positive', headline: 'US Infrastructure Bill Allocates Additional $2B for Fast Charging', source: 'Bloomberg', date: '2026-03-05', summary: 'New federal funding will focus on interstate highway charging corridors. This aligns with GM’s commitment to expanding its Ultium Charge 360 network.', insights: ['Reduced range anxiety for customers', 'Direct support for GM’s long-term EV roadmap'] },
    { sentiment: 'neutral', headline: 'Standardization of V2X Communication Protocols Proposed', source: 'TechCrunch', date: '2026-03-04', summary: 'Global regulators are meeting to discuss a unified language for vehicle-to-everything communication. This could streamline connected car features across different manufacturers.', insights: ['Interoperability benefits the whole industry', 'Could simplify OTA update deployments'] }
  ],
  korea: [
    { sentiment: 'positive', headline: 'Hyundai and Samsung SDI Strengthen Battery Alliance', source: 'Electronic Times', date: '2026-03-09', summary: 'A new joint venture plant in Cheonan has been fast-tracked. The strengthening of the local supply chain is expected to stabilize regional production costs.', insights: ['Stable local supply chain benefits industry stability', 'GM Korea may see indirect benefits from local talent pool growth'] },
    { sentiment: 'negative', headline: 'Korean Government Reduces EV Subsidies for High-End Models', source: 'Economic Daily', date: '2026-03-08', summary: 'The Ministry of Environment announced a revised subsidy plan that lowers the price ceiling for full eligibility. This could impact sales of luxury electric trims.', insights: ['Direct impact on Cadillac Lyriq pricing strategy in Korea', 'Need for revised marketing for high-end trims'] },
    { sentiment: 'neutral', headline: 'Seoul City Expands Autonomous Bus Pilot Program', source: 'Digital Today', date: '2026-03-07', summary: 'Self-driving shuttle routes will now include major hubs in Gangnam. The city aims to gather data for its 2030 smart city vision.', insights: ['Valuable local data for SDV development', 'Regulatory sandboxes are expanding'] },
    { sentiment: 'positive', headline: 'GM Korea Export Volumes Rise 15% via Incheon Port', source: 'Korea Mobility News', date: '2026-03-06', summary: 'The Trax Crossover continues to lead export volumes, proving strong international demand for Korean-manufactured GM units.', insights: ['Strong manufacturing base performance', 'Positive contribution to global revenue'] },
    { sentiment: 'neutral', headline: 'Pangyo Techno Valley Hosting "SDV Summit 2026"', source: 'AutoFork', date: '2026-03-05', summary: 'Leading software engineers are gathering to discuss the transition to software-defined vehicles. Key topics include architecture and cybersecurity.', insights: ['Trend towards software-first design', 'Recruitment opportunities for GM’s software divisions'] }
  ],
  keywordMatch: [
    { keyword: "EV / Battery / Charging", sentiment: 'positive', headline: 'New Ultium Battery Chemistry Reduces Cobalt Use by 40%', source: 'Energy Global', date: '2026-03-09', summary: 'Breakthroughs in cathode materials allow for significantly cheaper production while maintaining high energy density.', insights: ['Direct cost savings for GM', 'Sustainable supply chain improvement'] },
    { keyword: "Autonomous Driving / SDV", sentiment: 'positive', headline: 'Super Cruise Expanded to Additional 100k Miles of Roadway', source: 'The Verge', date: '2026-03-08', summary: 'GM’s hands-free driving technology now covers more rural highways, increasing value for suburban drivers.', insights: ['Competitive advantage over standard L2 systems', 'High customer satisfaction rating'] },
    { keyword: "Manufacturing / Cost", sentiment: 'negative', headline: 'Steel Prices Surge Amid Global Trade Disruption', source: 'WSJ', date: '2026-03-07', summary: 'Logistics issues in major shipping lanes have caused a spike in raw material costs, affecting automotive margins globally.', insights: ['Margin pressure on internal combustion and EV models', 'May require supply chain rerouting'] },
    { keyword: "Connected Car / OTA / OnStar", sentiment: 'neutral', headline: 'OnStar Guardian App Reaches 5 Million Active Users', source: 'Press Release', date: '2026-03-06', summary: 'The mobile safety app has seen high adoption among younger demographics, providing recurring revenue streams.', insights: ['Growing subscription revenue base', 'Strong brand loyalty and safety perception'] },
    { keyword: "Korea Market / Policy", sentiment: 'positive', headline: 'Incentives for R&D Centers in Songdo Announced', source: 'Incheon News', date: '2026-03-05', summary: 'Companies building tech centers in the free economic zone will receive tax breaks for the next decade.', insights: ['Opportunity for GM Technical Center Korea', 'Reduced operational overhead'] }
  ]
};

// --- COMPONENTS ---

const NewsCard = ({ item }: { item: NewsItem }) => {
  const sentimentColor = {
    positive: 'bg-emerald-500',
    negative: 'bg-rose-500',
    neutral: 'bg-slate-300 border border-slate-400'
  }[item.sentiment];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-200 rounded-xl p-5 mb-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3 mb-2">
        <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${sentimentColor}`} />
        <h3 className="text-lg font-bold text-slate-800 leading-tight">{item.headline}</h3>
      </div>
      <div className="text-xs font-medium text-slate-500 mb-3 flex items-center gap-2">
        <Newspaper className="w-3 h-3" />
        {item.source} <span className="text-slate-300">|</span> {item.date}
      </div>
      <p className="text-sm text-slate-600 leading-relaxed mb-4">{item.summary}</p>
      <div className="bg-slate-50 rounded-lg p-3 border-l-4 border-slate-200">
        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">Strategic Insights</p>
        <ul className="space-y-1.5">
          {item.insights.map((insight, idx) => (
            <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
              <ChevronRight className="w-3.5 h-3.5 mt-0.5 text-sky-500 shrink-0" />
              {insight}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [step, setStep] = useState(0); // 0: Landing, 1: Role, 2: Config, 3: Dashboard
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [briefingType, setBriefingType] = useState('Daily');
  const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set());
  const [customSource, setCustomSource] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setSelectedSources(new Set(role.defaultSources));
    setSelectedKeywords(new Set(role.defaultKeywords));
    setStep(2);
  };

  const toggleSource = (id: string) => {
    const next = new Set(selectedSources);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedSources(next);
  };

  const toggleKeyword = (keyword: string) => {
    const next = new Set(selectedKeywords);
    if (next.has(keyword)) next.delete(keyword);
    else next.add(keyword);
    setSelectedKeywords(next);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setStep(3);
      setIsGenerating(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1200);
  };

  const activeSourcesList = useMemo(() => {
    const list = ALL_SOURCES
      .filter(s => selectedSources.has(s.id))
      .map(s => s.name);
    if (customSource) {
      list.push(...customSource.split(',').map(s => s.trim()).filter(Boolean));
    }
    return list;
  }, [selectedSources, customSource]);

  const filteredKeywordNews = useMemo(() => {
    if (selectedKeywords.size === 0) return [];
    return MOCK_NEWS.keywordMatch.filter(item => item.keyword && selectedKeywords.has(item.keyword));
  }, [selectedKeywords]);

  // --- RENDER FUNCTIONS ---

  const renderLanding = () => (
    <motion.div 
      key="landing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 text-white overflow-hidden relative"
    >
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-500 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="z-10 text-center max-w-3xl"
      >
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-sky-300 text-sm font-bold mb-8">
          <Layers className="w-4 h-4" />
          AI-POWERED MOBILITY INTELLIGENCE
        </div>
        <h1 className="text-6xl md:text-7xl font-black tracking-tight mb-6 leading-[1.1]">
          Stay Ahead of the <span className="text-sky-400">Mobility</span> Curve.
        </h1>
        <p className="text-xl text-slate-300 mb-12 leading-relaxed">
          Professional-grade news curation and strategic analysis for mobility leaders. 
          Get personalized briefings tailored to your specific role and interests.
        </p>
        <button 
          onClick={() => setStep(1)}
          className="bg-sky-500 hover:bg-sky-400 text-white font-black text-lg py-5 px-10 rounded-2xl shadow-2xl shadow-sky-500/40 transition-all active:scale-95 flex items-center gap-3 mx-auto"
        >
          Get Started
          <ArrowRight className="w-6 h-6" />
        </button>
      </motion.div>
    </motion.div>
  );

  const renderRoleSelection = () => (
    <motion.div 
      key="roles"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8"
    >
      <div className="max-w-5xl w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-slate-900 mb-4">Select Your Professional Role</h2>
          <p className="text-slate-500">We'll customize your news sources and keywords based on your expertise.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ROLES.map((role) => (
            <button
              key={role.id}
              onClick={() => handleRoleSelect(role)}
              className="group bg-white border border-slate-200 p-8 rounded-3xl text-left hover:border-sky-500 hover:shadow-xl hover:shadow-sky-500/10 transition-all flex flex-col h-full active:scale-95"
            >
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-sky-50 group-hover:text-sky-600 transition-colors">
                <role.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{role.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-6 flex-grow">{role.description}</p>
              <div className="flex items-center gap-2 text-sky-600 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                Select Role <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderSmartConfig = () => (
    <motion.div 
      key="config"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8"
    >
      <div className="max-w-3xl w-full bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-10 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-600">
              {selectedRole && <selectedRole.icon className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Smart Configuration</h2>
              <p className="text-sm text-slate-400">Optimized for <span className="text-sky-600 font-bold">{selectedRole?.title}</span></p>
            </div>
          </div>
          <button onClick={() => setStep(1)} className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest">Change Role</button>
        </div>

        <div className="p-10 space-y-10">
          <section>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
              <Globe className="w-4 h-4" />
              Confirm Monitoring Sources
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ALL_SOURCES.map(source => (
                <button 
                  key={source.id}
                  onClick={() => toggleSource(source.id)}
                  className={`flex items-start gap-4 p-4 rounded-2xl border transition-all text-left ${
                    selectedSources.has(source.id) 
                      ? 'bg-sky-50 border-sky-200' 
                      : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${selectedSources.has(source.id) ? 'bg-sky-500 border-sky-500 text-white' : 'bg-slate-50 border-slate-200'}`}>
                    {selectedSources.has(source.id) && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{source.name}</p>
                    <p className="text-[10px] text-slate-400 leading-tight mt-1">{source.tags}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
              <Filter className="w-4 h-4" />
              Target Keywords
            </label>
            <div className="flex flex-wrap gap-3">
              {KEYWORDS.map(keyword => (
                <button
                  key={keyword}
                  onClick={() => toggleKeyword(keyword)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                    selectedKeywords.has(keyword) 
                      ? 'bg-sky-500 border-sky-500 text-white shadow-lg shadow-sky-500/20' 
                      : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200'
                  }`}
                >
                  {keyword}
                </button>
              ))}
            </div>
          </section>

          <div className="flex items-center gap-6 pt-6">
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Briefing Frequency</label>
              <select 
                value={briefingType}
                onChange={(e) => setBriefingType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
              >
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>
            <div className="flex-[2]">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">&nbsp;</label>
              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-slate-900 hover:bg-black text-white font-black py-3 px-6 rounded-xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3"
              >
                {isGenerating ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Build My Briefing
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderDashboard = () => (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* --- SIDEBAR --- */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-sky-600 mb-1">
            <Layers className="w-6 h-6" />
            <h1 className="text-xl font-bold tracking-tight">Mobility Agent</h1>
          </div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Briefing Builder v1.2</p>
        </div>

        <div className="p-6 space-y-8">
          {/* User Profile Info */}
          <section className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-sky-600 shadow-sm">
                {selectedRole && <selectedRole.icon className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Profile</p>
                <p className="text-sm font-bold text-slate-800">{selectedRole?.title}</p>
              </div>
            </div>
            <button onClick={() => setStep(1)} className="w-full text-[10px] font-bold text-sky-600 hover:text-sky-700 uppercase tracking-widest text-left flex items-center gap-1">
              <Settings className="w-3 h-3" />
              Switch Role
            </button>
          </section>

          {/* Briefing Type */}
          <section>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              <Calendar className="w-3.5 h-3.5" />
              Briefing Type
            </label>
            <select 
              value={briefingType}
              onChange={(e) => setBriefingType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            >
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </section>

          {/* Monitoring Sources */}
          <section>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              <Globe className="w-3.5 h-3.5" />
              Monitoring Sources
            </label>
            
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-slate-300 uppercase mb-2">Active Sources</p>
                <div className="space-y-2">
                  {ALL_SOURCES.map(source => (
                    <button 
                      key={source.id}
                      onClick={() => toggleSource(source.id)}
                      className="flex items-start gap-3 w-full text-left group"
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedSources.has(source.id) ? 'bg-sky-500 border-sky-500 text-white' : 'border-slate-300 group-hover:border-sky-400'}`}>
                        {selectedSources.has(source.id) && <Check className="w-3 h-3" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{source.name}</p>
                        <p className="text-[10px] text-slate-400 leading-tight">{source.tags}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-300 uppercase mb-2">Custom Sources</p>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Reuters, Bloomberg..."
                    value={customSource}
                    onChange={(e) => setCustomSource(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  />
                  <Plus className="absolute right-2.5 top-2.5 w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>
          </section>

          {/* Keyword Options */}
          <section>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              <Filter className="w-3.5 h-3.5" />
              Keyword Options
            </label>
            <div className="flex flex-wrap gap-2">
              {KEYWORDS.map(keyword => (
                <button
                  key={keyword}
                  onClick={() => toggleKeyword(keyword)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    selectedKeywords.has(keyword) 
                      ? 'bg-sky-500 border-sky-500 text-white shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-600 hover:border-sky-300'
                  }`}
                >
                  {keyword}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-auto p-6 bg-slate-50/50 border-t border-slate-100">
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-sky-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <FileText className="w-5 h-5" />
                Refresh Briefing
              </>
            )}
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto scroll-smooth">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto py-12 px-8"
        >
          {/* Briefing Header */}
          <header className="mb-12 pb-8 border-b-2 border-sky-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 text-sky-600 font-bold text-sm uppercase tracking-widest">
                <div className="w-8 h-1 bg-sky-600" />
                {briefingType} Intelligence Report
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                <UserCircle className="w-4 h-4" />
                {selectedRole?.title}
              </div>
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-6 leading-tight">
              Mobility & Connected Operations Briefing
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Monitoring Sources</p>
                <div className="flex flex-wrap gap-1.5">
                  {activeSourcesList.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold border border-slate-200">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Active Filters</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedKeywords.size > 0 ? (
                    Array.from(selectedKeywords).map((k, i) => (
                      <span key={i} className="px-2 py-0.5 bg-sky-50 text-sky-700 rounded text-[10px] font-bold border border-sky-100">{k}</span>
                    ))
                  ) : (
                    <span className="text-[10px] font-bold text-slate-300 italic">No keyword filters applied</span>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Section 1: Global */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-sky-100 rounded-lg text-sky-600">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Global Mobility News</h2>
                <p className="text-xs text-slate-400 font-medium">Top global industry developments and market shifts.</p>
              </div>
            </div>
            <div className="space-y-4">
              {MOCK_NEWS.global.map((news, idx) => (
                <div key={idx}>
                  <NewsCard item={news} />
                </div>
              ))}
            </div>
          </section>

          {/* Section 2: Korea */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Korea Mobility Market</h2>
                <p className="text-xs text-slate-400 font-medium">Regional insights from the Korean manufacturing and tech hub.</p>
              </div>
            </div>
            <div className="space-y-4">
              {MOCK_NEWS.korea.map((news, idx) => (
                <div key={idx}>
                  <NewsCard item={news} />
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: Keyword Based */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                <Filter className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Targeted Intelligence</h2>
                <p className="text-xs text-slate-400 font-medium">News curated based on your specific areas of interest.</p>
              </div>
            </div>
            
            {selectedKeywords.size === 0 ? (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center">
                <p className="text-sm font-medium text-slate-400">No keyword filters selected in the sidebar.</p>
              </div>
            ) : filteredKeywordNews.length > 0 ? (
              <div className="space-y-4">
                {filteredKeywordNews.map((news, idx) => (
                  <div key={idx}>
                    <NewsCard item={news} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center">
                <p className="text-sm font-medium text-slate-400">No specific news matches for the selected keywords today.</p>
              </div>
            )}
          </section>

          <footer className="pt-12 border-t border-slate-200 text-center">
            <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">End of Briefing</p>
            <p className="text-[10px] text-slate-400">Generated on {new Date().toLocaleDateString()} • Mobility News Agent AI</p>
          </footer>
        </motion.div>
      </main>
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      {step === 0 && renderLanding()}
      {step === 1 && renderRoleSelection()}
      {step === 2 && renderSmartConfig()}
      {step === 3 && renderDashboard()}
    </AnimatePresence>
  );
}
