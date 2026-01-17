import fs from 'node:fs';
import path from 'node:path';

const assetRoots = [
  {
    source: 'docs/履歴書/images',
    destination: 'public/docs/履歴書/images',
  },
  {
    source: 'docs/職務経歴書/images',
    destination: 'public/docs/職務経歴書/images',
  },
  {
    source: 'docs/resume/en-cv/images',
    destination: 'public/docs/resume/en-cv/images',
  },
  {
    source: 'docs/resume/en-resume/images',
    destination: 'public/docs/resume/en-resume/images',
  },
];

const getFileStats = (filePath) => {
  try {
    return fs.statSync(filePath);
  } catch {
    return null;
  }
};

const shouldCopy = (sourcePath, destinationPath) => {
  const sourceStats = getFileStats(sourcePath);
  if (!sourceStats) return false;

  const destStats = getFileStats(destinationPath);
  if (!destStats) return true;

  // ソースファイルが新しい、またはサイズが異なる場合はコピー
  return sourceStats.mtimeMs > destStats.mtimeMs || sourceStats.size !== destStats.size;
};

const copyDir = (sourceDir, destinationDir) => {
  if (!fs.existsSync(sourceDir)) return;

  fs.mkdirSync(destinationDir, { recursive: true });
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const destinationPath = path.join(destinationDir, entry.name);

    if (entry.isDirectory()) {
      copyDir(sourcePath, destinationPath);
      continue;
    }

    // 変更がある場合のみコピー（常に最新を保つ）
    if (shouldCopy(sourcePath, destinationPath)) {
      fs.copyFileSync(sourcePath, destinationPath);
      console.log(`✓ Synced: ${sourcePath} -> ${destinationPath}`);
    }
  }
};

console.log('🔄 Syncing document assets...');
for (const root of assetRoots) {
  if (!fs.existsSync(root.source)) {
    console.log(`⚠ Skipping (not found): ${root.source}`);
    continue;
  }
  copyDir(root.source, root.destination);
}
console.log('✅ Document assets sync completed');
