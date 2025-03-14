import * as vscode from 'vscode';

export function getConfiguration() {
  return vscode.workspace.getConfiguration('aiContextualLinking');
} 