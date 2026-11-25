//src/components/editorial/NewProjectDialog.tsx
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ProjectCreateSchema, ProjectCreateDTO } from '@/lib/dto/editorial.schema';
import { editorialService } from '@/lib/services/editorialService';
import {
  selectCompanyBrands,
  selectSelectedBrandId,
} from '@/lib/redux/slices/companySlice';

interface NewProjectDialogProps {
  onCreated: (project: any) => void;
  autoOpen?: boolean;
}

export function NewProjectDialog({ onCreated, autoOpen = false }: NewProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const brands = useSelector(selectCompanyBrands);
  const selectedBrandId = useSelector(selectSelectedBrandId);

  useEffect(() => {
    if (autoOpen) {
      setOpen(true);
    }
  }, [autoOpen]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProjectCreateDTO>({
    resolver: zodResolver(ProjectCreateSchema),
    mode: 'onChange',
    defaultValues: {
      brandId: selectedBrandId || brands[0]?._id || '',
    },
  });

  useEffect(() => {
    const defaultBrand = selectedBrandId || brands[0]?._id || '';
    if (defaultBrand) {
      setValue('brandId', defaultBrand, { shouldValidate: true });
    }
  }, [open, brands, selectedBrandId, setValue]);

  const onSubmit = async (data: ProjectCreateDTO) => {
    try {
      const project = await editorialService.createProject(data);
      onCreated(project);
      toast.success('Projeto editorial criado com sucesso.');
      reset();
      setOpen(false);
    } catch (error: any) {
      const apiError = error?.response?.data?.error;
      const errorMessage =
        typeof apiError === 'string'
          ? apiError
          : apiError?.message ||
            error?.response?.data?.message ||
            error?.message ||
            'Falha ao criar o projeto editorial.';
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 font-sans text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90">
          <Plus className="h-4 w-4" />
          Novo Projeto
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Projeto Editorial</DialogTitle>
          <DialogDescription>
            Defina o negócio ou produto que será o centro deste projeto estratégico.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label className="font-sans text-sm font-bold text-foreground">
              Marca Vinculada *
            </label>
            {brands.length === 0 ? (
              <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                Cadastre ou solicite acesso a uma marca nesta empresa antes de criar um projeto.
              </p>
            ) : (
              <select
                {...register('brandId')}
                className="w-full rounded-md border border-border bg-background px-4 py-2 font-sans text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {brands.map((brand) => (
                  <option key={brand._id} value={brand._id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            )}
            {errors.brandId && <p className="text-xs text-destructive">{errors.brandId.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="font-sans text-sm font-bold text-foreground">
              Nome do Projeto
            </label>
            <input
              {...register('name')}
              placeholder="Ex: Autoridade Imperial — Orgânico"
              className="w-full rounded-md border border-border bg-background px-4 py-2 font-sans text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="font-sans text-sm font-bold text-foreground">Nicho</label>
              <input
                {...register('niche')}
                placeholder="Ex: Finanças"
                className="w-full rounded-md border border-border bg-background px-4 py-2 font-sans text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
              {errors.niche && <p className="text-xs text-red-500">{errors.niche.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="font-sans text-sm font-bold text-foreground">Subnicho</label>
              <input
                {...register('subniche')}
                placeholder="Ex: Algorithmic Trading"
                className="w-full rounded-md border border-border bg-background px-4 py-2 font-sans text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
              {errors.subniche && <p className="text-xs text-red-500">{errors.subniche.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-sans text-sm font-bold text-foreground">
              Objetivo Atual do Período
            </label>
            <input
              {...register('currentObjective')}
              placeholder="Ex: Aquecimento de Audiência"
              className="w-full rounded-md border border-border bg-background px-4 py-2 font-sans text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            {errors.currentObjective && (
              <p className="text-xs text-red-500">{errors.currentObjective.message}</p>
            )}
          </div>

          <DialogFooter>
            <button
              type="submit"
              disabled={isSubmitting || brands.length === 0}
              className="flex items-center gap-2 rounded-md bg-primary px-6 py-2 font-sans text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Projeto'
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}