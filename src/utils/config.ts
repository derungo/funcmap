import * as vscode from 'vscode';

// @ai-link name=getConfiguration
// @ai-depends on=vscode.workspace.getConfiguration
// @ai-related vscode.WorkspaceConfiguration
// @ai-exec configuration,utility
export function getConfiguration() {
  return vscode.workspace.getConfiguration('funcmap');
} 