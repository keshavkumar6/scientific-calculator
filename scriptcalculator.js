const display = document.getElementById('display');
const buttons = document.querySelectorAll('button');
const themeSwitcher = document.getElementById('themeSwitcher');
const historyList = document.getElementById('historyList');

let expression = '';

// Handle button clicks
buttons.forEach(button => {
  const value = button.textContent;

  // Skip sci-fn, AC, ←, =
  if (!button.classList.contains('sci-fn') && !['AC', '←', '='].includes(value)) {
    button.addEventListener('click', () => {
      expression += value;
      display.value = expression;
    });
  }
});

// Handle keyboard input
document.addEventListener('keydown', (e) => {
  if ('0123456789+-*/().'.includes(e.key)) {
    expression += e.key;
    display.value = expression;
  } else if (e.key === 'Enter') {
    handleInput('=');
  } else if (e.key === 'Backspace') {
    handleInput('←');
  } else if (e.key === 'Escape') {
    handleInput('AC');
  }
});

// Handle AC, ←, =
buttons.forEach(button => {
  const value = button.textContent;
  if (['AC', '←', '='].includes(value)) {
    button.addEventListener('click', () => handleInput(value));
  }
});

// Main input handler
function handleInput(value) {
  if (value === 'AC') {
    expression = '';
    display.value = '';
  } else if (value === '←') {
    expression = expression.slice(0, -1);
    display.value = expression;
  } else if (value === '=') {
    if (expression.trim() === '') return;

    try {
      const fixedExpr = fixPercent(expression);
      const result = math.evaluate(fixedExpr).toString();
      animateDisplay(result);
      addToHistory(expression, result);
      expression = result;
      console.log(result)
    } catch {
      animateDisplay('Error');
      expression = '';
    }
  }
}

// Animate output
function animateDisplay(result) {
  display.value = '...';
  setTimeout(() => {
    display.value = result;
  }, 250);
}

// Add to history
function addToHistory(expr, res) {
  const li = document.createElement('li');
  li.textContent = `${expr} = ${res}`;
  historyList.prepend(li);
}

// Scientific buttons
document.querySelectorAll('.sci-fn').forEach(button => {
  button.addEventListener('click', () => {
    const fn = button.textContent;
    const val = parseFloat(display.value || expression || '0');

    let result;
    try {
      switch (fn) {
        case '√': result = math.sqrt(val); break;
        case 'x²': result = math.pow(val, 2); break;
        case 'xʸ':
          const y = prompt('Enter exponent (y):');
          result = math.pow(val, parseFloat(y)); break;
        case 'sin': result = math.sin(math.unit(val, 'deg')); break;
        case 'cos': result = math.cos(math.unit(val, 'deg')); break;
        case 'tan': result = math.tan(math.unit(val, 'deg')); break;
        case 'log': result = math.log10(val); break;
        case 'ln': result = math.log(val); break;
        case '%': result = val / 100; break;
        default: result = val;
      }

      animateDisplay(result.toString());
      addToHistory(`${fn}(${val})`, result.toString());
      expression = result.toString();
    } catch {
      animateDisplay('Error');
      expression = '';
    }
  });
});

// ✅ Fix % like a real calculator: 100 - 5% => 100 - (100 * 5 / 100)
function fixPercent(expr) {
  return expr.replace(
    /(\d+(?:\.\d+)?)(\s*[\+\-\*\/]\s*)(\d+(?:\.\d+)?)%/g,
    (_, a, op, b) => `${a}${op}(${a} * ${b} / 100)`
  );
}

// Dark mode toggle
if (themeSwitcher) {
  themeSwitcher.addEventListener('change', () => {
    document.body.classList.toggle('dark');
  });
}

