import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { CheckCircle2, Edit3, Eye, Package, Save, Search, Trash2 } from "lucide-react";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { api, type CategoryPayload, type ServiceInput, type ServicePayload } from "@/lib/api";
import { getToken } from "@/lib/auth";

export const Route = createFileRoute("/dashboard/freelancer/services")({
  head: () => ({ meta: [{ title: "Servicios · SkilltoMoney" }] }),
  component: ServicesPage,
});

const emptyForm: ServiceInput = {
  category_id: null,
  title: "",
  description: "",
  price: "",
  currency: "PEN",
  delivery_days: 1,
  status: "active",
};

function ServicesPage() {
  const token = getToken();
  const [categories, setCategories] = useState<CategoryPayload[]>([]);
  const [services, setServices] = useState<ServicePayload[]>([]);
  const [form, setForm] = useState<ServiceInput>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!token) return;
    setError(null);

    try {
      const [categoryResponse, serviceResponse] = await Promise.all([
        api.getCategories(token),
        api.getServices(token),
      ]);
      setCategories(categoryResponse.data ?? []);
      setServices(serviceResponse.data ?? []);
    } catch (err: unknown) {
      const payload = err as { message?: string };
      setError(payload?.message ?? "No se pudieron cargar los servicios.");
    }
  };

  useEffect(() => {
    void load();
  }, [token]);

  const filteredServices = useMemo(
    () => services.filter((service) => service.title.toLowerCase().includes(search.toLowerCase())),
    [services, search],
  );

  const activeServices = services.filter((service) => service.status === "active").length;
  const totalViews = services.reduce((total, service) => total + service.views_count, 0);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setMessage(null);
    setError(null);
  };

  const editService = (service: ServicePayload) => {
    setEditingId(service.id);
    setForm({
      category_id: service.category_id,
      title: service.title,
      description: service.description,
      price: String(service.price),
      currency: service.currency,
      delivery_days: service.delivery_days,
      status: service.status,
    });
  };

  const saveService = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (editingId) {
        await api.updateService(token, editingId, form);
        setMessage("Servicio actualizado.");
      } else {
        await api.createService(token, form);
        setMessage("Servicio registrado.");
      }
      resetForm();
      await load();
    } catch (err: unknown) {
      const payload = err as { message?: string; errors?: Record<string, string[]> };
      const firstError = Object.values(payload?.errors ?? {})[0]?.[0];
      setError(firstError ?? payload?.message ?? "No se pudo guardar el servicio.");
    } finally {
      setLoading(false);
    }
  };

  const deleteService = async (service: ServicePayload) => {
    if (!token || !window.confirm(`Eliminar "${service.title}"?`)) return;
    setError(null);
    setMessage(null);

    try {
      await api.deleteService(token, service.id);
      setMessage("Servicio eliminado.");
      await load();
    } catch (err: unknown) {
      const payload = err as { message?: string };
      setError(payload?.message ?? "No se pudo eliminar el servicio.");
    }
  };

  return (
    <DashboardShell role="freelancer">
      <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-extrabold tracking-normal">Gestion de servicios</h1>
            <p className="mt-1 text-muted-foreground">Crea, edita y administra los servicios que ofreceras en la plataforma.</p>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <Metric icon={Package} label="Total servicios" value={String(services.length)} hint="Total registrado" />
          <Metric icon={CheckCircle2} label="Servicios activos" value={String(activeServices)} hint="Disponibles para clientes" />
          <Metric icon={Eye} label="Total de vistas" value={totalViews.toLocaleString()} hint="Suma real de vistas" />
        </div>

        {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p> : null}
        {message ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{message}</p> : null}

        <Card className="rounded-2xl p-4 shadow-soft">
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold tracking-normal">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-secondary/15 text-secondary"><Edit3 className="h-4 w-4" /></span>
            Registrar / editar servicio
          </h2>
          <form onSubmit={saveService} className="rounded-2xl border border-border p-4">
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
              <Field label="Titulo del servicio">
                <Input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} placeholder="Ej. Diseño de logo profesional" className="h-11 rounded-xl" required />
              </Field>
              <Field label="Precio">
                <Input value={form.price} onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))} placeholder="Ej. 250" className="h-11 rounded-xl" required />
              </Field>
              <Field label="Moneda">
                <Select value={form.currency} onValueChange={(value) => setForm((prev) => ({ ...prev, currency: value }))}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Selecciona moneda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PEN">PEN</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Descripcion del servicio">
                <Textarea value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} placeholder="Describe en detalle que incluye tu servicio..." className="min-h-28 resize-none rounded-xl" required />
              </Field>
              <Field label="Tiempo estimado">
                <Input type="number" min={1} value={form.delivery_days} onChange={(event) => setForm((prev) => ({ ...prev, delivery_days: Number(event.target.value) }))} className="h-11 rounded-xl" required />
              </Field>
              <Field label="Estado del servicio">
                <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value as ServiceInput["status"] }))}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Selecciona estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="paused">Pausado</SelectItem>
                    <SelectItem value="draft">Borrador</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={resetForm} className="rounded-xl">Limpiar</Button>
              <Button type="submit" disabled={loading} className="rounded-xl bg-gradient-primary shadow-soft"><Save className="h-4 w-4" /> {editingId ? "Actualizar" : "Guardar servicio"}</Button>
            </div>
          </form>
        </Card>

        <Card className="overflow-hidden rounded-2xl p-0 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
            <h2 className="flex items-center gap-2 font-display text-xl font-bold tracking-normal">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-secondary/15 text-secondary"><Package className="h-4 w-4" /></span>
              Lista de servicios
            </h2>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar servicio..." className="rounded-xl pl-9" />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoria</TableHead>
                <TableHead>Titulo</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Moneda</TableHead>
                <TableHead>Tiempo estimado</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Vistas</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>{service.category ?? "Sin categoria"}</TableCell>
                  <TableCell>
                    <div className="font-bold">{service.title}</div>
                    <div className="max-w-sm truncate text-xs text-muted-foreground">{service.description}</div>
                  </TableCell>
                  <TableCell>S/ {Number(service.price).toFixed(2)}</TableCell>
                  <TableCell>{service.currency}</TableCell>
                  <TableCell>{service.delivery_days} dias</TableCell>
                  <TableCell><StatusBadge status={service.status} /></TableCell>
                  <TableCell>{service.views_count}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button type="button" size="icon" variant="outline" onClick={() => editService(service)}><Edit3 className="h-4 w-4" /></Button>
                      <Button type="button" size="icon" variant="outline" className="text-primary" onClick={() => deleteService(service)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredServices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">No hay servicios registrados.</TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
          <div className="border-t border-border px-5 py-4 text-sm text-muted-foreground">
            Mostrando {filteredServices.length} de {services.length} servicios
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

function StatusBadge({ status }: { status: ServicePayload["status"] }) {
  const labels = { active: "Activo", paused: "Pausado", draft: "Borrador" };
  const styles = {
    active: "bg-secondary/15 text-secondary",
    paused: "bg-orange-100 text-orange-600",
    draft: "bg-muted text-muted-foreground",
  };

  return <Badge className={`${styles[status]} border-transparent shadow-none`}>{labels[status]}</Badge>;
}
