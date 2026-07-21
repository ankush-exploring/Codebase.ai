import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { repositoryApi, Repository } from '../services/repositoryApi';
import { architectureApi } from '../services/architectureApi';
import MermaidDiagram from '../components/architecture/MermaidDiagram';
import { Spinner } from '../components/ui';

type DiagramTab = 'folders' | 'dependencies' | 'api-flow' | 'db-schema';

const TABS: { key: DiagramTab; label: string; description: string }[] = [
  { key: 'folders', label: 'Folder Structure', description: 'File and directory layout' },
  { key: 'dependencies', label: 'Dependencies', description: 'Import relationships between files' },
  { key: 'api-flow', label: 'API Flow', description: 'Backend route structure' },
  { key: 'db-schema', label: 'DB Schema', description: 'Database table relationships' },
];

export default function ArchitecturePage() {
  const { id } = useParams<{ id: string }>();
  const [repo, setRepo] = useState<Repository | null>(null);
  const [activeTab, setActiveTab] = useState<DiagramTab>('folders');
  const [diagrams, setDiagrams] = useState<Record<DiagramTab, string>>({
    folders: '',
    dependencies: '',
    'api-flow': '',
    'db-schema': '',
  });
  const [loading, setLoading] = useState<Record<DiagramTab, boolean>>({
    folders: false,
    dependencies: false,
    'api-flow': false,
    'db-schema': false,
  });
  const [errors, setErrors] = useState<Record<DiagramTab, string>>({
    folders: '',
    dependencies: '',
    'api-flow': '',
    'db-schema': '',
  });

  useEffect(() => {
    if (id) repositoryApi.getById(id).then(setRepo).catch(() => {});
  }, [id]);

  const loadDiagram = async (tab: DiagramTab) => {
    if (!id || diagrams[tab]) return;

    setLoading((prev) => ({ ...prev, [tab]: true }));
    setErrors((prev) => ({ ...prev, [tab]: '' }));

    try {
      let mermaid = '';
      switch (tab) {
        case 'folders': mermaid = await architectureApi.getFolderStructure(id); break;
        case 'dependencies': mermaid = await architectureApi.getDependencyGraph(id); break;
        case 'api-flow': mermaid = await architectureApi.getApiFlow(id); break;
        case 'db-schema': mermaid = await architectureApi.getDbSchema(id); break;
      }
      setDiagrams((prev) => ({ ...prev, [tab]: mermaid }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load diagram';
      setErrors((prev) => ({ ...prev, [tab]: msg }));
    } finally {
      setLoading((prev) => ({ ...prev, [tab]: false }));
    }
  };

  useEffect(() => {
    loadDiagram(activeTab);
  }, [activeTab, id]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/dashboard" className="text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 text-sm">&larr; Dashboard</Link>
        <h1 className="text-2xl font-bold text-clay dark:text-white mt-2">Architecture — {repo?.name || '...'}</h1>
        <p className="text-clay-secondary dark:text-slate-400 text-sm mt-1">Visual diagrams of your codebase structure</p>
      </div>

      <div className="flex gap-1 bg-clay-surface dark:bg-slate-800 rounded-2xl p-1 mb-6 border border-clay dark:border-slate-700">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-clay-sm'
                : 'text-clay-secondary dark:text-slate-400 hover:text-clay dark:hover:text-white hover:bg-clay-elevated dark:hover:bg-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <p className="text-clay-muted dark:text-slate-500 text-xs mb-4">
        {TABS.find((t) => t.key === activeTab)?.description}
      </p>

      {loading[activeTab] ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="md" />
          <p className="text-clay-secondary dark:text-slate-400 text-sm mt-3">Generating diagram...</p>
        </div>
      ) : errors[activeTab] ? (
        <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-6 text-center">
          <p className="text-red-500 dark:text-red-400 text-sm">{errors[activeTab]}</p>
          <button
            onClick={() => {
              setDiagrams((prev) => ({ ...prev, [activeTab]: '' }));
              loadDiagram(activeTab);
            }}
            className="mt-3 px-4 py-1.5 text-sm bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : diagrams[activeTab] ? (
        <MermaidDiagram code={diagrams[activeTab]} className="min-h-[400px]" />
      ) : null}
    </div>
  );
}
