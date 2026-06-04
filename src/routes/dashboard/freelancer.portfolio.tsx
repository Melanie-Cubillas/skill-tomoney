import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Edit3, Eye, ExternalLink, FileText, Filter, FolderKanban, ImageIcon, LinkIcon, Plus, Save, Search, Star, Trash2 } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { api, type CategoryPayload, type PortfolioProjectPayload } from "@/lib/api";
import { getToken } from "@/lib/auth";

export const Route = createFileRoute("/dashboard/freelancer/portfolio")({
  head: () => ({ meta: [{ title: "Portafolio · SkilltoMoney" }] }),
  component: PortfolioPage,
});

type PortfolioForm = {
  category_id: number | null;
  title: string;
  description: string;
  project_order: number;
  is_featured: boolean;
  external_url: string;
  image: File | null;
  file: File | null;
};

const emptyForm: PortfolioForm = {
  category_id: null,
  title: "",
  description: "",
  project_order: 0,
  is_featured: false,
  external_url: "",
  image: null,
  file: null,
};

function PortfolioPage() {
  const token = getToken();
  const [categories, setCategories] = useState<CategoryPayload[]>([]);
  const [projects, setProjects] = useState<PortfolioProjectPayload[]>([]);
  const [form, setForm] = useState<PortfolioForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!token) return;
    setError(null);

    try {
      const [categoryResponse, portfolioResponse] = await Promise.all([
        api.getCategories(token),
        api.getPortfolioProjects(token),
      ]);
      setCategories(categoryResponse.data ?? []);
      setProjects(portfolioResponse.data ?? []);
    } catch (err: unknown) {
      const payload = err as { message?: string };
      setError(payload?.message ?? "No se pudo cargar el portafolio.");
    }
  };

  useEffect(() => {
    void load();
  }, [token]);

  const filteredProjects = useMemo(
    () => projects.filter((project) => project.title.toLowerCase().includes(search.toLowerCase())),
    [projects, search],
  );

  const featuredCount = projects.filter((project) => project.is_featured).length;

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setMessage(null);
    setError(null);
  };

  const editProject = (project: PortfolioProjectPayload) => {
    setEditingId(project.id);
    setForm({
      category_id: project.category_id,
      title: project.title,
      description: project.description ?? "",
      project_order: project.project_order,
      is_featured: project.is_featured,
      external_url: project.external_url ?? "",
      image: null,
      file: null,
    });
  };

  const toFormData = () => {
    const body = new FormData();
    if (form.category_id) body.append("category_id", String(form.category_id));
    body.append("title", form.title);
    body.append("description", form.description);
    body.append("project_order", String(form.project_order));
    body.append("is_featured", form.is_featured ? "1" : "0");
    body.append("external_url", form.external_url);
    if (form.image) body.append("image", form.image);
    if (form.file) body.append("file", form.file);
    return body;
  };

  const saveProject = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (editingId) {
        await api.updatePortfolioProject(token, editingId, toFormData());
        setMessage("Proyecto actualizado.");
      } else {
        await api.createPortfolioProject(token, toFormData());
        setMessage("Proyecto registrado.");
      }
      resetForm();
      await load();
    } catch (err: unknown) {
      const payload = err as { message?: string; errors?: Record<string, string[]> };
      const firstError = Object.values(payload?.errors ?? {})[0]?.[0];
      setError(firstError ?? payload?.message ?? "No se pudo guardar el proyecto.");
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (project: PortfolioProjectPayload) => {
    if (!token || !window.confirm(`Eliminar "${project.title}"?`)) return;
    setError(null);
    setMessage(null);

    try {
      await api.deletePortfolioProject(token, project.id);
      setMessage("Proyecto eliminado.");
      await load();
    } catch (err: unknown) {
      const payload = err as { message?: string };
      setError(payload?.message ?? "No se pudo eliminar el proyecto.");
    }
  };

  return (
    <DashboardShell role="freelancer">
      <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-extrabold tracking-normal">Portafolio de proyectos</h1>
            <p className="mt-1 text-muted-foreground">Crea, edita y organiza los proyectos que muestras en tu portafolio profesional.</p>
          </div>
          <div className="flex gap-3">
            <Button className="rounded-xl bg-gradient-primary shadow-soft" onClick={resetForm}><Plus className="h-4 w-4" /> Nuevo proyecto</Button>
            <Button variant="outline" className="rounded-xl"><Filter className="h-4 w-4" /> Filtros</Button>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <Metric icon={FolderKanban} label="Proyectos publicados" value={String(projects.length)} hint="+3 vs el mes pasado" />
          <Metric icon={Star} label="Proyectos destacados" value={String(featuredCount)} hint="+1 vs el mes pasado" />
          <Metric icon={Eye} label="Visitas al portafolio" value="1,284" hint="+18% vs el mes pasado" />
        </div>

        {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p> : null}
        {message ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{message}</p> : null}

        <Card className="rounded-2xl p-4 shadow-soft">
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold tracking-normal">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-secondary/15 text-secondary"><Edit3 className="h-4 w-4" /></span>
            Registrar / editar proyecto
          </h2>
          <form onSubmit={saveProject} className="rounded-2xl border border-border p-4">
            <div className="grid gap-5 xl:grid-cols-4">
              <Field label="Categoria">
                <Select value={form.category_id ? String(form.category_id) : ""} onValueChange={(value) => setForm((prev) => ({ ...prev, category_id: Number(value) }))}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Selecciona una categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Titulo del proyecto">
                <Input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} placeholder="Landing page moderna" className="h-11 rounded-xl" required />
              </Field>
              <Field label="Orden del proyecto">
                <Input type="number" min={0} value={form.project_order} onChange={(event) => setForm((prev) => ({ ...prev, project_order: Number(event.target.value) }))} className="h-11 rounded-xl" required />
              </Field>
              <div className="space-y-2">
                <Label>Proyecto destacado</Label>
                <div className="flex h-11 items-center gap-3 rounded-xl border border-input px-3">
                  <Switch checked={form.is_featured} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, is_featured: checked }))} />
                  <span className="text-sm text-muted-foreground">Si, mostrar como destacado</span>
                </div>
              </div>
              <Field label="Descripcion del proyecto">
                <Textarea value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} placeholder="Describe el proyecto..." className="min-h-28 resize-none rounded-xl" />
              </Field>
              <FileField icon={ImageIcon} label="Imagen del proyecto" file={form.image} accept="image/*" onChange={(file) => setForm((prev) => ({ ...prev, image: file }))} />
              <FileField icon={FileText} label="Archivo adjunto" file={form.file} onChange={(file) => setForm((prev) => ({ ...prev, file }))} />
              <Field label="Link externo">
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={form.external_url} onChange={(event) => setForm((prev) => ({ ...prev, external_url: event.target.value }))} placeholder="https://landingpage.dev" className="h-11 rounded-xl pl-9" />
                </div>
              </Field>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={resetForm} className="rounded-xl">Limpiar</Button>
              <Button type="submit" disabled={loading} className="rounded-xl bg-gradient-primary shadow-soft"><Save className="h-4 w-4" /> {editingId ? "Actualizar proyecto" : "Guardar proyecto"}</Button>
            </div>
          </form>
        </Card>

        <Card className="overflow-hidden rounded-2xl p-0 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
            <h2 className="flex items-center gap-2 font-display text-xl font-bold tracking-normal">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-secondary/15 text-secondary"><FolderKanban className="h-4 w-4" /></span>
              Lista de proyectos
            </h2>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar proyecto..." className="rounded-xl pl-9" />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Vista previa</TableHead>
                <TableHead>Titulo del proyecto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Destacado</TableHead>
                <TableHead>Orden</TableHead>
                <TableHead>Link externo</TableHead>
                <TableHead>Fecha de creacion</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project, index) => (
                <TableRow key={project.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    {project.image_url ? (
                      <img src={project.image_url} alt={project.title} className="h-12 w-20 rounded-lg object-cover" />
                    ) : (
                      <div className="grid h-12 w-20 place-items-center rounded-lg bg-muted text-muted-foreground"><ImageIcon className="h-5 w-5" /></div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-bold">{project.title}</div>
                    <div className="max-w-sm truncate text-xs text-muted-foreground">{project.description}</div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="border-transparent bg-primary/10 text-primary shadow-none">{project.category ?? "Sin categoria"}</Badge></TableCell>
                  <TableCell>{project.is_featured ? <Star className="h-5 w-5 fill-secondary text-secondary" /> : <Star className="h-5 w-5 text-muted-foreground" />}</TableCell>
                  <TableCell>{project.project_order}</TableCell>
                  <TableCell>
                    {project.external_url ? <a href={project.external_url} target="_blank" rel="noreferrer" className="inline-grid h-8 w-8 place-items-center rounded-lg bg-secondary/15 text-secondary"><ExternalLink className="h-4 w-4" /></a> : "—"}
                  </TableCell>
                  <TableCell>{project.created_at ? new Date(project.created_at).toLocaleDateString("es-PE") : "—"}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button type="button" size="icon" variant="outline" onClick={() => editProject(project)}><Edit3 className="h-4 w-4" /></Button>
                      <Button type="button" size="icon" variant="outline" className="text-primary" onClick={() => deleteProject(project)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">No hay proyectos registrados.</TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
          <div className="border-t border-border px-5 py-4 text-sm text-muted-foreground">
            Mostrando {filteredProjects.length} de {projects.length} proyectos
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}

function Metric({ icon: Icon, label, value, hint }: { icon: LucideIcon; label: string; value: string; hint: string }) {
  return (
    <Card className="rounded-2xl p-5 shadow-soft">
      <div className="flex items-center gap-5">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-secondary/15 text-secondary">
          <Icon className="h-7 w-7" />
        </span>
        <div>
          <div className="text-sm font-semibold text-muted-foreground">{label}</div>
          <div className="font-display text-3xl font-extrabold tracking-normal">{value}</div>
          <div className="mt-1 text-xs font-bold text-success">{hint}</div>
        </div>
      </div>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function FileField({ icon: Icon, label, file, accept, onChange }: { icon: LucideIcon; label: string; file: File | null; accept?: string; onChange: (file: File | null) => void }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <label className="flex h-16 cursor-pointer items-center gap-3 rounded-xl border border-input px-3 text-sm text-muted-foreground">
        <Icon className="h-5 w-5 text-primary" />
        <span className="min-w-0 flex-1 truncate">{file ? file.name : "Seleccionar archivo"}</span>
        <input type="file" accept={accept} className="hidden" onChange={(event) => onChange(event.target.files?.[0] ?? null)} />
      </label>
    </div>
  );
}
