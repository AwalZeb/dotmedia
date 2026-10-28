import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight,
  Download,
  LogOut,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import type {
  AdminSession,
  Client,
  Enquiry,
  HealthcareCaseStudy,
  Testimonial,
  WorkItem,
} from '@workspace/api-client-react';
import { site } from '@/config/site';
import { apiRequest } from '@/lib/api';

type AdminTab = 'enquiries' | 'portfolio' | 'clients' | 'case-study' | 'testimonials';
type WorkForm = {
  title: string;
  clientName: string;
  category: string;
  description: string;
  mediaUrl: string;
  mediaType: NonNullable<WorkItem['mediaType']>;
  displayOrder: number;
  featured: boolean;
  published: boolean;
};

const tabs: { id: AdminTab; label: string }[] = [
  { id: 'enquiries', label: 'Enquiries' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'clients', label: 'Clients strip' },
  { id: 'case-study', label: 'Case study' },
  { id: 'testimonials', label: 'Testimonials' },
];

function ErrorText({ children }: { children?: React.ReactNode }) {
  return children ? <p className="mt-3 text-sm text-red-300" role="alert">{children}</p> : null;
}

function PanelHeading({ title, description }: { title: string; description: string }) {
  return <div className="mb-7"><h2 className="font-display text-2xl font-semibold text-white">{title}</h2><p className="mt-2 text-sm text-[#929292]">{description}</p></div>;
}

function EnquiriesPanel() {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ['admin-enquiries'],
    queryFn: () => apiRequest<Enquiry[]>('/admin/enquiries'),
  });
  const update = useMutation({
    mutationFn: ({ id, status }: { id: number; status: Enquiry['status'] }) =>
      apiRequest<Enquiry>(`/admin/enquiries?id=${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => client.invalidateQueries({ queryKey: ['admin-enquiries'] }),
  });

  const exportCsv = () => {
    const rows = [
      ['Date', 'Name', 'Phone', 'Email', 'Business or practice', 'Business type', 'Services', 'Message', 'Status'],
      ...(query.data ?? []).map((item) => [
        item.createdAt,
        item.fullName,
        item.phone,
        item.email ?? '',
        item.businessName,
        item.businessType,
        item.services.join('; '),
        item.message,
        item.status,
      ]),
    ];
    const csv = rows
      .map((row) => row.map((value) => {
        const text = String(value);
        const spreadsheetSafe = /^[=+\-@]/.test(text) ? `'${text}` : text;
        return `"${spreadsheetSafe.replaceAll('"', '""')}"`;
      }).join(','))
      .join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'dot-media-enquiries.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return <section>
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <PanelHeading title="Enquiries" description="Review new enquiries, contact people, and track follow-up status." />
      <button onClick={exportCsv} disabled={!query.data?.length} className="btn btn-outline min-h-10 px-4 text-xs disabled:opacity-40"><Download size={14} />Export CSV</button>
    </div>
    {query.isLoading ? <p className="text-sm text-[#999]">Loading enquiries…</p> : null}
    {query.isError ? <ErrorText>{query.error.message}</ErrorText> : null}
    {!query.isLoading && !query.isError && !query.data?.length ? <div className="rounded-xl border border-dashed border-[#393939] p-8 text-center text-sm text-[#999]">No enquiries yet.</div> : null}
    <div className="grid gap-3">
      {query.data?.map((item) => {
        const digits = item.phone.replace(/\D/g, '');
        const whatsapp = `${site.whatsappBaseUrl}${digits}?text=${encodeURIComponent(`Hi ${item.fullName}, thanks for contacting Dot Media.`)}`;
        return <article key={item.id} className="rounded-xl border border-[#2a2a2a] bg-[#111] p-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-3"><h3 className="font-display text-lg font-semibold text-white">{item.fullName}</h3><span className="rounded-full bg-[#242424] px-2.5 py-1 text-[10px] uppercase text-[#bdbdbd]">{item.businessType || 'Business type not specified'}</span></div>
              <p className="mt-2 text-xs text-[#888]">{new Date(item.createdAt).toLocaleString()}</p>
            </div>
            <select className="field min-h-10 w-auto py-2 text-xs" aria-label={`Status for ${item.fullName}`} value={item.status} onChange={(event) => update.mutate({ id: item.id, status: event.target.value as Enquiry['status'] })}>
              <option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option>
            </select>
          </div>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#bbb]">
            <a href={`tel:${item.phone}`} className="hover:text-white">{item.phone}</a>
            {item.email ? <a href={`mailto:${item.email}`} className="hover:text-white">{item.email}</a> : <span>No email provided</span>}
          </div>
          {item.businessName ? <p className="mt-3 text-xs text-[#999]"><span className="text-[#ddd]">Business:</span> {item.businessName}</p> : null}
          <p className="mt-4 text-xs text-[#999]"><span className="text-[#ddd]">Services:</span> {item.services.length ? item.services.join(', ') : 'Not specified'}</p>
          {item.message ? <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#c7c7c7]">{item.message}</p> : null}
          <div className="mt-5 flex gap-2"><a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-outline min-h-9 px-3 text-[11px]">Open WhatsApp</a>{item.email ? <a href={`mailto:${item.email}`} className="btn btn-outline min-h-9 px-3 text-[11px]">Send email</a> : null}</div>
        </article>;
      })}
    </div>
    <ErrorText>{update.isError ? update.error.message : undefined}</ErrorText>
  </section>;
}

const emptyWorkForm: WorkForm = {
  title: '',
  clientName: '',
  category: 'Healthcare',
  description: '',
  mediaUrl: '',
  mediaType: 'image',
  displayOrder: 0,
  featured: false,
  published: false,
};

function PortfolioPanel() {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ['admin-work'],
    queryFn: () => apiRequest<WorkItem[]>('/admin/work'),
  });
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<WorkItem | null>(null);
  const [form, setForm] = useState<WorkForm>(emptyWorkForm);
  const [error, setError] = useState('');
  const save = useMutation({
    mutationFn: () => {
      const data = {
        ...form,
        title: form.title.trim(),
        clientName: form.clientName.trim(),
        category: form.category.trim(),
        description: form.description.trim(),
        imageUrl: null,
        mediaUrl: form.mediaUrl.trim() || null,
      };
      return apiRequest<WorkItem>(editing ? `/admin/work/${editing.id}` : '/admin/work', {
        method: editing ? 'PATCH' : 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      setFormOpen(false);
      setEditing(null);
      setError('');
      void client.invalidateQueries({ queryKey: ['admin-work'] });
      void client.invalidateQueries({ queryKey: ['public-work'] });
    },
    onError: (failure) => setError(failure.message),
  });
  const remove = useMutation({
    mutationFn: (id: number) => apiRequest<void>(`/admin/work/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['admin-work'] });
      void client.invalidateQueries({ queryKey: ['public-work'] });
    },
  });
  const togglePublished = useMutation({
    mutationFn: (item: WorkItem) => apiRequest<WorkItem>(`/admin/work/${item.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ published: !item.published }),
    }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['admin-work'] });
      void client.invalidateQueries({ queryKey: ['public-work'] });
    },
  });

  const startCreate = () => {
    setEditing(null);
    setForm(emptyWorkForm);
    setError('');
    setFormOpen(true);
  };
  const startEdit = (item: WorkItem) => {
    setEditing(item);
    setForm({
      title: item.title,
      clientName: item.clientName,
      category: item.category,
      description: item.description,
      mediaUrl: item.mediaUrl ?? item.imageUrl ?? '',
      mediaType: item.mediaType ?? 'image',
      displayOrder: item.displayOrder,
      featured: item.featured,
      published: item.published,
    });
    setError('');
    setFormOpen(true);
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.title.trim() || !form.clientName.trim() || !form.category.trim()) {
      setError('Add a project title, client name, and category.');
      return;
    }
    save.mutate();
  };

  return <section>
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <PanelHeading title="Portfolio" description="Add approved projects, media links, and homepage features." />
      <button onClick={startCreate} className="btn btn-primary min-h-10 px-4 text-xs"><Plus size={14} />Add project</button>
    </div>
    {query.isLoading ? <p className="text-sm text-[#999]">Loading portfolio…</p> : null}
    {query.isError ? <ErrorText>{query.error.message}</ErrorText> : null}
    {!query.isLoading && !query.isError && !query.data?.length ? <p className="rounded-xl border border-dashed border-[#393939] p-7 text-sm text-[#999]">No projects yet.</p> : null}
    <div className="grid gap-3">
      {query.data?.map((item) => <article key={item.id} className="flex flex-col justify-between gap-4 rounded-xl border border-[#2a2a2a] bg-[#111] p-4 sm:flex-row sm:items-center">
        <div><h3 className="font-display font-semibold text-white">{item.title}</h3><p className="mt-1 text-xs text-[#888]">{item.clientName} · {item.category} · Order {item.displayOrder}</p><p className="mt-2 text-xs text-[#999]">{item.published ? 'Published' : 'Draft'}{item.featured ? ' · Featured on home' : ''}</p></div>
        <div className="flex flex-wrap gap-2"><button onClick={() => togglePublished.mutate(item)} className="btn btn-outline min-h-9 px-3 text-[11px]">{item.published ? 'Unpublish' : 'Publish'}</button><button onClick={() => startEdit(item)} className="btn btn-outline min-h-9 px-3 text-[11px]">Edit</button><button onClick={() => { if (window.confirm(`Delete "${item.title}"?`)) remove.mutate(item.id); }} aria-label={`Delete ${item.title}`} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#333] text-[#aaa] hover:border-red-700 hover:text-red-300"><Trash2 size={14} /></button></div>
      </article>)}
    </div>
    <ErrorText>{remove.isError ? remove.error.message : togglePublished.isError ? togglePublished.error.message : undefined}</ErrorText>
    {formOpen ? <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setFormOpen(false); }}>
      <form onSubmit={submit} className="my-8 grid w-full max-w-2xl gap-4 rounded-2xl border border-[#333] bg-[#111] p-6 md:grid-cols-2 md:p-8">
        <div className="md:col-span-2"><h2 className="font-display text-xl font-semibold text-white">{editing ? 'Edit project' : 'Add a project'}</h2><p className="mt-2 text-xs leading-5 text-[#888]">Use an approved public image, video, or social-post URL. Do not add unverified results.</p></div>
        <label className="text-xs text-[#bbb]">Project title<input className="field mt-2" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required /></label>
        <label className="text-xs text-[#bbb]">Client name<input className="field mt-2" value={form.clientName} onChange={(event) => setForm({ ...form, clientName: event.target.value })} required /></label>
        <label className="text-xs text-[#bbb]">Category<input className="field mt-2" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} required /></label>
        <label className="text-xs text-[#bbb]">Media type<select className="field mt-2" value={form.mediaType} onChange={(event) => setForm({ ...form, mediaType: event.target.value as WorkForm['mediaType'] })}><option value="image">Image</option><option value="video">Video</option><option value="external">External post</option></select></label>
        <label className="text-xs text-[#bbb] md:col-span-2">Image, video, or social-post URL<input className="field mt-2" type="url" value={form.mediaUrl} onChange={(event) => setForm({ ...form, mediaUrl: event.target.value })} placeholder="https://…" /></label>
        <label className="text-xs text-[#bbb] md:col-span-2">Description<textarea className="field mt-2 min-h-24" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
        <label className="text-xs text-[#bbb]">Display order<input className="field mt-2" type="number" min="0" value={form.displayOrder} onChange={(event) => setForm({ ...form, displayOrder: Number(event.target.value) })} /></label>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-xs text-[#bbb]"><input type="checkbox" checked={form.featured} onChange={(event) => setForm({ ...form, featured: event.target.checked })} className="accent-[#e10e1a]" />Feature on home</label>
          <label className="flex items-center gap-2 text-xs text-[#bbb]"><input type="checkbox" checked={form.published} onChange={(event) => setForm({ ...form, published: event.target.checked })} className="accent-[#e10e1a]" />Publish now</label>
        </div>
        <ErrorText>{error}</ErrorText>
        <div className="flex justify-end gap-3 pt-2 md:col-span-2"><button type="button" onClick={() => setFormOpen(false)} className="btn btn-outline">Cancel</button><button type="submit" disabled={save.isPending} className="btn btn-primary disabled:opacity-50"><Save size={14} />{save.isPending ? 'Saving…' : 'Save project'}</button></div>
      </form>
    </div> : null}
  </section>;
}

function ClientRow({ item, onChange, onDelete }: { item: Client; onChange: (id: number, data: Partial<Client>) => void; onDelete: (id: number) => void }) {
  const [name, setName] = useState(item.name);
  const [logoUrl, setLogoUrl] = useState(item.logoUrl ?? '');
  const [displayOrder, setDisplayOrder] = useState(item.displayOrder);
  useEffect(() => { setName(item.name); setLogoUrl(item.logoUrl ?? ''); setDisplayOrder(item.displayOrder); }, [item]);
  return <div className="grid gap-3 rounded-xl border border-[#2a2a2a] bg-[#111] p-4 sm:grid-cols-[1fr_1.2fr_100px_auto] sm:items-center">
    <input className="field py-3 text-xs" aria-label="Client name" value={name} onChange={(event) => setName(event.target.value)} />
    <input className="field py-3 text-xs" aria-label="Client logo URL" type="url" placeholder="Optional logo URL" value={logoUrl} onChange={(event) => setLogoUrl(event.target.value)} />
    <input className="field py-3 text-xs" aria-label="Display order" type="number" min="0" value={displayOrder} onChange={(event) => setDisplayOrder(Number(event.target.value))} />
    <div className="flex gap-2"><button onClick={() => onChange(item.id, { name, logoUrl: logoUrl || null, displayOrder })} aria-label={`Save ${item.name}`} className="btn btn-outline min-h-9 px-3 text-[11px]"><Save size={13} /></button><button onClick={() => onDelete(item.id)} aria-label={`Delete ${item.name}`} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#333] text-[#aaa] hover:text-red-300"><Trash2 size={14} /></button></div>
  </div>;
}

function ClientsPanel() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ['admin-clients'], queryFn: () => apiRequest<Client[]>('/admin/clients') });
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const create = useMutation({
    mutationFn: () => apiRequest<Client>('/admin/clients', { method: 'POST', body: JSON.stringify({ name: name.trim(), logoUrl: logoUrl.trim() || null, displayOrder: query.data?.length ?? 0 }) }),
    onSuccess: () => { setName(''); setLogoUrl(''); void client.invalidateQueries({ queryKey: ['admin-clients'] }); void client.invalidateQueries({ queryKey: ['clients'] }); },
  });
  const update = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Client> }) => apiRequest<Client>(`/admin/clients/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => { void client.invalidateQueries({ queryKey: ['admin-clients'] }); void client.invalidateQueries({ queryKey: ['clients'] }); },
  });
  const remove = useMutation({
    mutationFn: (id: number) => apiRequest<void>(`/admin/clients/${id}`, { method: 'DELETE' }),
    onSuccess: () => { void client.invalidateQueries({ queryKey: ['admin-clients'] }); void client.invalidateQueries({ queryKey: ['clients'] }); },
  });
  return <section>
    <PanelHeading title="Clients strip" description="Manage the names and optional logo links shown on the home page." />
    <form onSubmit={(event) => { event.preventDefault(); create.mutate(); }} className="mb-6 grid gap-3 rounded-xl border border-[#2a2a2a] bg-[#111] p-4 sm:grid-cols-[1fr_1.2fr_auto]">
      <input className="field py-3 text-xs" placeholder="Client or business name" value={name} onChange={(event) => setName(event.target.value)} required />
      <input className="field py-3 text-xs" type="url" placeholder="Optional logo URL" value={logoUrl} onChange={(event) => setLogoUrl(event.target.value)} />
      <button className="btn btn-primary min-h-10 px-4 text-xs" disabled={create.isPending}><Plus size={14} />Add client</button>
    </form>
    <ErrorText>{query.isError ? query.error.message : create.isError ? create.error.message : update.isError ? update.error.message : remove.isError ? remove.error.message : undefined}</ErrorText>
    <div className="grid gap-3">{query.data?.map((item) => <ClientRow key={item.id} item={item} onChange={(id, data) => update.mutate({ id, data })} onDelete={(id) => { if (window.confirm('Remove this client from the strip?')) remove.mutate(id); }} />)}</div>
  </section>;
}

function TestimonialRow({ item, onSave, onDelete }: { item: Testimonial; onSave: (data: Partial<Testimonial>) => void; onDelete: () => void }) {
  const [name, setName] = useState(item.name);
  const [role, setRole] = useState(item.role);
  const [quote, setQuote] = useState(item.quote);
  const [imageUrl, setImageUrl] = useState(item.imageUrl ?? '');
  const [published, setPublished] = useState(item.published);
  const [displayOrder, setDisplayOrder] = useState(item.displayOrder);
  useEffect(() => {
    setName(item.name); setRole(item.role); setQuote(item.quote); setImageUrl(item.imageUrl ?? '');
    setPublished(item.published); setDisplayOrder(item.displayOrder);
  }, [item]);
  return <article className="grid gap-3 rounded-xl border border-[#2a2a2a] bg-[#111] p-4">
    <div className="grid gap-3 sm:grid-cols-2"><input className="field py-3 text-xs" aria-label="Client name" value={name} onChange={(event) => setName(event.target.value)} /><input className="field py-3 text-xs" aria-label="Client role" value={role} onChange={(event) => setRole(event.target.value)} /></div>
    <textarea className="field min-h-20 text-xs" aria-label="Testimonial" value={quote} onChange={(event) => setQuote(event.target.value)} />
    <div className="grid gap-3 sm:grid-cols-[1fr_110px_auto]"><input className="field py-3 text-xs" type="url" aria-label="Optional photo URL" placeholder="Optional photo URL" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} /><input className="field py-3 text-xs" aria-label="Display order" type="number" min="0" value={displayOrder} onChange={(event) => setDisplayOrder(Number(event.target.value))} /><label className="flex items-center gap-2 text-xs text-[#bbb]"><input type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)} className="accent-[#e10e1a]" />Publish</label></div>
    <div className="flex justify-end gap-2"><button onClick={() => onSave({ name, role, quote, imageUrl: imageUrl || null, published, displayOrder })} className="btn btn-outline min-h-9 px-3 text-[11px]"><Save size={13} />Save</button><button onClick={onDelete} aria-label={`Delete testimonial by ${item.name}`} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#333] text-[#aaa] hover:text-red-300"><Trash2 size={14} /></button></div>
  </article>;
}

function TestimonialsPanel() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ['admin-testimonials'], queryFn: () => apiRequest<Testimonial[]>('/admin/testimonials') });
  const [form, setForm] = useState({ name: '', role: '', quote: '', imageUrl: '', published: false });
  const create = useMutation({
    mutationFn: () => apiRequest<Testimonial>('/admin/testimonials', { method: 'POST', body: JSON.stringify({ ...form, imageUrl: form.imageUrl.trim() || null, displayOrder: query.data?.length ?? 0 }) }),
    onSuccess: () => { setForm({ name: '', role: '', quote: '', imageUrl: '', published: false }); void client.invalidateQueries({ queryKey: ['admin-testimonials'] }); void client.invalidateQueries({ queryKey: ['testimonials'] }); },
  });
  const update = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Testimonial> }) => apiRequest<Testimonial>(`/admin/testimonials/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => { void client.invalidateQueries({ queryKey: ['admin-testimonials'] }); void client.invalidateQueries({ queryKey: ['testimonials'] }); },
  });
  const remove = useMutation({
    mutationFn: (id: number) => apiRequest<void>(`/admin/testimonials/${id}`, { method: 'DELETE' }),
    onSuccess: () => { void client.invalidateQueries({ queryKey: ['admin-testimonials'] }); void client.invalidateQueries({ queryKey: ['testimonials'] }); },
  });
  return <section>
    <PanelHeading title="Testimonials" description="Add only real, approved client feedback. Unpublished items stay off the website." />
    <form onSubmit={(event) => { event.preventDefault(); create.mutate(); }} className="mb-6 grid gap-3 rounded-xl border border-[#2a2a2a] bg-[#111] p-4">
      <div className="grid gap-3 sm:grid-cols-2"><input className="field text-xs" placeholder="Client name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /><input className="field text-xs" placeholder="Role or business" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} required /></div>
      <textarea className="field min-h-20 text-xs" placeholder="Approved testimonial" value={form.quote} onChange={(event) => setForm({ ...form, quote: event.target.value })} required />
      <div className="flex flex-wrap items-center gap-3"><input className="field min-w-0 flex-1 text-xs" type="url" placeholder="Optional photo URL" value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} /><label className="flex items-center gap-2 text-xs text-[#bbb]"><input type="checkbox" checked={form.published} onChange={(event) => setForm({ ...form, published: event.target.checked })} className="accent-[#e10e1a]" />Publish</label><button className="btn btn-primary min-h-10 px-4 text-xs" disabled={create.isPending}><Plus size={14} />Add</button></div>
    </form>
    <ErrorText>{query.isError ? query.error.message : create.isError ? create.error.message : update.isError ? update.error.message : remove.isError ? remove.error.message : undefined}</ErrorText>
    <div className="grid gap-3">{query.data?.map((item) => <TestimonialRow key={item.id} item={item} onSave={(data) => update.mutate({ id: item.id, data })} onDelete={() => { if (window.confirm(`Delete testimonial from ${item.name}?`)) remove.mutate(item.id); }} />)}</div>
  </section>;
}

function CaseStudyPanel() {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ['admin-case-study'],
    queryFn: () => apiRequest<HealthcareCaseStudy>('/admin/case-study/healthcare'),
  });
  const [form, setForm] = useState({ clientName: '', description: '', category: '' });
  useEffect(() => {
    if (query.data) setForm({ clientName: query.data.clientName, description: query.data.description, category: query.data.category });
  }, [query.data]);
  const update = useMutation({
    mutationFn: () => apiRequest<HealthcareCaseStudy>('/admin/case-study/healthcare', { method: 'PUT', body: JSON.stringify(form) }),
    onSuccess: () => { void client.invalidateQueries({ queryKey: ['admin-case-study'] }); void client.invalidateQueries({ queryKey: ['public-case-study'] }); },
  });
  return <section>
    <PanelHeading title="Healthcare case study" description="Edit the approved Dr Ghareeb Nawaz summary shown on the healthcare page." />
    {query.isLoading ? <p className="text-sm text-[#999]">Loading case study…</p> : null}
    {query.isError ? <ErrorText>{query.error.message}</ErrorText> : null}
    <form onSubmit={(event) => { event.preventDefault(); update.mutate(); }} className="grid max-w-2xl gap-4 rounded-xl border border-[#2a2a2a] bg-[#111] p-5">
      <label className="text-xs text-[#bbb]">Client name<input className="field mt-2" value={form.clientName} onChange={(event) => setForm({ ...form, clientName: event.target.value })} required /></label>
      <label className="text-xs text-[#bbb]">Category<input className="field mt-2" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} required /></label>
      <label className="text-xs text-[#bbb]">Case study description<textarea className="field mt-2 min-h-32" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required /></label>
      <ErrorText>{update.isError ? update.error.message : undefined}</ErrorText>
      <button className="btn btn-primary w-fit" disabled={update.isPending}><Save size={14} />{update.isPending ? 'Saving…' : 'Save case study'}</button>
    </form>
  </section>;
}

function AdminContent({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<AdminTab>('enquiries');
  return <div className="wrap py-12 md:py-16">
    <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="eyebrow">Dot Media dashboard</p><h1 className="section-title mt-4 text-4xl md:text-[52px]">Admin panel<span className="red-dot">.</span></h1><p className="mt-3 text-sm text-[#999]">Manage enquiries and approved website content.</p></div><button onClick={onLogout} className="btn btn-outline min-h-10 px-4 text-xs"><LogOut size={14} />Sign out</button></div>
    <div className="mb-8 flex gap-2 overflow-x-auto border-b border-[#2b2b2b] pb-3" role="tablist" aria-label="Admin sections">
      {tabs.map((item) => <button key={item.id} role="tab" aria-selected={tab === item.id} onClick={() => setTab(item.id)} className={`shrink-0 rounded-lg px-4 py-2.5 text-xs font-semibold ${tab === item.id ? 'bg-[#e10e1a] text-white' : 'border border-[#303030] text-[#aaa] hover:text-white'}`}>{item.label}</button>)}
    </div>
    {tab === 'enquiries' ? <EnquiriesPanel /> : null}
    {tab === 'portfolio' ? <PortfolioPanel /> : null}
    {tab === 'clients' ? <ClientsPanel /> : null}
    {tab === 'case-study' ? <CaseStudyPanel /> : null}
    {tab === 'testimonials' ? <TestimonialsPanel /> : null}
  </div>;
}

export default function AdminDashboard() {
  const client = useQueryClient();
  const session = useQuery({
    queryKey: ['admin-session'],
    queryFn: () => apiRequest<AdminSession>('/admin/auth/session'),
    retry: false,
    refetchInterval: 120_000,
  });
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const login = useMutation({
    mutationFn: () => apiRequest<AdminSession>('/admin/auth/session', { method: 'POST', body: JSON.stringify({ password }) }),
    onSuccess: (value) => { setPassword(''); setAuthError(''); client.setQueryData(['admin-session'], value); },
    onError: (error) => setAuthError(error.message),
  });
  const logout = useMutation({
    mutationFn: () => apiRequest<AdminSession>('/admin/auth/logout', { method: 'POST' }),
    onSuccess: (value) => {
      client.setQueryData(['admin-session'], value);
      void client.removeQueries({ queryKey: ['admin-enquiries'] });
      void client.removeQueries({ queryKey: ['admin-work'] });
      void client.removeQueries({ queryKey: ['admin-clients'] });
      void client.removeQueries({ queryKey: ['admin-case-study'] });
      void client.removeQueries({ queryKey: ['admin-testimonials'] });
    },
  });

  if (session.isLoading) return <div className="wrap py-24"><div className="h-40 animate-pulse rounded-2xl bg-[#151515]" /></div>;
  if (session.isError) return <div className="wrap py-24"><p className="text-sm text-red-300">Could not check admin access. Refresh the page to try again.</p></div>;
  if (!session.data?.configured) return <div className="wrap py-24"><div className="mx-auto max-w-lg rounded-2xl border border-[#2b2b2b] bg-[#141414] p-8 text-center"><h1 className="font-display text-2xl font-semibold text-white">Admin sign-in is not configured.</h1><p className="mt-3 text-sm leading-6 text-[#999]">Add the ADMIN_PASSWORD secret in Replit to enable the dashboard.</p></div></div>;
  if (!session.data.authenticated) return <div className="wrap py-24"><form onSubmit={(event) => { event.preventDefault(); setAuthError(''); login.mutate(); }} className="mx-auto max-w-md rounded-2xl border border-[#2b2b2b] bg-[#141414] p-8">
    <p className="eyebrow">Restricted area</p><h1 className="font-display mt-4 text-2xl font-semibold text-white">Admin sign in<span className="red-dot">.</span></h1><p className="mt-3 text-sm leading-6 text-[#999]">Enter the Dot Media admin password to manage enquiries and site content.</p>
    <input type="text" name="username" value="dot-media-admin" autoComplete="username" tabIndex={-1} readOnly aria-hidden="true" className="sr-only" />
    <label className="mt-6 block text-xs text-[#bbb]">Admin password<input className="field mt-2" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
    <ErrorText>{authError}</ErrorText><button type="submit" disabled={login.isPending} className="btn btn-primary mt-5 w-full">{login.isPending ? 'Checking…' : 'Sign in'} <ArrowRight size={14} /></button>
  </form></div>;
  return <AdminContent onLogout={() => logout.mutate()} />;
}
