#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import ts from 'typescript';

const WEB_SRC = path.resolve('apps/web/src');

let totalIssues = 0;

function getFiles(dir) {
  const result = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === 'ui') continue;
      result.push(...getFiles(fullPath));
      continue;
    }

    if (path.extname(fullPath) === '.tsx') {
      result.push(fullPath);
    }
  }

  return result;
}

function getLine(sourceFile, position) {
  return sourceFile.getLineAndCharacterOfPosition(position).line + 1;
}

function looksLikeUiText(text) {
  const value = text.trim();

  if (!value) return false;

  /*
   * Ignore strings that contain no letters.
   *
   * Examples:
   *   "123"
   *   "—"
   *   "🚀"
   */
  if (!/[A-Za-zÀ-ÿ\u4e00-\u9fff]/.test(value)) {
    return false;
  }

  /*
   * Ignore known project / technical words.
   */
  const ignored = new Set([
    'transcendence',
    'ft_transcendence',
  ]);

  if (ignored.has(value)) {
    return false;
  }

  return true;
}

function isTranslationCall(node) {
  if (!ts.isCallExpression(node)) {
    return false;
  }

  const expression = node.expression;

  /*
   * t('...')
   */
  if (ts.isIdentifier(expression)) {
    return expression.text === 't';
  }

  /*
   * i18n.t('...')
   */
  if (ts.isPropertyAccessExpression(expression)) {
    return (
      expression.name.text === 't' &&
      ts.isIdentifier(expression.expression) &&
      expression.expression.text === 'i18n'
    );
  }

  return false;
}

function isInsideJsxAttribute(node) {
  let current = node.parent;

  while (current) {
    if (ts.isJsxAttribute(current)) {
      return true;
    }

    /*
     * Once we reach a JSX element, we can stop.
     */
    if (
      ts.isJsxElement(current) ||
      ts.isJsxSelfClosingElement(current) ||
      ts.isJsxFragment(current)
    ) {
      return false;
    }

    current = current.parent;
  }

  return false;
}

function isLikelyUiString(node) {
  if (
    !ts.isStringLiteral(node) &&
    !ts.isNoSubstitutionTemplateLiteral(node)
  ) {
    return false;
  }

  /*
   * Never inspect JSX attributes.
   *
   * Example:
   *
   * variant="secondary"
   * className="..."
   * type="submit"
   */
  if (isInsideJsxAttribute(node)) {
    return false;
  }

  const value = node.text.trim();

  if (!looksLikeUiText(value)) {
    return false;
  }

  const parent = node.parent;

  /*
   * t('...')
   */
  if (isTranslationCall(parent)) {
    return false;
  }

  /*
   * Import paths.
   *
   * import foo from './foo'
   */
  if (
    ts.isImportDeclaration(parent) ||
    ts.isExportDeclaration(parent)
  ) {
    return false;
  }

  /*
   * Object property values are not necessarily UI text.
   *
   * {
   *   variant: 'secondary'
   * }
   */
  if (
    ts.isPropertyAssignment(parent) &&
    parent.initializer === node
  ) {
    return false;
  }

  /*
   * Object keys.
   */
  if (
    ts.isPropertyAssignment(parent) &&
    parent.name === node
  ) {
    return false;
  }

  /*
   * Property access:
   *
   * foo['bar']
   */
  if (ts.isElementAccessExpression(parent)) {
    return false;
  }

  return true;
}

function report(filePath, sourceFile, node, message) {
  const relativePath = path.relative(process.cwd(), filePath);
  const line = getLine(sourceFile, node.getStart(sourceFile));

  console.log(`${relativePath}:${line}: ${message}`);

  totalIssues += 1;
}

function inspectFile(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');

  const sourceFile = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );

  function inspectExpression(node) {
    /*
     * --------------------------------------------------
     * Direct JSX expression string
     *
     * {'Hello'}
     * --------------------------------------------------
     */
    if (isLikelyUiString(node)) {
      report(
        filePath,
        sourceFile,
        node,
        `hardcoded JSX expression: "${node.text}"`,
      );

      return;
    }

    /*
     * --------------------------------------------------
     * Conditional expression
     *
     * {loading ? 'Loading...' : 'Submit'}
     * --------------------------------------------------
     */
    if (ts.isConditionalExpression(node)) {
      inspectExpression(node.whenTrue);
      inspectExpression(node.whenFalse);
      return;
    }

    /*
     * --------------------------------------------------
     * Logical AND
     *
     * {error && 'Something went wrong'}
     * --------------------------------------------------
     */
    if (
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind ===
        ts.SyntaxKind.AmpersandAmpersandToken
    ) {
      inspectExpression(node.right);
      return;
    }

    /*
     * --------------------------------------------------
     * Parenthesized expression
     * --------------------------------------------------
     */
    if (ts.isParenthesizedExpression(node)) {
      inspectExpression(node.expression);
      return;
    }

    /*
     * --------------------------------------------------
     * Nullish coalescing
     *
     * {name ?? 'Unknown'}
     * --------------------------------------------------
     */
    if (
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind ===
        ts.SyntaxKind.QuestionQuestionToken
    ) {
      inspectExpression(node.right);
      return;
    }

    /*
     * --------------------------------------------------
     * Template literal without interpolation
     *
     * {`Hello`}
     * --------------------------------------------------
     */
    if (ts.isNoSubstitutionTemplateLiteral(node)) {
      if (looksLikeUiText(node.text)) {
        report(
          filePath,
          sourceFile,
          node,
          `hardcoded JSX expression: "${node.text}"`,
        );
      }
    }
  }

  function visit(node) {
    /*
     * --------------------------------------------------
     * JSX text
     *
     * <p>Hello</p>
     * --------------------------------------------------
     */
    if (ts.isJsxText(node)) {
      const text = node.text.replace(/\s+/g, ' ').trim();

      if (looksLikeUiText(text)) {
        report(
          filePath,
          sourceFile,
          node,
          `hardcoded JSX text: "${text}"`,
        );
      }
    }

    /*
     * --------------------------------------------------
     * JSX expression
     *
     * {condition ? 'A' : 'B'}
     * --------------------------------------------------
     */
    if (ts.isJsxExpression(node) && node.expression) {
      inspectExpression(node.expression);
    }

    ts.forEachChild(node, visit);
  }

  ts.forEachChild(sourceFile, visit);
}

const files = getFiles(WEB_SRC);

for (const file of files) {
  inspectFile(file);
}

process.exitCode = totalIssues > 0 ? 1 : 0;