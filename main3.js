
const precedence = { '+': 1, '-': 1, '*': 2, '/': 2 };


function tokenize(expression) {
    const tokens = [];
    let i = 0;

    while (i < expression.length) {
        const ch = expression[i];

        if (ch === ' ') { i++; continue; }

        if ((ch >= '0' && ch <= '9') || ch === '.') {
            let num = '';
            while (i < expression.length &&
                   ((expression[i] >= '0' && expression[i] <= '9') || expression[i] === '.')) {
                num += expression[i];
                i++;
            }
            tokens.push({ type: 'number', value: parseFloat(num) });
            continue;
        }

        if (ch in precedence) {
            tokens.push({ type: 'operator', value: ch });
        } else if (ch === '(') {
            tokens.push({ type: 'lparen', value: ch });
        } else if (ch === ')') {
            tokens.push({ type: 'rparen', value: ch });
        } else {
            throw new Error(`Невідомий символ: "${ch}"`);
        }

        i++;
    }
    return tokens;
}

function shuntingYard(tokens) {
    const outputQueue = [];   
    const operatorStack = []; 
    for (const token of tokens) {

        if (token.type === 'number') {
            outputQueue.push(token);

        } else if (token.type === 'operator') {
            while (
                operatorStack.length > 0 &&
                operatorStack[operatorStack.length - 1].type === 'operator' &&
                precedence[operatorStack[operatorStack.length - 1].value] >= precedence[token.value]
            ) {
                outputQueue.push(operatorStack.pop());
            }
            operatorStack.push(token);

        } else if (token.type === 'lparen') {
            operatorStack.push(token);

        } else if (token.type === 'rparen') {
            while (operatorStack.length > 0 &&
                   operatorStack[operatorStack.length - 1].type !== 'lparen') {
                outputQueue.push(operatorStack.pop());
            }
            if (operatorStack.length === 0) {
                throw new Error('Помилка: зайва закриваюча дужка )');
            }
            operatorStack.pop();
        }
    }

    while (operatorStack.length > 0) {
        const op = operatorStack.pop();
        if (op.type === 'lparen') throw new Error('Помилка: незакрита дужка (');
        outputQueue.push(op);
    }

    return outputQueue;
}


function evaluateRPN(rpnTokens) {
    const stack = []; 

    for (const token of rpnTokens) {
        if (token.type === 'number') {
            stack.push(token.value); 

        } else if (token.type === 'operator') {
            if (stack.length < 2) throw new Error('Помилка: некоректний вираз');

            const b = stack.pop(); 
            const a = stack.pop(); 

            let res;
            switch (token.value) {
                case '+': res = a + b; break;
                case '-': res = a - b; break;
                case '*': res = a * b; break;
                case '/':
                    if (b === 0) throw new Error('Помилка: ділення на нуль!');
                    res = a / b;
                    break;
            }
            stack.push(res); 
        }
    }

    if (stack.length !== 1) throw new Error('Помилка: некоректний вираз');
    return stack[0];
}


function calculate(expression) {
    if (!expression.trim()) throw new Error('Введіть вираз');

    const tokens = tokenize(expression);
    const rpn = shuntingYard(tokens);
    const result = evaluateRPN(rpn);
    return { tokens, rpn, result };
}


function handleCalculate() {
    const input = document.getElementById('exprInput').value;
    const resultArea = document.getElementById('resultArea');
    const errorArea = document.getElementById('errorArea');

    resultArea.style.display = 'none';
    errorArea.style.display = 'none';

    try {
        const { tokens, rpn, result } = calculate(input);

        document.getElementById('stepTokens').textContent =
            tokens.map(t => t.value).join('  ');

        document.getElementById('stepRPN').textContent =
            rpn.map(t => t.value).join('  ');

        const num = parseFloat(result.toFixed(10));
        document.getElementById('stepResult').textContent = num;

        resultArea.style.display = 'block';


    } catch (e) {
        document.getElementById('errorMsg').textContent = e.message;
        errorArea.style.display = 'flex';
    }
}

function setExample(expr) {
    document.getElementById('exprInput').value = expr;
    handleCalculate();
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('exprInput').addEventListener('keydown', e => {
        if (e.key === 'Enter') handleCalculate();
    });

    setExample('3 + 4 * 2');
});

