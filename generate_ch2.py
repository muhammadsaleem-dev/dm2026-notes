import re

html_content = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sprint Exercise · DM 2026 Bootcamp</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/style.css?v=9">
<script>(function(){try{var t=localStorage.getItem('dm2026-theme')||'light';document.documentElement.setAttribute('data-theme',t);var m=localStorage.getItem('dm2026-mode')||'concept';document.documentElement.setAttribute('data-mode',m);}catch(e){}})();</script>
</head>
<body>
<nav class="sitenav">
  <div class="sitenav-left">
    <a href="index.html" class="sitenav-logo"><em>DM Bootcamp</em></a>
  </div>
  <div class="sitenav-right">
    <button class="nav-btn" id="themeToggle" type="button" aria-label="Toggle theme">
      <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
      <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
    </button>
    <button class="nav-btn mode-btn" id="modeToggle" type="button" aria-label="Toggle mode" title="Switch to Tech Mode">
      <svg class="icon-concept" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
      <svg class="icon-tech" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
    </button>
  </div>
</nav>

<div class="page-shell">
  <aside class="sidebar-toc">
    <div class="sidebar-block">
      <span class="sidebar-label">Modules</span>
      <a href="chapter-1-intro.html">1 · Introduction to Data Mining</a>
      <details class="nav-details" id="mod2-details" open>
        <summary class="nav-summary">
          <a href="chapter-2-overview.html">2 · The Data Mining Pipeline</a>
          <span class="nav-chevron"><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg></span>
        </summary>
        <div class="sub-modules">
          <a href="chapter-2-pandas.html">2.1 · Pandas & EDA</a>
          <a href="chapter-2-preprocessing.html">2.2 · Data Preprocessing</a>
          <a href="chapter-2-modelling.html">2.3 · Modelling & Evaluation</a>
          <a href="chapter-2-pca.html">2.4 · PCA & t-SNE</a>
          <a href="chapter-2-exercise.html" class="active">2.5 · Sprint Exercise</a>
        </div>
      </details>
      <details class="nav-details" id="mod3-details">
        <summary class="nav-summary">
          <a href="chapter-3-overview.html">3 · Classification</a>
          <span class="nav-chevron"><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg></span>
        </summary>
        <div class="sub-modules">
          <a href="chapter-3-exercise.html">3.4 · Sprint Exercise</a>
          <a href="chapter-3-test.html">3.5 · Test Yourself</a>
        </div>
      </details>
      <details class="nav-details" id="mod4-details">
        <summary class="nav-summary">
          <a href="chapter-4-overview.html">4 · Clustering Analysis</a>
          <span class="nav-chevron"><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg></span>
        </summary>
        <div class="sub-modules">
          <a href="chapter-4-exercise.html">4.4 · Sprint Exercise</a>
          <a href="chapter-4-test.html">4.5 · Test Yourself</a>
        </div>
      </details>
      <details class="nav-details" id="mod5-details">
        <summary class="nav-summary">
          <a href="chapter-5-overview.html">5 · From Regression to Neural Networks</a>
          <span class="nav-chevron"><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg></span>
        </summary>
        <div class="sub-modules">
          <a href="chapter-5-regression.html">5.1 · Linear & Logistic Regression</a>
          <a href="chapter-5-neural-networks.html">5.2 · Building Neural Networks</a>
          <a href="chapter-5-training.html">5.3 · Training at Scale</a>
        </div>
      </details>
      <a href="chapter-6-llm-rag.html">6 · LLM & RAG Pipeline</a>
      <a href="chapter-7-explainability.html">7 · Explainability & Causality</a>
    </div>
  </aside>

<div class="page">
  <div class="masthead">
    <div>
      <div class="eyebrow">Data Mining Bootcamp · Module 2.5</div>
      <h1 class="title">Sprint Exercise: The Full Pipeline</h1>
    </div>
    <div class="masthead-meta">Titanic Survival & Dimensionality Reduction<br><strong>Preparation → Pipeline → Visualization</strong></div>
  </div>

  <!-- INTRO -->
  <section class="chapter" id="intro">
    <p class="chapter-dek">In this sprint, we assemble all the pieces from Chapter 2 into a single cohesive pipeline.</p>
    
    <div class="callout teacher-note">
      <div class="callout-icon">💡</div>
      <div class="callout-content">
        <strong>How to use this page</strong>
        <p>This page features the <strong>Kid/Tech Toggle</strong> (the face/book icon in the top right). Start in Kid Mode to understand the intuition of the pipeline, then flip to Tech Mode to see the exact Python code and exam traps used in the Jupyter Notebooks.</p>
      </div>
    </div>
  </section>

  <!-- STEP 1 -->
  <section class="chapter" id="step1">
    <div class="chapter-head"><span class="chapter-num">1</span><h2>The Setup & The Split</h2></div>
    
    <div class="mode-concept">
      <p>Imagine you are baking a cake for a competition. You have a giant bowl of raw ingredients (our dataset). Before you even look at the recipe or start sifting flour, you MUST take 30% of your ingredients and lock them in a safe.</p>
      <p>Why? Because you need pristine, untouched ingredients to bake the final cake for the judges (the <strong class="important-term">Test Set</strong>). If you mix everything together early on, you ruin the test!</p>
    </div>

    <div class="mode-tech">
      <p>In data mining, we always split our data into Training and Testing sets <em>before</em> we do any imputation or scaling. This prevents <strong class="important-term">Data Leakage</strong>, where statistics from the test set accidentally influence the training process.</p>
      
      <div class="callout exam-trap">
        <div class="callout-icon">🚨</div>
        <div class="callout-content">
          <strong>Exam Trap: The numerical selector</strong>
          <p>Professors love to test if you know how to programmatically grab only the numerical columns before doing math operations. The magic function is <code>df.select_dtypes(include=np.number).columns</code>.</p>
        </div>
      </div>

<pre><code class="language-python"># Load the dataset
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split

url = 'https://www.openml.org/data/get_csv/16826755/phpMYEkMl'
df = pd.read_csv(url)

# EXAM TRAP: Programmatically identify numerical columns
numerical_cols = df.select_dtypes(include=np.number).columns.tolist()
print("Numerical cols:", numerical_cols)

# Separate features (X) and target (y)
X = df.drop(columns=['survived'])
y = df['survived']

# The Golden Rule: Split FIRST! (30% test)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42
)</code></pre>
    </div>
  </section>

  <!-- STEP 2 -->
  <section class="chapter" id="step2">
    <div class="chapter-head"><span class="chapter-num">2</span><h2>Cleaning & Encoding (The Prep Cook)</h2></div>
    
    <div class="mode-concept">
      <p>Now we look at our ingredients. Oh no! Some eggs are missing, and someone wrote "Large" instead of giving us a number of cups of flour.</p>
      <ul>
        <li><strong>Missing Values:</strong> If we are missing a little bit of sugar, we just guess the amount using the average (Mean Imputation). If a whole bag of flour is missing, we throw it away (Drop).</li>
        <li><strong>Words to Numbers:</strong> Computers can't bake with the word "Large". We have to translate it into a number. We create a new label called "Is_Large" and set it to 1 or 0 (<strong class="important-term">One-Hot Encoding</strong>).</li>
      </ul>
    </div>

    <div class="mode-tech">
      <p>We replace garbage characters (like <code>?</code>) with <code>NaN</code> so Pandas recognizes them as missing. Then we impute missing numericals and apply <strong class="important-term">One-Hot Encoding</strong> to categorical variables so our ML models can process them.</p>

<pre><code class="language-python"># Replace garbage '?' with standard NaNs
X_train = X_train.replace('?', pd.NA)
X_test = X_test.replace('?', pd.NA)

# Fill missing numerical values with the mean (fit ONLY on train)
mean_age = X_train['age'].astype(float).mean()
X_train['age'] = X_train['age'].fillna(mean_age)
X_test['age'] = X_test['age'].fillna(mean_age)

# One-Hot Encoding for categorical data (e.g. Sex)
X_train = pd.get_dummies(X_train, columns=['sex'], drop_first=True)
X_test = pd.get_dummies(X_test, columns=['sex'], drop_first=True)
# drop_first=True avoids the Dummy Variable Trap!</code></pre>
    </div>
  </section>

  <!-- STEP 3 -->
  <section class="chapter" id="step3">
    <div class="chapter-head"><span class="chapter-num">3</span><h2>Scaling the Data</h2></div>
    
    <div class="mode-concept">
      <p>We have a problem: Our recipe calls for 1,000 grams of flour, but only 2 teaspoons of baking powder. A robot baker might look at "1,000" and "2" and think flour is 500x more important than baking powder!</p>
      <p>To fix this, we <strong class="important-term">Scale</strong> everything. We shrink the flour down to a scale of 0 to 1, and we stretch the baking powder to a scale of 0 to 1. Now they are perfectly balanced.</p>
    </div>

    <div class="mode-tech">
      <p>Distance-based algorithms (like K-Means or Neural Networks) are extremely sensitive to the magnitude of features. We must scale them. For exam purposes, the most popular scaler is <strong class="important-term">MinMaxScaler</strong>.</p>
      
      <div class="callout exam-trap">
        <div class="callout-icon">🚨</div>
        <div class="callout-content">
          <strong>Exam Trap: fit_transform vs transform</strong>
          <p>You MUST use <code>fit_transform()</code> on the training data to learn the Min and Max. You MUST use <code>transform()</code> on the test data. If you fit on the test data, you just committed Data Leakage.</p>
        </div>
      </div>

<pre><code class="language-python">from sklearn.preprocessing import MinMaxScaler

# Initialize the scaler
scaler = MinMaxScaler()

# 1. FIT and TRANSFORM on the Training Data
numerical_features = ['age', 'fare']
X_train[numerical_features] = scaler.fit_transform(X_train[numerical_features])

# 2. ONLY TRANSFORM on the Test Data
X_test[numerical_features] = scaler.transform(X_test[numerical_features])
</code></pre>
    </div>
  </section>

  <!-- STEP 4 -->
  <section class="chapter" id="step4">
    <div class="chapter-head"><span class="chapter-num">4</span><h2>Dimensionality Reduction (PCA vs t-SNE)</h2></div>
    
    <div class="mode-concept">
      <p>Imagine trying to map out a massive 3D city onto a flat 2D piece of paper.</p>
      <ul>
        <li><strong>PCA (The Mapmaker):</strong> Takes a photo from an airplane. It creates a rigid, perfectly mathematical map. If you take the photo twice from the exact same spot, it looks identical every time.</li>
        <li><strong>t-SNE (The Tourist):</strong> Walks around the city and draws a map based on which buildings are next to each other. It's beautiful and colorful, but if they draw it twice, the map might look totally different!</li>
      </ul>
    </div>

    <div class="mode-tech">
      <p>In Sprint Exercise 5, we explored scRNA-seq (Genomics) data with thousands of features. We used Dimensionality Reduction to visualize it.</p>
      
      <div class="callout exam-trap">
        <div class="callout-icon">🚨</div>
        <div class="callout-content">
          <strong>Exam Trap: PCA vs t-SNE</strong>
          <p><strong>PCA</strong> is deterministic and linear. It focuses on preserving <em>global</em> structure (variance). Use it when you need to retain global interpretability.</p>
          <p><strong>t-SNE</strong> is stochastic (randomized) and non-linear. It focuses on preserving <em>local</em> neighborhoods. Run it twice, you get different plots.</p>
        </div>
      </div>

<pre><code class="language-python">from sklearn.decomposition import PCA
from sklearn.manifold import TSNE

# PCA: Deterministic, linear, preserves global variance
pca = PCA(n_components=2)
pca_result = pca.fit_transform(X_train_scaled)

# t-SNE: Stochastic, non-linear, preserves local neighbors
# We usually run PCA first to reduce to ~50 dims, then run t-SNE
tsne = TSNE(n_components=2, random_state=42)
tsne_result = tsne.fit_transform(pca_result)
</code></pre>
    </div>
  </section>

</div>
<script src="assets/site.js?v=9" defer></script>
</body>
</html>
"""

# Now we need to update chapter-2-overview.html, chapter-2-pandas.html, chapter-2-preprocessing.html, chapter-2-modelling.html, chapter-2-pca.html
# to include the chapter-2-exercise.html in the sidebar.
import glob
for f in glob.glob("chapter-2-*.html"):
    with open(f, 'r') as file:
        content = file.read()
    
    # Check if exercise is already in sidebar
    if 'chapter-2-exercise.html' not in content:
        # We find the place to insert it in the Module 2 sub-modules.
        content = re.sub(
            r'(<a href="chapter-2-pca.html"[^>]*>2.4 &middot; PCA &amp; t-SNE</a>)',
            r'\1\n          <a href="chapter-2-exercise.html">2.5 &middot; Sprint Exercise</a>',
            content
        )
        with open(f, 'w') as file:
            file.write(content)

with open("chapter-2-exercise.html", "w") as f:
    f.write(html_content)

