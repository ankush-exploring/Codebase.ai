import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { repositoryApi } from '../services/repositoryApi';
import { Button, Input, Alert } from '../components/ui';

type Tab = 'url' | 'zip' | 'folder';

export default function AddRepoPage() {
  const [activeTab, setActiveTab] = useState<Tab>('url');
  const [repoUrl, setRepoUrl] = useState('');
  const [repoName, setRepoName] = useState('');
  const [branch, setBranch] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const tabs: { key: Tab; label: string }[] = [
    { key: 'url', label: 'GitHub URL' },
    { key: 'zip', label: 'Upload ZIP' },
    { key: 'folder', label: 'Upload Folder' },
  ];

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await repositoryApi.importByUrl(repoUrl, branch || undefined, repoName || undefined);
      navigate('/dashboard/repos');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to import repository');
    } finally {
      setIsLoading(false);
    }
  };

  const handleZipSubmit = async () => {
    if (!selectedFile) return;
    setError('');
    setIsLoading(true);
    try {
      await repositoryApi.importByZip(selectedFile, repoName || undefined);
      navigate('/dashboard/repos');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to import ZIP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files?.[0]) {
      const file = files[0];
      if (activeTab === 'zip' && file.name.endsWith('.zip')) {
        setSelectedFile(file);
        if (!repoName) setRepoName(file.name.replace('.zip', ''));
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!repoName) setRepoName(file.name.replace('.zip', ''));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-clay dark:text-white">Import Repository</h1>
        <p className="text-clay-secondary dark:text-slate-400 mt-1">Add a codebase to analyze with AI</p>
      </div>

      <div className="clay-card p-6 shadow-clay-sm">
        {error && <Alert variant="error" className="mb-4">{error}</Alert>}

        <div className="flex gap-1 bg-clay dark:bg-slate-900 rounded-2xl p-1 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setError(''); setSelectedFile(null); }}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                activeTab === tab.key
                  ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-clay-sm'
                  : 'text-clay-secondary dark:text-slate-400 hover:text-clay dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'url' && (
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <Input
              label="Repository Name"
              placeholder="my-project"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
            />
            <Input
              label="GitHub / GitLab URL"
              placeholder="https://github.com/user/repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              required
            />
            <Input
              label="Branch (optional)"
              placeholder="main"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
            />
            <Button type="submit" isLoading={isLoading} className="w-full">
              Import Repository
            </Button>
          </form>
        )}

        {(activeTab === 'zip' || activeTab === 'folder') && (
          <div className="space-y-4">
            <Input
              label="Repository Name (optional)"
              placeholder="my-project"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
            />

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${
                dragActive
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-clay dark:border-slate-600 hover:border-primary-400 dark:hover:border-primary-500'
              }`}
            >
              {selectedFile ? (
                <div>
                  <p className="text-clay dark:text-white font-medium">{selectedFile.name}</p>
                  <p className="text-clay-secondary dark:text-slate-400 text-sm mt-1">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <svg className="w-10 h-10 text-clay-muted dark:text-slate-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-clay-secondary dark:text-slate-400">
                    {activeTab === 'zip' ? 'Drop a .zip file here or click to browse' : 'Drag a folder here'}
                  </p>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={activeTab === 'zip' ? '.zip' : undefined}
              onChange={handleFileSelect}
              className="hidden"
            />

            <Button onClick={handleZipSubmit} isLoading={isLoading} disabled={!selectedFile} className="w-full">
              {activeTab === 'zip' ? 'Upload & Import' : 'Import Folder'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
