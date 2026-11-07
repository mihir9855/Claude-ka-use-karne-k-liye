import {renderVideo} from '@revideo/renderer';

async function render() {
  const file = await renderVideo({
    projectFile: './src/project.tsx',
    settings: {logProgress: true, puppeteer: {executablePath: process.env.PUPPETEER_EXECUTABLE_PATH, headless: 'shell', args: ['--no-sandbox']}},
  });
  console.log(`Rendered video to ${file}`);
  process.exit(0);
}

render();
