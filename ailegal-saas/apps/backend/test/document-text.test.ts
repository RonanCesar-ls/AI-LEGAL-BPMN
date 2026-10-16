import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, writeFile, access, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DocumentReadError, extractUploadedDocumentText } from '../src/modules/process/document-text.js';

function pdf(text: string) {
  const stream = `BT /F1 12 Tf 72 720 Td (${text}) Tj ET\n`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}endstream`,
  ];
  let source = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(source));
    source += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = Buffer.byteLength(source);
  source += `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}`;
  source += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(source);
}

test('reads a real PDF with pdf-parse v2 and removes the uploaded file', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'pbmapp-pdf-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const path = join(directory, 'upload');
  await writeFile(path, pdf('Review the document and approve the request.'));
  const text = await extractUploadedDocumentText({ path, originalname: 'process.pdf', mimetype: 'application/pdf' });
  assert.match(text, /Review the document and approve the request/);
  await assert.rejects(access(path), { code: 'ENOENT' });
});

test('rejects a blank PDF instead of treating page numbers as document content', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'pbmapp-empty-pdf-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const path = join(directory, 'upload');
  await writeFile(path, pdf(''));
  await assert.rejects(extractUploadedDocumentText({ path, originalname: 'empty.pdf', mimetype: 'application/pdf' }),
    error => error instanceof DocumentReadError && error.statusCode === 422);
  await assert.rejects(access(path), { code: 'ENOENT' });
});

test('removes invalid and unsupported uploads even when extraction fails', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'pbmapp-invalid-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  for (const originalname of ['broken.pdf', 'unsupported.txt']) {
    const path = join(directory, originalname);
    await writeFile(path, 'Not a PDF');
    await assert.rejects(extractUploadedDocumentText({ path, originalname, mimetype: 'text/plain' }));
    await assert.rejects(access(path), { code: 'ENOENT' });
  }
});
