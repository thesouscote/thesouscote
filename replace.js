const fs = require('fs');
const path = require('path');

const files = [
  'index.html', 'about.html', 'experience.html', 'projects.html',
  'project-detail.html', 'market.html', 'market-detail.html',
  'collecte.html', 'contact.html', 'draft.html', '404.html'
];

const dir = 'C:\\Users\\Moke Patrick Armel\\Desktop\\thesouscote-main';

files.forEach(file => {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${file} - not found`);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');

  content = content.replace(/<nav[^>]*>[\s\S]*?<\/nav>/, '<nav id="site-nav"></nav>');
  content = content.replace(/<footer[^>]*>[\s\S]*?<\/footer>/, '<footer id="site-footer"></footer>');
  content = content.replace(/<div id="cmdk"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, '<div id="cmdk"></div>');

  if (!content.includes('components.js')) {
    if (content.includes('<!-- Firebase Integration (App & Firestore) -->')) {
      content = content.replace(
        '<!-- Firebase Integration (App & Firestore) -->',
        '<script src="components.js"></script>\n  <!-- Firebase Integration (App & Firestore) -->'
      );
    } else if (content.includes('<script src="https://www.gstatic.com/firebasejs/')) {
      content = content.replace(
        /<script src="https:\/\/www\.gstatic\.com\/firebasejs\/.*<\/script>/,
        match => `<script src="components.js"></script>\n  ${match}`
      );
    }
  }

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
});
