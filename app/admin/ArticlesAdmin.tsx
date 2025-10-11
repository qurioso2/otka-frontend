'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

type Article = {
  id: string;
  slug: string;
  title: string;
  body?: string | null;
  images?: string[];
  published: boolean;
  created_at?: string;
};

export default function ArticlesAdmin() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [published, setPublished] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/articles/list', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Load failed');
      setArticles(json.articles || []);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return articles.filter((a) => {
      return (
        (a.title || '').toLowerCase().includes(term) ||
        (a.slug || '').toLowerCase().includes(term) ||
        (a.body || '').toLowerCase().includes(term)
      );
    });
  }, [articles, search]);

  const resetForm = () => {
    setFormMode('create');
    setEditingId(null);
    setSlug('');
    setTitle('');
    setBody('');
    setImages([]);
    setNewImageUrl('');
    setPublished(false);
    setImageFile(null);
    setShowForm(false);
  };

  const startCreate = () => {
    resetForm();
    setShowForm(true);
    setFormMode('create');
  };

  const startEdit = (article: Article) => {
    setFormMode('edit');
    setEditingId(article.id);
    setSlug(article.slug);
    setTitle(article.title);
    setBody(article.body || '');
    setImages(article.images || []);
    setPublished(article.published);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug || !title) return toast.error('Slug și titlu sunt necesare');

    try {
      setLoading(true);

      // Upload image if provided
      let imageUrls = [...images];
      if (imageFile) {
        const fd = new FormData();
        fd.append('file', imageFile);
        const upRes = await fetch('/api/upload', { method: 'POST', body: fd });
        const upJson = await upRes.json();
        if (!upRes.ok) throw new Error(upJson.error || 'Upload failed');
        imageUrls.push(upJson.url);
      }

      const articleData = {
        slug,
        title,
        body,
        images: imageUrls,
        published,
      };

      if (formMode === 'create') {
        const res = await fetch('/api/admin/articles/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(articleData),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Create failed');
        toast.success('Articol creat');
      } else {
        const res = await fetch('/api/admin/articles/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...articleData }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Update failed');
        toast.success('Articol actualizat');
      }

      resetForm();
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm('Ștergi acest articol?')) return;
    try {
      setLoading(true);
      const res = await fetch('/api/admin/articles/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Delete failed');
      toast.success('Articol șters');
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePublished = async (article: Article) => {
    try {
      const res = await fetch('/api/admin/articles/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: article.id, published: !article.published }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Update failed');
      toast.success('Status actualizat');
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const addImageUrl = () => {
    if (!newImageUrl) return;
    setImages([...images, newImageUrl]);
    setNewImageUrl('');
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6" data-testid="articles-admin">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Articole</h2>
          <p className="text-sm text-neutral-600">Gestionare articole blog / știri</p>
        </div>
        <button
          onClick={startCreate}
          className="rounded-full bg-neutral-900 text-white px-5 py-2 text-sm font-bold hover:bg-neutral-800"
          data-testid="create-article-btn"
        >
          + Articol Nou
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => resetForm()}>
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-neutral-900">
                {formMode === 'create' ? 'Articol Nou' : 'Editează Articol'}
              </h3>
              <button onClick={resetForm} className="text-neutral-600 hover:text-neutral-900">
                Închide
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-800 mb-1">
                    Slug (URL) *
                  </label>
                  <input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full rounded-xl border-2 border-neutral-300 px-3 py-2 focus:border-blue-500"
                    placeholder="exemplu-articol"
                    required
                    disabled={formMode === 'edit'}
                  />
                  <p className="text-xs text-neutral-500 mt-1">Format: doar litere mici, cifre și -</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-800 mb-1">Titlu *</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border-2 border-neutral-300 px-3 py-2 focus:border-blue-500"
                    placeholder="Titlul articolului"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-1">Conținut</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full rounded-xl border-2 border-neutral-300 px-3 py-2 focus:border-blue-500 min-h-[200px]"
                  placeholder="Conținutul articolului..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-1">Imagini</label>
                <div className="space-y-2">
                  {images.map((url, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        value={url}
                        readOnly
                        className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm bg-neutral-50"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Șterge
                      </button>
                    </div>
                  ))}

                  <div className="flex gap-2">
                    <input
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                      placeholder="URL imagine"
                    />
                    <button
                      type="button"
                      onClick={addImageUrl}
                      className="rounded-lg bg-neutral-200 px-4 py-2 text-sm font-medium hover:bg-neutral-300"
                    >
                      Adaugă URL
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-600 mb-1">SAU încarcă imagine:</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      className="w-full text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm font-semibold text-neutral-800">Publicat (vizibil public)</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border-2 border-neutral-300 px-5 py-2 text-sm font-bold hover:bg-neutral-50"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-full bg-neutral-900 text-white px-5 py-2 text-sm font-bold hover:bg-neutral-800 disabled:opacity-50"
                  data-testid="submit-article-btn"
                >
                  {loading ? 'Se salvează...' : formMode === 'create' ? 'Creează' : 'Actualizează'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-neutral-700 mb-1">Caută</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border-2 border-neutral-300 px-3 py-2 focus:border-blue-500"
            placeholder="Titlu, slug sau conținut"
            data-testid="search-articles"
          />
        </div>
        <button
          onClick={load}
          className="rounded-full border-2 border-neutral-300 px-4 py-2 text-sm font-bold hover:bg-neutral-50"
        >
          Reîncarcă
        </button>
      </div>

      {/* Articles List */}
      {loading && !showForm ? (
        <div className="text-center py-8 text-neutral-500">Se încarcă...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-neutral-500">
          <p className="text-lg mb-2">Nu sunt articole</p>
          <button
            onClick={startCreate}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Creează primul articol
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((article) => (
            <div
              key={article.id}
              className="rounded-2xl border-2 border-neutral-200 bg-white p-5 hover:shadow-lg transition-shadow"
              data-testid={`article-item-${article.slug}`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-neutral-900">{article.title}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        article.published
                          ? 'bg-green-100 text-green-800'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {article.published ? 'Publicat' : 'Draft'}
                    </span>
                  </div>
                  <div className="text-sm text-neutral-600 mb-2">
                    <strong>Slug:</strong> <code className="bg-neutral-100 px-2 py-0.5 rounded">{article.slug}</code>
                  </div>
                  {article.body && (
                    <p className="text-sm text-neutral-700 line-clamp-2">{article.body}</p>
                  )}
                  {article.images && article.images.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {article.images.slice(0, 3).map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt=""
                          className="w-16 h-16 object-cover rounded-lg border border-neutral-200"
                        />
                      ))}
                      {article.images.length > 3 && (
                        <div className="w-16 h-16 rounded-lg border border-neutral-200 flex items-center justify-center bg-neutral-50 text-xs text-neutral-600">
                          +{article.images.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                  {article.created_at && (
                    <div className="text-xs text-neutral-500 mt-2">
                      Creat: {new Date(article.created_at).toLocaleDateString('ro-RO')}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => togglePublished(article)}
                    className={`rounded-lg px-4 py-2 text-sm font-bold ${
                      article.published
                        ? 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                    data-testid={`toggle-published-${article.slug}`}
                  >
                    {article.published ? 'Ascunde' : 'Publică'}
                  </button>
                  <button
                    onClick={() => startEdit(article)}
                    className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-bold hover:bg-blue-700"
                    data-testid={`edit-article-${article.slug}`}
                  >
                    Editează
                  </button>
                  <button
                    onClick={() => del(article.id)}
                    className="rounded-lg bg-red-600 text-white px-4 py-2 text-sm font-bold hover:bg-red-700"
                    data-testid={`delete-article-${article.slug}`}
                  >
                    Șterge
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
