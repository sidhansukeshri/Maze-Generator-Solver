// Maze dimensions
const rows = 15;
const cols = 15;

// Maze grid
let maze = [];
let entryPoint = [0, 0];
let exitPoint = [rows - 1, cols - 1];

// Binary Tree structure
class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

let binaryTree = null;
let solvingIntervalId = null; // Interval ID for solving animation

// Generate empty maze grid
function initMaze() {
  maze = Array(rows).fill().map(() => Array(cols).fill(true));
}

// Recursive Backtracking Maze Generation
function generateMaze() {
  // Clear any running solver intervals and reset solving flag
  clearInterval(solvingIntervalId);
  solvingInProgress = false;

  initMaze();

  function carvePassages(row, col) {
    maze[row][col] = false;

    const directions = shuffle([[0, -1], [0, 1], [-1, 0], [1, 0]]);
    for (const [dx, dy] of directions) {
      const newRow = row + 2 * dy;
      const newCol = col + 2 * dx;
      if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols && maze[newRow][newCol]) {
        maze[row + dy][col + dx] = false;
        carvePassages(newRow, newCol);
      }
    }
  }

  carvePassages(0, 0);

  // Set entry and exit points
  maze[entryPoint[0]][entryPoint[1]] = false;
  maze[exitPoint[0]][exitPoint[1]] = false;

  binaryTree = null; // Reset binary tree
  displayMaze();
}

let solvingInProgress = false; // Flag to track solver status

// Depth-First Search Maze Solving with Backtracking
function solveMaze() {
  if (solvingInProgress) {
    console.log("Solver is already running.");
    return;
  }

  solvingInProgress = true; // Set solver flag to true
  const visited = Array(rows).fill().map(() => Array(cols).fill(false));
  const path = [];

  function dfs(row, col) {
    if (row < 0 || row >= rows || col < 0 || col >= cols || maze[row][col] || visited[row][col]) return false;
    visited[row][col] = true;
    path.push([row, col]);

    if (row === exitPoint[0] && col === exitPoint[1]) return true;

    const directions = shuffle([[0, -1], [0, 1], [-1, 0], [1, 0]]);
    for (const [dx, dy] of directions) {
      if (dfs(row + dy, col + dx)) {
        return true;
      }
    }

    // Backtrack if no valid path found
    path.pop();
    return false;
  }

  if (dfs(entryPoint[0], entryPoint[1])) {
    animateSolution(path);
  } else {
    document.getElementById('move-explanation').textContent = 'No solution found.';
    solvingInProgress = false; // Reset solver flag
  }
}

// Display the maze
function displayMaze(traveledPath = []) {
  const mazeContainer = document.getElementById('maze-container');
  mazeContainer.innerHTML = '';

  const table = document.createElement('table');
  for (let i = 0; i < rows; i++) {
    const row = document.createElement('tr');
    for (let j = 0; j < cols; j++) {
      const cell = document.createElement('td');
      cell.classList.add(maze[i][j] ? 'wall' : 'path');
      if (i === entryPoint[0] && j === entryPoint[1]) {
        cell.classList.add('entry');
      } else if (i === exitPoint[0] && j === exitPoint[1]) {
        cell.classList.add('exit');
      } else if (traveledPath.some(([r, c]) => r === i && c === j)) {
        cell.classList.add('traveled-path');
      }
      row.appendChild(cell);
    }
    table.appendChild(row);
  }
  mazeContainer.appendChild(table);
}

// Animate the solution path
function animateSolution(path) {
  const explanationDiv = document.getElementById('move-explanation');
  explanationDiv.innerHTML = '';

  let index = 0;
  binaryTree = null; // Reset binary tree
  binaryTree = buildBinaryTree(path, binaryTree); // Build binary tree
  displayBinaryTree(binaryTree); // Display binary tree

  solvingIntervalId = setInterval(() => {
    if (index < path.length - 1) {
      const [row, col] = path[index];
      const [nextRow, nextCol] = path[index + 1];
      let explanation = '';
      if (nextRow === row - 1) {
        explanation = 'Moving up';
      } else if (nextRow === row + 1) {
        explanation = 'Moving down';
      } else if (nextCol === col - 1) {
        explanation = 'Moving left';
      } else if (nextCol === col + 1) {
        explanation = 'Moving right';
      }
      explanationDiv.textContent = `${explanation}`;
      displayMaze(path.slice(0, index + 1));
      index++;
    } else {
      clearInterval(solvingIntervalId);
      explanationDiv.textContent = 'Maze solved!';
      solvingInProgress = false; // Reset solver flag
    }
  }, 300); // Change speed here (milliseconds per move)
}

// Build binary tree based on solution path
function buildBinaryTree(path, root) {
  for (const [row, col] of path) {
    const newNode = new TreeNode(`(${row}, ${col})`);
    root = insertNode(root, newNode);
  }
  return root;
}

// Insert node into binary tree
function insertNode(root, newNode) {
  if (root === null) {
    return newNode;
  } else {
    if (newNode.value < root.value) {
      root.left = insertNode(root.left, newNode);
    } else {
      root.right = insertNode(root.right, newNode);
    }
    return root;
  }
}

// Display binary tree using Vis.js
function displayBinaryTree(root) {
  const binaryTreeContainer = document.getElementById('binary-tree');
  binaryTreeContainer.innerHTML = '';

  const nodes = [];
  const edges = [];
  const queue = [root];

  while (queue.length > 0) {
    const node = queue.shift();
    nodes.push({ id: node.value, label: node.value });

    if (node.left) {
      edges.push({ from: node.value, to: node.left.value });
      queue.push(node.left);
    }
    if (node.right) {
      edges.push({ from: node.value, to: node.right.value });
      queue.push(node.right);
    }
  }

  const treeData = {
    nodes: nodes,
    edges: edges
  };

  const options = {
    layout: {
      hierarchical: {
        direction: 'UD'
      }
    }
  };

  const network = new vis.Network(binaryTreeContainer, treeData, options);
}

// Shuffle array function
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Initial display
generateMaze();
