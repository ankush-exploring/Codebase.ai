import { parse } from '@babel/parser';
import traverse from '@babel/traverse';

interface ExtractedMetadata {
  functions: { name: string; startLine: number; endLine: number; params: string[] }[];
  classes: { name: string; startLine: number; endLine: number; methods: string[] }[];
  imports: { source: string; specifiers: string[] }[];
  exports: { name: string; type: string }[];
  comments: { type: string; value: string; line: number }[];
}

function getLine(code: string, start: number): number {
  let line = 1;
  for (let i = 0; i < start && i < code.length; i++) {
    if (code[i] === '\n') line++;
  }
  return line;
}

function extractParams(params: any[]): string[] {
  return params.map((p) => {
    if (p.type === 'Identifier') return p.name;
    if (p.type === 'AssignmentPattern' && p.left?.name) return p.left.name;
    if (p.type === 'RestElement' && p.argument?.name) return `...${p.argument.name}`;
    if (p.type === 'ObjectPattern') return '{...}';
    if (p.type === 'ArrayPattern') return '[...]';
    return 'unknown';
  });
}

export function parseJsTs(content: string, filePath: string): ExtractedMetadata {
  const isJsx = /\.(jsx|tsx)$/.test(filePath);
  const isTypeScript = /\.tsx?$/.test(filePath);

  const plugins: any[] = ['jsx'];
  if (isTypeScript) plugins.push('typescript');

  let ast;
  try {
    ast = parse(content, {
      sourceType: 'module',
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true,
      plugins,
      errorRecovery: true,
    });
  } catch {
    return { functions: [], classes: [], imports: [], exports: [], comments: [] };
  }

  const functions: ExtractedMetadata['functions'] = [];
  const classes: ExtractedMetadata['classes'] = [];
  const imports: ExtractedMetadata['imports'] = [];
  const exports: ExtractedMetadata['exports'] = [];
  const comments: ExtractedMetadata['comments'] = [];

  traverse(ast, {
    FunctionDeclaration(path) {
      const node = path.node;
      if (node.id?.name) {
        functions.push({
          name: node.id.name,
          startLine: getLine(content, node.start ?? 0),
          endLine: getLine(content, node.end ?? 0),
          params: extractParams(node.params),
        });
      }
    },
    FunctionExpression(path) {
      const node = path.node;
      if (node.id?.name) {
        functions.push({
          name: node.id.name,
          startLine: getLine(content, node.start ?? 0),
          endLine: getLine(content, node.end ?? 0),
          params: extractParams(node.params),
        });
      }
    },
    ArrowFunctionExpression(path) {
      const node = path.node;
      const parent = path.parent;
      let name = 'anonymous';
      if (parent.type === 'VariableDeclarator' && parent.id.type === 'Identifier') {
        name = parent.id.name;
      } else if (parent.type === 'AssignmentExpression' && parent.left.type === 'Identifier') {
        name = parent.left.name;
      } else if (parent.type === 'ExportDefaultDeclaration') {
        name = 'default';
      }
      functions.push({
        name,
        startLine: getLine(content, node.start ?? 0),
        endLine: getLine(content, node.end ?? 0),
        params: extractParams(node.params),
      });
    },
    ClassDeclaration(path) {
      const node = path.node;
      if (node.id?.name) {
        const methods = node.body.body
          .filter((m: any) => m.type === 'ClassMethod' || m.type === 'ClassProperty')
          .map((m: any) => m.key?.name || m.key?.value || 'unknown');
        classes.push({
          name: node.id.name,
          startLine: getLine(content, node.start ?? 0),
          endLine: getLine(content, node.end ?? 0),
          methods,
        });
      }
    },
    ImportDeclaration(path) {
      const node = path.node;
      const source = node.source.value;
      const specifiers = node.specifiers.map((s: any) => {
        if (s.type === 'ImportDefaultSpecifier') return 'default';
        if (s.type === 'ImportNamespaceSpecifier') return '*';
        return s.imported?.name || s.local?.name || 'unknown';
      });
      imports.push({ source, specifiers });
    },
    ExportNamedDeclaration(path) {
      const node = path.node;
      if (node.declaration) {
        if (node.declaration.type === 'FunctionDeclaration' && node.declaration.id?.name) {
          exports.push({ name: node.declaration.id.name, type: 'function' });
        } else if (node.declaration.type === 'ClassDeclaration' && node.declaration.id?.name) {
          exports.push({ name: node.declaration.id.name, type: 'class' });
        }
      }
      node.specifiers?.forEach((s: any) => {
        exports.push({ name: s.exported?.name || s.local?.name || 'unknown', type: 'named' });
      });
    },
    ExportDefaultDeclaration(path) {
      const node = path.node;
      const name = node.declaration?.id?.name || 'default';
      exports.push({ name, type: 'default' });
    },
  });

  return { functions, classes, imports, exports, comments };
}