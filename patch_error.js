const fs = require('fs');
const content = fs.readFileSync('src/backend/middlewares/error.middleware.ts', 'utf-8');
const newContent = content.replace("console.error('[ErrorHandler]', err);", "console.error('[ErrorHandler]', err); require('fs').appendFileSync('/Users/nikesh/.gemini/antigravity-ide/brain/6c985dcf-2601-4d8c-a132-cfdce1aa84f2/scratch/backend_logs.txt', JSON.stringify({msg: err.message, stack: err.stack}) + '\\n');");
fs.writeFileSync('src/backend/middlewares/error.middleware.ts', newContent);
