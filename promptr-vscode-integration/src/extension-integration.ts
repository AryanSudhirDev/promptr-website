import * as vscode from 'vscode';
import { checkUserAccess, setExtensionContext, enterAccessTokenCommand } from './token-auth';

export function activate(context: vscode.ExtensionContext) {
  // Set the extension context for auth module
  setExtensionContext(context);

  // Your existing command registrations...
  
  // MODIFY your existing generatePrompt command to include auth check
  const generatePromptCommand = vscode.commands.registerCommand('promptr.generatePrompt', async () => {
    // Check authentication first
    const hasAccess = await checkUserAccess();
    if (!hasAccess) {
      return; // User was already notified of the issue
    }

    // Your existing generatePrompt logic here...
    vscode.window.showInformationMessage('✨ Promptr access verified! Processing prompt...');
    
    // TODO: Add your existing prompt generation logic here
    // Example:
    // const editor = vscode.window.activeTextEditor;
    // if (editor) {
    //   const selection = editor.selection;
    //   const text = editor.document.getText(selection);
    //   // Process with your AI logic...
    // }
  });

  // MODIFY your existing enterAccessToken command
  const enterTokenCommand = vscode.commands.registerCommand('promptr.enterAccessToken', async () => {
    await enterAccessTokenCommand();
  });

  // Your other existing commands...
  const setTemperatureCommand = vscode.commands.registerCommand('promptr.setTemperature', async () => {
    // Your existing setTemperature logic...
  });

  const setCustomContextCommand = vscode.commands.registerCommand('promptr.setCustomContext', async () => {
    // Your existing setCustomContext logic...
  });

  // Register all commands
  context.subscriptions.push(
    generatePromptCommand,
    enterTokenCommand,
    setTemperatureCommand,
    setCustomContextCommand
  );

  // Optional: Auto-validate on startup if configured
  const config = vscode.workspace.getConfiguration('promptr');
  if (config.get('autoValidate', true)) {
    // Silently check access on startup (don't show errors)
    checkUserAccess().catch(() => {
      // Silently fail - user will be prompted when they use commands
    });
  }
}

export function deactivate() {
  // Your existing deactivation logic...
}

// Additional helper function you can use in your commands
export async function ensureAuthenticated(): Promise<boolean> {
  return await checkUserAccess();
}

/*
USAGE EXAMPLES:

// In any of your command handlers:
const hasAccess = await ensureAuthenticated();
if (!hasAccess) {
  return; // Stop execution, user was notified
}

// Continue with your logic...
*/ 