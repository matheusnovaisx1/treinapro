-- Restringe os buckets de Storage a tipos de imagem e tamanho máximo,
-- reforçando o que hoje só era validado (fracamente) no frontend.
-- SVG é excluído de propósito (pode conter <script> e permitir XSS se o
-- arquivo for aberto diretamente pela URL pública).

update storage.buckets
set file_size_limit = 5242880, allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp']
where id = 'avatars';

update storage.buckets
set file_size_limit = 10485760, allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp']
where id = 'assessment-photos';

update storage.buckets
set file_size_limit = 2097152, allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/x-icon']
where id = 'brand-logos';
