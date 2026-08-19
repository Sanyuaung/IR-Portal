const fs = require('fs');
let content = fs.readFileSync('src/pages/LoginPage.tsx', 'utf8');

// The naive replace of </Button> is bad. Let's do it right.
// We want to turn <Button type="button" ... > ... </Button> into <button type="button" ... > ... </button>
// Since JSX can span multiple lines, we can use a regex.

content = content.replace(/<Button([^>]*?type="button"[^>]*?)>([\s\S]*?)<\/Button>/g, '<button$1>$2</button>');
content = content.replace(/<Button([^>]*?onClick=\{.*?type="button"[^>]*?)>([\s\S]*?)<\/Button>/g, '<button$1>$2</button>');

// Let's do a more robust approach: Find all <Button and match their closing tags, if it has type="button", replace with button.
let result = '';
let i = 0;
while (i < content.length) {
    let match = content.substring(i).match(/<Button/);
    if (!match) {
        result += content.substring(i);
        break;
    }
    
    let startIndex = i + match.index;
    result += content.substring(i, startIndex);
    
    // find end of opening tag
    let endOfOpening = content.indexOf('>', startIndex);
    let openingTag = content.substring(startIndex, endOfOpening + 1);
    
    // find matching closing tag
    // simple heuristic: find next </Button>
    let closingTagIndex = content.indexOf('</Button>', endOfOpening);
    let innerContent = content.substring(endOfOpening + 1, closingTagIndex);
    
    if (openingTag.includes('type="button"')) {
        result += '<button' + openingTag.substring(7);
        result += innerContent;
        result += '</button>';
    } else {
        result += openingTag;
        result += innerContent;
        result += '</Button>';
    }
    
    i = closingTagIndex + 9;
}

fs.writeFileSync('src/pages/LoginPage.tsx', result);
