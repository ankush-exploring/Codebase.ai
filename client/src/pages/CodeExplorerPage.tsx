import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { codeUnderstandingApi, TreeNode, ExplanationResult, FileInfo } from '../services/codeUnderstandingApi';
import { repositoryApi, Repository } from '../services/repositoryApi';
import FileTree from '../components/code/FileTree';
import ExplanationPanel from '../components/code/ExplanationPanel';
import { Spinner } from '../components/ui';

type TaskType = 'explain-function' | 'explain-class' | 'explain-file' | 'explain-folder' | 'ask-question';

export default function CodeExplorerPage() {
  const { id } = useParams<{ id: string }>();
  const [repo, setRepo] = useState<Repository | null>(null);
  const [fileTree, setFileTree] = useState<TreeNode[]>([]);
  const [selectedPath, setSelectedPath] = useState('');
  const [selectedType, setSelectedType] = useState<'file' | 'folder'>('file');
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [explanation, setExplanation] = useState<ExplanationResult | null>(null);
  const [isLoadingTree, setIsLoadingTree] = useState(true);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');

  useEffect(() => {
    if (id) {
      repositoryApi.getById(id).then(setRepo).catch(() => {});
      codeUnderstandingApi.getFileTree(id).then((tree) => {
        setFileTree(tree);
        setIsLoadingTree(false);
      }).catch(() => setIsLoadingTree(false));
    }
  }, [id]);

  const handleSelect = async (path: string, type: 'file' | 'folder') => {
    setSelectedPath(path);
    setSelectedType(type);
    setExplanation(null);
    setFileInfo(null);

    if (type === 'file' && id) {
      setIsLoadingFile(true);
      try {
        const info = await codeUnderstandingApi.getFileInfo(id, path);
        setFileInfo(info);
      } catch {
        /* silently fail */
      } finally {
        setIsLoadingFile(false);
      }
    }
  };

  const handleExplain = async (taskType: TaskType) => {
    if (!id || !selectedPath) return;
    setIsExplaining(true);
    try {
      const result = await codeUnderstandingApi.explain(id, taskType, selectedPath, customQuestion || undefined);
      setExplanation(result);
    } catch {
      /* silently fail */
    } finally {
      setIsExplaining(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!id || !customQuestion.trim()) return;
    setIsExplaining(true);
    try {
      const result = await codeUnderstandingApi.explain(id, 'ask-question', selectedPath || '.', customQuestion);
      setExplanation(result);
    } catch {
      /* silently fail */
    } finally {
      setIsExplaining(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="w-72 clay-card border-r border-clay dark:border-slate-700 flex flex-col shadow-clay-sm">
        <div className="p-3 border-b border-clay dark:border-slate-700">
          <Link to="/dashboard" className="text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 text-xs">&larr; Dashboard</Link>
          <h2 className="text-clay dark:text-white font-semibold text-sm mt-1">{repo?.name || 'Loading...'}</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoadingTree ? (
            <div className="flex justify-center py-8"><Spinner size="sm" /></div>
          ) : (
            <FileTree nodes={fileTree} onSelect={handleSelect} selectedPath={selectedPath} />
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {!selectedPath ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg className="w-16 h-16 text-clay-muted dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <h2 className="text-xl font-semibold text-clay dark:text-white mb-2">Code Explorer</h2>
            <p className="text-clay-secondary dark:text-slate-400 text-sm">Select a file or folder from the tree to explore</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-clay dark:text-white font-mono truncate">{selectedPath}</h2>
              <span className="text-xs text-clay-muted dark:text-slate-500 bg-clay-surface dark:bg-slate-800 px-2 py-0.5 rounded-xl">
                {selectedType}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedType === 'file' && (
                <>
                  <button
                    onClick={() => handleExplain('explain-file')}
                    disabled={isExplaining}
                    className="px-3 py-1.5 text-sm bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl hover:from-primary-600 hover:to-primary-700 transition-all disabled:opacity-50 shadow-clay-sm"
                  >
                    Explain File
                  </button>
                  {fileInfo?.metadata?.functions && fileInfo.metadata.functions.length > 0 && (
                    <select
                      onChange={(e) => {
                        if (e.target.value) handleExplain('explain-function');
                      }}
                      className="px-3 py-1.5 text-sm bg-gradient-to-br from-secondary-500 to-secondary-600 text-white rounded-2xl shadow-clay-sm"
                      defaultValue=""
                    >
                      <option value="" disabled>Explain Function...</option>
                      {fileInfo.metadata.functions.map((f) => (
                        <option key={f.name} value={f.name}>{f.name}()</option>
                      ))}
                    </select>
                  )}
                  {fileInfo?.metadata?.classes && fileInfo.metadata.classes.length > 0 && (
                    <select
                      onChange={(e) => {
                        if (e.target.value) handleExplain('explain-class');
                      }}
                      className="px-3 py-1.5 text-sm bg-gradient-to-br from-secondary-500 to-secondary-600 text-white rounded-2xl shadow-clay-sm"
                      defaultValue=""
                    >
                      <option value="" disabled>Explain Class...</option>
                      {fileInfo.metadata.classes.map((c) => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  )}
                </>
              )}
              {selectedType === 'folder' && (
                <button
                  onClick={() => handleExplain('explain-folder')}
                  disabled={isExplaining}
                  className="px-3 py-1.5 text-sm bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl hover:from-primary-600 hover:to-primary-700 transition-all disabled:opacity-50 shadow-clay-sm"
                >
                  Explain Folder
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="Ask a custom question about this code..."
                className="flex-1 px-3 py-1.5 clay-input rounded-2xl text-clay dark:text-white text-sm placeholder-clay-muted dark:placeholder-slate-400 focus:outline-none focus:border-primary-500 shadow-clay-inset"
                onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
              />
              <button
                onClick={handleAskQuestion}
                disabled={isExplaining || !customQuestion.trim()}
                className="px-3 py-1.5 text-sm bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 shadow-clay-sm"
              >
                Ask
              </button>
            </div>

            {isLoadingFile ? (
              <div className="flex justify-center py-8"><Spinner size="sm" /></div>
            ) : fileInfo && (
              <div className="clay-card p-4 shadow-clay-sm">
                <h3 className="text-clay dark:text-white font-semibold text-sm mb-2">File Info</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  {fileInfo.metadata?.functions && fileInfo.metadata.functions.length > 0 && (
                    <div>
                      <span className="text-clay-secondary dark:text-slate-400">Functions</span>
                      <ul className="text-clay dark:text-slate-300 mt-1">
                        {fileInfo.metadata.functions.map((f) => (
                          <li key={f.name} className="font-mono text-xs">{f.name}({f.params.join(', ')})</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {fileInfo.metadata?.classes && fileInfo.metadata.classes.length > 0 && (
                    <div>
                      <span className="text-clay-secondary dark:text-slate-400">Classes</span>
                      <ul className="text-clay dark:text-slate-300 mt-1">
                        {fileInfo.metadata.classes.map((c) => (
                          <li key={c.name} className="font-mono text-xs">{c.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {fileInfo.metadata?.imports && fileInfo.metadata.imports.length > 0 && (
                    <div>
                      <span className="text-clay-secondary dark:text-slate-400">Imports</span>
                      <ul className="text-clay dark:text-slate-300 mt-1">
                        {fileInfo.metadata.imports.slice(0, 8).map((imp) => (
                          <li key={imp.source} className="font-mono text-xs">{imp.source}</li>
                        ))}
                        {fileInfo.metadata.imports.length > 8 && (
                          <li className="text-clay-muted dark:text-slate-500 text-xs">+{fileInfo.metadata.imports.length - 8} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            <ExplanationPanel result={explanation} isLoading={isExplaining} />
          </div>
        )}
      </div>
    </div>
  );
}
