import fs from 'fs/promises';
import path from 'path';

export default async function LegalHtml({ relPath }: { relPath: string }) {
  const filePath = path.join(process.cwd(), 'public', relPath);
  const html = await fs.readFile(filePath, 'utf8');
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
