import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

export function resolveImageUrl(input: any): string {
  const fallback = 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80';
  if (!input) return fallback;

  let url = '';

  if (typeof input === 'string') {
    url = input.trim();
  } else if (Array.isArray(input) && input.length > 0) {
    const primary = input.find((img: any) => img && (img.isPrimary === true || img.primary === true)) || input[0];
    url = typeof primary === 'string' ? primary.trim() : (primary?.imageUrl?.trim() || '');
  } else if (typeof input === 'object') {
    if (input.primaryImageUrl && typeof input.primaryImageUrl === 'string') {
      url = input.primaryImageUrl.trim();
    } else if (input.imageUrl && typeof input.imageUrl === 'string') {
      url = input.imageUrl.trim();
    } else if (Array.isArray(input.images) && input.images.length > 0) {
      const primary = input.images.find((img: any) => img && (img.isPrimary === true || img.primary === true)) || input.images[0];
      url = typeof primary === 'string' ? primary.trim() : (primary?.imageUrl?.trim() || '');
    }
  }

  if (!url) return fallback;

  // If already absolute URL or data URL
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }

  // If local uploaded file path (e.g. /uploads/products/...)
  const baseUrl = environment.assetBaseUrl || environment.apiUrl.replace('/api', '');
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = url.startsWith('/') ? url : '/' + url;

  return `${cleanBase}${cleanPath}`;
}

@Pipe({
  name: 'imageUrl',
  standalone: true
})
export class ImageUrlPipe implements PipeTransform {
  transform(input: any): string {
    return resolveImageUrl(input);
  }
}
