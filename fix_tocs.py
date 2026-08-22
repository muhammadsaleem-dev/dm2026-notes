import re

full_toc = """      <a href="#visual-recap"><span class="toc-num">0</span>Visual Storyboard</a>
      <a href="#framing"><span class="toc-num">1</span>Framing: NNs as Generalized Regression</a>
      <a href="#linear-regression"><span class="toc-num">2</span>Linear Regression, Properly</a>
      <a href="#gradient-descent"><span class="toc-num">3</span>Gradient Descent</a>
      <a href="#logistic-regression"><span class="toc-num">4</span>Logistic Regression → One Neuron</a>
      <a href="#building-the-network"><span class="toc-num">5</span>Building the Network</a>
      <a href="#hyperparameters"><span class="toc-num">6</span>Hyperparameters, Activations &amp; Training Difficulty</a>
      <a href="#gd-at-scale"><span class="toc-num">7</span>Gradient Descent at Scale</a>
      <a href="#exercises"><span class="toc-num">8</span>Sprint Exercises</a>
      <a href="#test-yourself"><span class="toc-num">9</span>Test Yourself</a>
      <a href="#knowledge-drill"><span class="toc-num">10</span>Knowledge Drill</a>"""

overview_toc = """      <a href="#visual-recap"><span class="toc-num">0</span>Visual Storyboard</a>"""

regression_toc = """      <a href="#framing"><span class="toc-num">1</span>Framing: NNs as Generalized Regression</a>
      <a href="#linear-regression"><span class="toc-num">2</span>Linear Regression, Properly</a>
      <a href="#gradient-descent"><span class="toc-num">3</span>Gradient Descent</a>
      <a href="#logistic-regression"><span class="toc-num">4</span>Logistic Regression → One Neuron</a>"""

nn_toc = """      <a href="#building-the-network"><span class="toc-num">5</span>Building the Network</a>
      <a href="#hyperparameters"><span class="toc-num">6</span>Hyperparameters, Activations &amp; Training Difficulty</a>"""

training_toc = """      <a href="#gd-at-scale"><span class="toc-num">7</span>Gradient Descent at Scale</a>
      <a href="#exercises"><span class="toc-num">8</span>Sprint Exercises</a>
      <a href="#test-yourself"><span class="toc-num">9</span>Test Yourself</a>
      <a href="#knowledge-drill"><span class="toc-num">10</span>Knowledge Drill</a>"""

def replace_toc(filepath, new_toc):
    with open(filepath, 'r') as f:
        content = f.read()
    
    content = content.replace(full_toc, new_toc)
    
    with open(filepath, 'w') as f:
        f.write(content)

replace_toc("chapter-5-overview.html", overview_toc)
replace_toc("chapter-5-regression.html", regression_toc)
replace_toc("chapter-5-neural-networks.html", nn_toc)
replace_toc("chapter-5-training.html", training_toc)

print("Done")
