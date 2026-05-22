import {
  Check,
  Clipboard,
  FileText,
  Loader2,
  Megaphone,
  RefreshCw,
  Search,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  generateDescription,
  generateMarketingCaptions,
  generateSeoTags,
} from '../../services/aiApi';

const tools = [
  {
    id: 'description',
    label: 'Generate Description',
    shortLabel: 'Description',
    icon: FileText,
    action: generateDescription,
  },
  {
    id: 'tags',
    label: 'Generate SEO Tags',
    shortLabel: 'SEO Tags',
    icon: Search,
    action: generateSeoTags,
  },
  {
    id: 'captions',
    label: 'Generate Marketing Caption',
    shortLabel: 'Captions',
    icon: Megaphone,
    action: generateMarketingCaptions,
  },
];

const joinList = (items) => (items || []).filter(Boolean).join(', ');

const buildCopyText = (type, data) => {
  if (!data) {
    return '';
  }

  if (type === 'description') {
    return [
      data.title,
      data.metaDescription,
      data.shortDescription,
      data.longDescription,
      ...(data.bulletPoints || []).map((item) => `- ${item}`),
      `Keywords: ${joinList(data.primaryKeywords)}`,
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  if (type === 'tags') {
    return [
      `Tags: ${joinList(data.tags)}`,
      `SEO Keywords: ${joinList(data.seoKeywords)}`,
      `Long-tail Keywords: ${joinList(data.longTailKeywords)}`,
      `Category Suggestions: ${joinList(data.categorySuggestions)}`,
    ].join('\n');
  }

  return [
    data.shortCaption,
    data.adCaption,
    ...(data.captions || []).map(
      (caption) =>
        `${caption.channel} - ${caption.angle}\n${caption.caption}\nCTA: ${caption.callToAction}\n${joinList(caption.hashtags)}`
    ),
  ]
    .filter(Boolean)
    .join('\n\n');
};

const CopyButton = ({ value, onToast }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
      onToast?.({ type: 'success', title: 'Copied', message: 'Generated content copied to clipboard.' });
    } catch {
      onToast?.({ type: 'error', title: 'Copy failed', message: 'Your browser blocked clipboard access.' });
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={!value}
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Clipboard className="h-4 w-4" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
};

const DescriptionResult = ({ data, onApply }) => (
  <div className="space-y-4">
    <div className="rounded-lg bg-white/80 p-4 ring-1 ring-slate-200">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Short description</p>
      <p className="mt-2 text-sm leading-6 text-slate-700">{data.shortDescription}</p>
    </div>
    <div className="rounded-lg bg-white/80 p-4 ring-1 ring-slate-200">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Long description</p>
      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{data.longDescription}</p>
    </div>
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-lg bg-white/80 p-4 ring-1 ring-slate-200">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Bullets</p>
        <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
          {(data.bulletPoints || []).map((item) => (
            <li key={item}>- {item}</li>
          ))}
        </ul>
      </div>
      <div className="rounded-lg bg-white/80 p-4 ring-1 ring-slate-200">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Keywords</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(data.primaryKeywords || []).map((keyword) => (
            <span key={keyword} className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
              {keyword}
            </span>
          ))}
        </div>
      </div>
    </div>
    <button
      type="button"
      onClick={() => onApply('description', data.longDescription || data.shortDescription || '')}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
    >
      <Wand2 className="h-4 w-4" />
      Use description
    </button>
  </div>
);

const TagsResult = ({ data, onApply }) => (
  <div className="space-y-4">
    <div className="rounded-lg bg-white/80 p-4 ring-1 ring-slate-200">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Recommended tags</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {(data.tags || []).map((tag) => (
          <span key={tag} className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            {tag}
          </span>
        ))}
      </div>
    </div>
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-lg bg-white/80 p-4 ring-1 ring-slate-200">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">SEO keywords</p>
        <p className="mt-2 text-sm leading-6 text-slate-700">{joinList(data.seoKeywords)}</p>
      </div>
      <div className="rounded-lg bg-white/80 p-4 ring-1 ring-slate-200">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Long-tail keywords</p>
        <p className="mt-2 text-sm leading-6 text-slate-700">{joinList(data.longTailKeywords)}</p>
      </div>
    </div>
    <button
      type="button"
      onClick={() => onApply('tags', joinList(data.tags))}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
    >
      <Wand2 className="h-4 w-4" />
      Use tags
    </button>
  </div>
);

const CaptionsResult = ({ data }) => (
  <div className="space-y-4">
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-lg bg-white/80 p-4 ring-1 ring-slate-200">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Short caption</p>
        <p className="mt-2 text-sm leading-6 text-slate-700">{data.shortCaption}</p>
      </div>
      <div className="rounded-lg bg-white/80 p-4 ring-1 ring-slate-200">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Ad caption</p>
        <p className="mt-2 text-sm leading-6 text-slate-700">{data.adCaption}</p>
      </div>
    </div>
    <div className="space-y-3">
      {(data.captions || []).map((caption) => (
        <div key={`${caption.channel}-${caption.angle}`} className="rounded-lg bg-white/80 p-4 ring-1 ring-slate-200">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700">
              {caption.channel}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{caption.angle}</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-700">{caption.caption}</p>
          <p className="mt-2 text-sm font-semibold text-slate-950">{caption.callToAction}</p>
          <p className="mt-2 text-xs text-slate-500">{joinList(caption.hashtags)}</p>
        </div>
      ))}
    </div>
  </div>
);

const LoadingResult = () => (
  <div className="space-y-3">
    <div className="h-24 animate-pulse rounded-lg bg-white/70 ring-1 ring-slate-200" />
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="h-24 animate-pulse rounded-lg bg-white/70 ring-1 ring-slate-200" />
      <div className="h-24 animate-pulse rounded-lg bg-white/70 ring-1 ring-slate-200" />
    </div>
  </div>
);

const AIGeneratorPanel = ({ productDraft, onApply, onToast }) => {
  const [activeTool, setActiveTool] = useState('description');
  const [results, setResults] = useState({});
  const [loadingTool, setLoadingTool] = useState(null);
  const [error, setError] = useState('');

  const selectedTool = tools.find((tool) => tool.id === activeTool);
  const activeResult = results[activeTool];

  const aiPayload = useMemo(
    () => ({
      title: productDraft.title,
      category: productDraft.category,
      features: productDraft.features,
      price: productDraft.price,
    }),
    [productDraft]
  );

  const canGenerate =
    aiPayload.title.trim() &&
    aiPayload.category.trim() &&
    Number(aiPayload.price) >= 0 &&
    aiPayload.features.length > 0;

  const handleGenerate = async (tool = selectedTool) => {
    if (!canGenerate) {
      setError('Add a title, category, price, and at least one feature before generating.');
      return;
    }

    setError('');
    setLoadingTool(tool.id);
    setActiveTool(tool.id);

    try {
      const response = await tool.action(aiPayload);
      setResults((current) => ({ ...current, [tool.id]: response.data }));
      onToast?.({ type: 'success', title: 'AI content generated', message: `${tool.shortLabel} is ready to review.` });
    } catch (requestError) {
      const message = requestError.response?.data?.message || 'AI generation failed. Please try again.';
      setError(message);
      onToast?.({ type: 'error', title: 'AI generation failed', message });
    } finally {
      setLoadingTool(null);
    }
  };

  const copyValue = buildCopyText(activeTool, activeResult);

  return (
    <section className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-primary">
            <Sparkles className="h-4 w-4" />
            AI generation studio
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Generate polished copy from your product basics, then apply the best output to the form.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            const isLoading = loadingTool === tool.id;

            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => (results[tool.id] ? setActiveTool(tool.id) : handleGenerate(tool))}
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${
                  isActive
                    ? 'bg-slate-950 text-white shadow-sm'
                    : 'border border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50'
                }`}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
                {tool.label}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-950">{selectedTool.shortLabel}</p>
            <p className="text-xs text-slate-500">
              {activeResult ? 'Review, copy, regenerate, or apply this result.' : 'Generate content to preview it here.'}
            </p>
          </div>
          <div className="flex gap-2">
            <CopyButton value={copyValue} onToast={onToast} />
            <button
              type="button"
              onClick={() => handleGenerate(selectedTool)}
              disabled={loadingTool === activeTool}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loadingTool === activeTool ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {activeResult ? 'Regenerate' : 'Generate'}
            </button>
          </div>
        </div>

        {loadingTool === activeTool && <LoadingResult />}
        {loadingTool !== activeTool && !activeResult && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white/70 px-4 py-8 text-center">
            <Sparkles className="mx-auto h-7 w-7 text-primary" />
            <p className="mt-3 text-sm font-semibold text-slate-900">Your generated content will appear here.</p>
          </div>
        )}
        {loadingTool !== activeTool && activeTool === 'description' && activeResult && (
          <DescriptionResult data={activeResult} onApply={onApply} />
        )}
        {loadingTool !== activeTool && activeTool === 'tags' && activeResult && (
          <TagsResult data={activeResult} onApply={onApply} />
        )}
        {loadingTool !== activeTool && activeTool === 'captions' && activeResult && (
          <CaptionsResult data={activeResult} />
        )}
      </div>
    </section>
  );
};

export default AIGeneratorPanel;
