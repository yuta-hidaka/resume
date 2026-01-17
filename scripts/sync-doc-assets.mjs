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

const copyDir = (sourceDir, destinationDir) => {
  fs.mkdirSync(destinationDir, { recursive: true });
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const destinationPath = path.join(destinationDir, entry.name);

    if (entry.isDirectory()) {
      copyDir(sourcePath, destinationPath);
      continue;
    }

    fs.copyFileSync(sourcePath, destinationPath);
  }
};

for (const root of assetRoots) {
  if (!fs.existsSync(root.source)) continue;
  copyDir(root.source, root.destination);
}
