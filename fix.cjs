const fs = require('fs');
['src/components/AiScheduler/AiChatInterface.jsx', 'src/components/AiScheduler/AiSchedulingEngine.js'].forEach(f => {
  let text = fs.readFileSync(f, 'utf8');
  text = text.split('\\`').join('`');
  text = text.split('\\$').join('$');
  fs.writeFileSync(f, text);
});
