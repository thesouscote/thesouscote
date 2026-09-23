$files = @(
  'index.html', 'about.html', 'experience.html', 'projects.html',
  'project-detail.html', 'market.html', 'market-detail.html',
  'collecte.html', 'contact.html', 'draft.html', '404.html'
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = [System.IO.File]::ReadAllText((Resolve-Path $file).Path)
        
        $content = $content -replace '(?s)<nav[^>]*>.*?</nav>', '<nav id="site-nav"></nav>'
        $content = $content -replace '(?s)<footer[^>]*>.*?</footer>', '<footer id="site-footer"></footer>'
        $content = $content -replace '(?s)<div id="cmdk".*?</div>\s*</div>\s*</div>', '<div id="cmdk"></div>'
        
        if (-not $content.Contains('components.js')) {
            if ($content.Contains('<!-- Firebase Integration (App & Firestore) -->')) {
                $content = $content.Replace('<!-- Firebase Integration (App & Firestore) -->', "<script src=`"components.js`"></script>`n  <!-- Firebase Integration (App & Firestore) -->")
            } else {
                $content = $content -replace '<script src="https://www.gstatic.com/firebasejs/', "<script src=`"components.js`"></script>`n  <script src=`"https://www.gstatic.com/firebasejs/"
            }
        }
        
        [System.IO.File]::WriteAllText((Resolve-Path $file).Path, $content)
        Write-Host "Updated $file"
    }
}
