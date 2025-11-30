import express from 'express';
import path from 'node:path';
import fs from 'node:fs/promises';

const app = express();
const port = 8080;

// Handle API not found
app.get(/$\/api\/.*/, (_, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Handle site not found
app.get(/.*/, async (req, res) => {
  // Return a file under /site
  const filePath = path.join(process.cwd(), 'site', req.path);

  console.info('Requested file:', filePath);

  try {
    // Check whether the file exists and is accessible and is a file
    await fs.access(filePath);
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) {
      throw new Error('Not a file');
    }

    res.sendFile(filePath);
  } catch (_) {
    console.error('File not found:', filePath);
    // Serve the 404 page (containing XSS vulnerability)
    res.status(404).sendFile(path.join(process.cwd(), 'site', '404.html'));
  }
});

app.listen(port, () => {
  console.info(`Server is running at http://localhost:${port}`);
});
