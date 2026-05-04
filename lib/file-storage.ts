export async function uploadFile(
  file: File,
  category: string = 'misc'
): Promise<{ url: string; pathname: string; size: number; type: string; name: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', category);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Upload failed');
  }

  return response.json();
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export function getFileSizeLabel(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function isImageFile(filename: string): boolean {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];
  return imageExtensions.includes(getFileExtension(filename));
}

export function isPdfFile(filename: string): boolean {
  return getFileExtension(filename) === 'pdf';
}

export function isDocFile(filename: string): boolean {
  const docExtensions = ['doc', 'docx', 'txt', 'xls', 'xlsx'];
  return docExtensions.includes(getFileExtension(filename));
}
