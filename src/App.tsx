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
  Search
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

const KEYWORDS = [
  "EV / Battery / Charging",
  "Connected Car / OTA / OnStar",
  "Autonomous Driving / SDV",
  "Manufacturing / Cost",
  "Korea Market / Policy",
  "Subscription / Software Revenue"
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
  const [briefingType, setBriefingType] = useState('Daily');
  const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set([...DEFAULT_SOURCES, ...CANDIDATE_SOURCES].map(s => s.id)));
  const [customSource, setCustomSource] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const [isGenerated, setIsGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

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
    // Simulate generation delay
    setTimeout(() => {
      setIsGenerated(true);
      setIsGenerating(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 800);
  };

  const activeSourcesList = useMemo(() => {
    const list = [...DEFAULT_SOURCES, ...CANDIDATE_SOURCES]
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

  return (
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
                <p className="text-[10px] font-bold text-slate-300 uppercase mb-2">Default Sources</p>
                <div className="space-y-2">
                  {DEFAULT_SOURCES.map(source => (
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
                <p className="text-[10px] font-bold text-slate-300 uppercase mb-2">Candidate Sources</p>
                <div className="space-y-2">
                  {CANDIDATE_SOURCES.map(source => (
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
                Generate Briefing
              </>
            )}
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto scroll-smooth">
        <AnimatePresence mode="wait">
          {!isGenerated ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center p-12 text-center"
            >
              <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6">
                <Search className="w-10 h-10 text-slate-300" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Ready to Build Your Briefing</h2>
              <p className="text-slate-500 max-w-md">
                Configure your sources and keywords in the sidebar, then click generate to see your curated mobility industry briefing.
              </p>
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto py-12 px-8"
            >
              {/* Briefing Header */}
              <header className="mb-12 pb-8 border-b-2 border-sky-500">
                <div className="flex items-center gap-3 text-sky-600 font-bold text-sm uppercase tracking-widest mb-4">
                  <div className="w-8 h-1 bg-sky-600" />
                  {briefingType} Intelligence Report
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
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
