# Phase 5: File Storage (Vercel Blob)

## Overview

Phase 5 implements file storage using **Vercel Blob** for all document uploads (designs, proofs, invoices, etc.). Files are stored securely with company-level isolation.

## Setup

### 1. Environment Variables

Add to `.env.local`:

```env
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
```

Get your token from [Vercel Dashboard](https://vercel.com/dashboard) → Storage → Blob.

### 2. Installed Dependencies

- `@vercel/blob` — Blob storage client

## API Endpoints

### POST /api/upload

Upload a file to Blob storage.

**Request:**
```bash
curl -X POST /api/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@design.pdf" \
  -F "category=designs"
```

**Response:**
```json
{
  "url": "https://your-account.public.blob.vercel-storage.com/company-id/designs/...",
  "pathname": "company-id/designs/...",
  "size": 102400,
  "type": "application/pdf",
  "name": "design.pdf"
}
```

**Features:**
- File size validation (max 50MB default)
- Type validation (images, PDFs, docs)
- Company-level isolation via pathname: `company_id/category/filename`
- Public URLs for direct access

## Client-Side Usage

### Hook: `useFileUpload`

```typescript
import { useFileUpload } from '@/hooks/useFileUpload';

function MyComponent() {
  const { upload } = useFileUpload();

  const handleUpload = async (files: File[]) => {
    const results = await upload(files, 'designs');
    results.forEach((r) => {
      if (r.status === 'success') console.log(r.url);
      else console.error(r.error);
    });
  };

  return <input type="file" onChange={(e) => handleUpload(Array.from(e.target.files || []))} />;
}
```

### Component: `<FileUpload />`

```typescript
import { FileUpload } from '@/components/ui';

export default function UploadPage() {
  return (
    <FileUpload
      category="designs"
      allowedTypes={['image/png', 'application/pdf']}
      maxSize={10 * 1024 * 1024}
      onUploadComplete={(urls) => console.log(urls)}
      onError={(error) => console.error(error)}
    />
  );
}
```

### Utility Functions

```typescript
import {
  uploadFile,
  getFileExtension,
  getFileSizeLabel,
  isImageFile,
  isPdfFile,
  isDocFile,
} from '@/lib/file-storage';

// Upload a single file
const { url } = await uploadFile(file, 'invoices');

// Check file type
if (isImageFile(filename)) { /* ... */ }
if (isPdfFile(filename)) { /* ... */ }

// Format size
const label = getFileSizeLabel(1024 * 1024); // "1 MB"
```

## Database Integration

Store file URLs in your Prisma models:

```prisma
model Design {
  id            String   @id @default(uuid())
  design_file_url String? // URL from /api/upload
  // ...
}
```

Then update in your API handlers:

```typescript
const design = await db.designs.create({
  data: {
    design_name: "My Design",
    design_file_url: uploadResponse.url, // From /api/upload
    // ...
  },
});
```

## File Organization

Files are organized by company and category:

```
blob-storage/
├── company-1/
│   ├── designs/
│   │   ├── 1704067200000-abc123-design.pdf
│   │   └── 1704067300000-def456-proof.png
│   ├── invoices/
│   │   └── 1704067400000-ghi789-invoice.pdf
│   └── proofs/
│       └── 1704067500000-jkl012-proof.png
└── company-2/
    ├── designs/
    └── invoices/
```

## Security

- **Company Isolation**: Files stored under `company_id` folder
- **Auth**: `/api/upload` requires valid JWT token
- **Public URLs**: Files are public (no sensitive data)
- **Size Limits**: 50MB default, configurable per endpoint
- **Type Validation**: Whitelist of allowed MIME types

## Migration Path (Phase 6)

In Phase 6 (Cutover), implement:

1. **File Import**: Migrate old files from `frontend/public` to Blob
2. **URL Updates**: Update all DB records with new Blob URLs
3. **Old File Cleanup**: Delete local file storage after migration
4. **CDN Caching**: Configure Blob CDN settings in Vercel Dashboard

## Troubleshooting

**"BLOB_READ_WRITE_TOKEN is missing"**
- Set env var in `.env.local` and restart dev server

**"Upload failed with 403"**
- Token is invalid or expired. Regenerate from Vercel Dashboard.

**"File too large"**
- Increase `MAX_FILE_SIZE` in `/api/upload/route.ts`

**"File type not allowed"**
- Add MIME type to `ALLOWED_TYPES` in `/api/upload/route.ts`
