'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Save, ExternalLink, Upload } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { initials, validateImageFile } from '@/lib/utils';

const PRESET_COLORS = ['#ea580c', '#16a34a', '#2563eb', '#db2777', '#7c3aed', '#0891b2'];

type Props = {
  userId: string;
  initial: {
    phone: string | null;
    bio: string | null;
    brand_color: string | null;
    brand_logo_url: string | null;
    public_slug: string | null;
    is_public_page_enabled: boolean;
  };
};

export function BrandSettingsForm({ userId, initial }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [phone, setPhone] = useState(initial.phone ?? '');
  const [bio, setBio] = useState(initial.bio ?? '');
  const [brandColor, setBrandColor] = useState(initial.brand_color ?? '#ea580c');
  const [logoUrl, setLogoUrl] = useState(initial.brand_logo_url ?? '');
  const [slug, setSlug] = useState(initial.public_slug ?? '');
  const [publicEnabled, setPublicEnabled] = useState(initial.is_public_page_enabled);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleLogoUpload(file: File) {
    const validationError = validateImageFile(file, 2 * 1024 * 1024);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setUploading(true);
    const path = `${userId}/logo-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('brand-logos').upload(path, file, { upsert: true });
    setUploading(false);

    if (error) {
      toast.error('Não foi possível enviar a logo', { description: error.message });
      return;
    }
    const { data } = supabase.storage.from('brand-logos').getPublicUrl(path);
    setLogoUrl(data.publicUrl);
  }

  async function handleSave() {
    setSaving(true);
    const normalizedSlug = slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const { error } = await supabase
      .from('profiles')
      .update({
        phone: phone || null,
        bio: bio || null,
        brand_color: brandColor || null,
        brand_logo_url: logoUrl || null,
        public_slug: normalizedSlug || null,
        is_public_page_enabled: publicEnabled && !!normalizedSlug,
      })
      .eq('id', userId);

    setSaving(false);

    if (error) {
      toast.error('Não foi possível salvar', {
        description: error.message.includes('duplicate') ? 'Esse endereço já está em uso, escolha outro.' : error.message,
      });
      return;
    }

    setSlug(normalizedSlug);
    toast.success('Configurações salvas');
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Marca própria</CardTitle>
          <CardDescription>Seus alunos veem sua logo e sua cor em vez do visual padrão do TreinaPro.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 rounded-md">
              <AvatarImage src={logoUrl || undefined} />
              <AvatarFallback className="rounded-md">{initials('Logo')}</AvatarFallback>
            </Avatar>
            <label>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
              />
              <Button variant="outline" size="sm" asChild disabled={uploading}>
                <span>
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Enviar logo
                </span>
              </Button>
            </label>
          </div>

          <div className="space-y-1.5">
            <Label>Cor de destaque</Label>
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setBrandColor(c)}
                  className="h-8 w-8 rounded-full border-2"
                  style={{ backgroundColor: c, borderColor: brandColor === c ? '#000' : 'transparent' }}
                  aria-label={c}
                />
              ))}
              <Input type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="h-8 w-14 p-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contato e página pública</CardTitle>
          <CardDescription>Usados no botão de WhatsApp e na sua página pública de captação de alunos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>WhatsApp</Label>
            <Input placeholder="(11) 98888-7777" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Bio / pitch curto</Label>
            <textarea
              className="min-h-[80px] w-full rounded-md border border-input bg-transparent p-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Personal trainer especialista em emagrecimento e hipertrofia..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Endereço da página pública</Label>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">/p/</span>
              <Input placeholder="seu-nome" value={slug} onChange={(e) => setSlug(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={publicEnabled} onCheckedChange={setPublicEnabled} id="public-page" />
            <Label htmlFor="public-page">Ativar página pública</Label>
          </div>
          {initial.is_public_page_enabled && initial.public_slug && (
            <Button variant="ghost" size="sm" asChild>
              <a href={`/p/${initial.public_slug}`} target="_blank" rel="noreferrer">
                Ver página pública <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </CardContent>
      </Card>

      <Button variant="accent" onClick={handleSave} disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Salvar
      </Button>
    </div>
  );
}
