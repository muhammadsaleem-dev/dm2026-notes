const fs = require('fs');
const path = require('path');

function processNotebook(filename, outFilename) {
    const data = fs.readFileSync(filename, 'utf-8');
    const notebook = JSON.parse(data);
    
    let newCells = [];
    let skipNext = false;
    
    for (let i = 0; i < notebook.cells.length; i++) {
        let cell = notebook.cells[i];
        
        if (skipNext) {
            if (cell.cell_type === 'code') {
                cell.source = ["# Write your code here\n"];
                cell.outputs = [];
                cell.execution_count = null;
            } else if (cell.cell_type === 'markdown') {
                cell.source = ["*Write your answer here*"];
            }
            newCells.push(cell);
            skipNext = false;
            continue;
        }
        
        let isLabel = false;
        if (cell.cell_type === 'markdown' && cell.source) {
            let src = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
            if (src.includes('pp-solution-label') || src.includes('Official solution')) {
                isLabel = true;
            }
        }
                      
        if (isLabel) {
            skipNext = true;
            continue;
        }
        
        newCells.push(cell);
    }
    
    notebook.cells = newCells;
    
    if (notebook.cells[0] && notebook.cells[0].cell_type === 'markdown') {
        let src = Array.isArray(notebook.cells[0].source) ? notebook.cells[0].source : [notebook.cells[0].source];
        src[0] = src[0].replace('Past Papers + Bootcamp Notes — Single Offline Reference', 'Exam Simulator — Practice Mode');
        if (src.length > 2) {
            src[2] = "**Exam Simulation Mode:** All official solutions have been removed. Fill in the blanks!\\n\\n";
        }
        notebook.cells[0].source = src;
    }
    
    fs.writeFileSync(outFilename, JSON.stringify(notebook, null, 1));
    console.log(`Generated ${outFilename}`);
}

const dir = '../private-study/past-papers-with-notes';
processNotebook(path.join(dir, 'past-paper-2025.ipynb'), path.join(dir, 'Exam-Simulator-2025.ipynb'));
processNotebook(path.join(dir, 'past-paper-2026.ipynb'), path.join(dir, 'Exam-Simulator-2026.ipynb'));
