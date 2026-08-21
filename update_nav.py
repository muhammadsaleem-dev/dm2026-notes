import glob
import re

nav_links_html = """<div class="sitenav-links">
      <a href="chapter-1-intro.html">1 · Intro</a>
      <a href="chapter-2-pandas.html">2.1 · Pandas/EDA</a>
      <a href="chapter-2-preprocessing.html">2.2 · Preprocessing</a>
      <a href="chapter-2-modelling.html">2.3 · Modelling</a>
      <a href="chapter-2-pca.html">2.4 · PCA</a>
      <a href="chapter-3-classification.html">3 · Classification</a>
      <a href="chapter-4-clustering.html">4 · Clustering</a>
      <a href="chapter-5-regression-nn.html">5 · Regression→NN</a>
      <a href="chapter-6-llm-rag.html">6 · LLM/RAG</a>
      <a href="chapter-7-explainability.html">7 · Explainability</a>
    </div>"""

sidebar_modules_html = """<span class="sidebar-label">Modules</span>
      <a href="chapter-1-intro.html">1 · Introduction to Data Mining</a>
      <a href="chapter-2-pandas.html">2.1 · Pandas &amp; EDA</a>
      <a href="chapter-2-preprocessing.html">2.2 · Data Preprocessing</a>
      <a href="chapter-2-modelling.html">2.3 · Modelling &amp; Evaluation</a>
      <a href="chapter-2-pca.html">2.4 · PCA &amp; t-SNE</a>
      <a href="chapter-3-classification.html">3 · Classification</a>
      <a href="chapter-4-clustering.html">4 · Clustering Analysis</a>
      <a href="chapter-5-regression-nn.html">5 · From Regression to Neural Networks</a>
      <a href="chapter-6-llm-rag.html">6 · LLM &amp; RAG Pipeline</a>
      <a href="chapter-7-explainability.html">7 · Explainability &amp; Causality</a>"""

nav_panel_modules_html = sidebar_modules_html.replace('sidebar-label', 'nav-panel-label')

def update_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Replace sitenav-links (using regex to catch existing content)
    content = re.sub(r'<div class="sitenav-links">.*?</div>', nav_links_html, content, flags=re.DOTALL)
    
    # Replace sidebar modules
    content = re.sub(r'<span class="sidebar-label">Modules</span>.*?(?=</div>)', sidebar_modules_html + "\n    ", content, flags=re.DOTALL)
    
    # Replace nav-panel modules
    content = re.sub(r'<span class="nav-panel-label">Modules</span>.*?(?=</div>)', nav_panel_modules_html + "\n    ", content, flags=re.DOTALL)
    
    # Apply 'active' class based on filename
    filename = filepath.split('/')[-1]
    
    # Regex to find the link for this file and add class="active"
    # But only inside the navigation areas. The easiest way is string replacement for the specific link.
    if filename != "index.html":
        # Make the exact match active
        link_str = f'<a href="{filename}">'
        active_str = f'<a href="{filename}" class="active">'
        content = content.replace(link_str, active_str)

    with open(filepath, 'w') as f:
        f.write(content)

for filepath in glob.glob("*.html"):
    if filepath != "chapter-2-pipeline.html": # Ignore the one we are deleting
        print(f"Updating {filepath}")
        update_file(filepath)
