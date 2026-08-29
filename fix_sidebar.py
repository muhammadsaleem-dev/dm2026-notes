import glob
import re

for f in glob.glob("chapter-2-*.html"):
    with open(f, 'r') as file:
        content = file.read()
    
    if 'chapter-2-exercise.html' not in content:
        # Desktop
        content = content.replace(
            '<a href="chapter-2-pca.html">2.4 &middot; PCA &amp; t-SNE</a>',
            '<a href="chapter-2-pca.html">2.4 &middot; PCA &amp; t-SNE</a>\n          <a href="chapter-2-exercise.html">2.5 &middot; Sprint Exercise</a>'
        )
        content = content.replace(
            '<a href="chapter-2-pca.html">2.4 · PCA &amp; t-SNE</a>',
            '<a href="chapter-2-pca.html">2.4 · PCA &amp; t-SNE</a>\n          <a href="chapter-2-exercise.html">2.5 · Sprint Exercise</a>'
        )
        # Mobile
        content = content.replace(
            '<a href="chapter-2-pca.html">2.4 · PCA</a>',
            '<a href="chapter-2-pca.html">2.4 · PCA</a>\n      <a href="chapter-2-exercise.html">2.5 · Sprint Exercise</a>'
        )
        with open(f, 'w') as file:
            file.write(content)
