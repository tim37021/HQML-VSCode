// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as child_process from 'child_process';
import * as gzip from 'zlib';

const identifier_re = /(\w+)\s*{/gm;

const colorNames: Array<string> = [
	'aliceblue',
	'antiquewhite',
	'aqua',
	'aquamarine',
	'azure',
	'beige',
	'bisque',
	'black',
	'blanchedalmond',
	'blue',
	'blueviolet',
	'brown',
	'burlywood',
	'cadetblue',
	'chartreuse',
	'chocolate',
	'coral',
	'cornflowerblue',
	'cornsilk',
	'crimson',
	'cyan',
	'darkblue',
	'darkcyan',
	'darkgoldenrod',
	'darkgray',
	'darkgreen',
	'darkgrey',
	'darkkhaki',
	'darkmagenta',
	'darkolivegreen',
	'darkorange',
	'darkorchid',
	'darkred',
	'darksalmon',
	'darkseagreen',
	'darkslateblue',
	'darkslategray',
	'darkslategrey',
	'darkturquoise',
	'darkviolet',
	'deeppink',
	'deepskyblue',
	'dimgray',
	'dimgrey',
	'dodgerblue',
	'firebrick',
	'floralwhite',
	'forestgreen',
	'fuchsia',
	'gainsboro',
	'ghostwhite',
	'gold',
	'goldenrod',
	'gray',
	'grey',
	'green',
	'greenyellow',
	'honeydew',
	'hotpink',
	'indianred',
	'indigo',
	'ivory',
	'khaki',
	'lavender',
	'lavenderblush',
	'lawngreen',
	'lemonchiffon',
	'lightblue',
	'lightcoral',
	'lightcyan',
	'lightgoldenrodyellow',
	'lightgray',
	'lightgreen',
	'lightgrey',
	'lightpink',
	'lightsalmon',
	'lightseagreen',
	'lightskyblue',
	'lightslategray',
	'lightslategrey',
	'lightsteelblue',
	'lightyellow',
	'lime',
	'limegreen',
	'linen',
	'magenta',
	'maroon',
	'mediumaquamarine',
	'mediumblue',
	'mediumorchid',
	'mediumpurple',
	'mediumseagreen',
	'mediumslateblue',
	'mediumspringgreen',
	'mediumturquoise',
	'mediumvioletred',
	'midnightblue',
	'mintcream',
	'mistyrose',
	'moccasin',
	'navajowhite',
	'navy',
	'oldlace',
	'olive',
	'olivedrab',
	'orange',
	'orangered',
	'orchid',
	'palegoldenrod',
	'palegreen',
	'paleturquoise',
	'palevioletred',
	'papayawhip',
	'peachpuff',
	'peru',
	'pink',
	'plum',
	'powderblue',
	'purple',
	'red',
	'rosybrown',
	'royalblue',
	'saddlebrown',
	'salmon',
	'sandybrown',
	'seagreen',
	'seashell',
	'sienna',
	'silver',
	'skyblue',
	'slateblue',
	'slategray',
	'slategrey',
	'snow',
	'springgreen',
	'steelblue',
	'tan',
	'teal',
	'thistle',
	'tomato',
	'turquoise',
	'violet',
	'wheat',
	'white',
	'whitesmoke',
	'yellow',
	'yellowgreen',
	'transparent'
]


function getCurrentScope(doc: vscode.TextDocument, position: vscode.Position) {
	const remove_closing = doc.getText(new vscode.Range(new vscode.Position(0, 0), position)).replace(/{[^{}]*}/gm, '');
	let group = remove_closing.match(identifier_re);
	
	
	if(group != null) {
		group = identifier_re.exec(group[group.length-1]) as RegExpExecArray;
		return group[1];
	} else {
		return null;
	}

}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('"hqml" is now active!');

	

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.create', () => {
		// The code you place here will be executed every time your command is executed
		if(vscode.workspace.workspaceFolders !== undefined) {
			child_process.execSync(`wsl hqml create .`);
			// Display a message box to the user
			vscode.window.showInformationMessage('HQML project created!');
		} else {
			// Display a message box to the user
			vscode.window.showErrorMessage("Open an workspace for new HQML project")
		}
		
	});

	let disposable2 = vscode.commands.registerCommand('extension.build', () => {
		// The code you place here will be executed every time your command is executed
		if(vscode.workspace.workspaceFolders !== undefined) {
			child_process.execSync(`wsl hqml build`);
		}
		
	});

	let myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	myStatusBarItem.text = "fuck";
	myStatusBarItem.show();

	let provider = vscode.languages.registerCompletionItemProvider('qml', {provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
		//if(!document.lineAt(position).isEmptyOrWhitespace && document.lineAt(position).firstNonWhitespaceCharacterIndex==position.character-1)
		//{
			const scope = getCurrentScope(document, position);
			myStatusBarItem.text = scope as string;
			const python = vscode.workspace.getConfiguration("python").get("pythonPath");
			
			let classInfo = JSON.parse(child_process.execSync(`"${python}" provider.py ${scope}`, {cwd: vscode.workspace.rootPath}).toString());
			
			let ret = [];
			for(let x of classInfo.property) {
				ret.push(new vscode.CompletionItem(x.name, vscode.CompletionItemKind.Property));
			}
			for(let x of classInfo.signal) {
				ret.push(new vscode.CompletionItem('on'+x[0].toUpperCase()+x.substr(1), vscode.CompletionItemKind.Method));
			}
			return ret;
		//} else {
		//	return [];
		//}
	}}, '\n');

	let provider2 = vscode.languages.registerCompletionItemProvider('qml', {provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {

		const scope = getCurrentScope(document, position);
		myStatusBarItem.text = scope as string;
		const python = vscode.workspace.getConfiguration("python").get("pythonPath");
		
		let classInfo = JSON.parse(child_process.execSync(`"${python}" provider.py ${scope}`, {cwd: vscode.workspace.rootPath}).toString());
		const match = (document.lineAt(position).text.match('[a-zA-Z0-9_]+\W*:') as string[])[0];
		const prop = classInfo.property.filter((v: any) => {
			return v.name==match.substr(0, match.length-1);
		});
		
		const ret = [];
		if(prop.length>0 && prop[0].type == 'color') {
			for(let value of colorNames) {
				ret.push(new vscode.CompletionItem(`"${value}"`, vscode.CompletionItemKind.Color));
			}
		}
		return ret;

	}}, ':', '"');

	// handle assignment
	let provider3 = vscode.languages.registerCompletionItemProvider('qml', {provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {

		const scope = getCurrentScope(document, position);
		myStatusBarItem.text = scope as string;
		const python = vscode.workspace.getConfiguration("python").get("pythonPath");
		
		let classInfo = JSON.parse(child_process.execSync(`"${python}" provider.py ${scope}`, {cwd: vscode.workspace.rootPath}).toString());
		const match = (document.lineAt(position).text.match('[a-zA-Z0-9_]+\W*.') as string[])[0];
		const prop = classInfo.property.filter((v: any) => {
			return v.name==match.substr(0, match.length-1);
		});
		
		const ret = [];
		
		// check if the first character of type is uppercase
		if(prop.length>0 && prop[0].type[0].toUpperCase() == prop[0].type[0]) {
			let classInfo2 = JSON.parse(child_process.execSync(`"${python}" provider.py ${prop[0].type}`, {cwd: vscode.workspace.rootPath}).toString());
			for(let x of classInfo2.property) {
				ret.push(new vscode.CompletionItem(x.name, vscode.CompletionItemKind.Property));
			}
		}
		return ret;

	}}, '.');
	


	context.subscriptions.push(myStatusBarItem);
	context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection((e: vscode.TextEditorSelectionChangeEvent)=> {
		const editor = e.textEditor;
		if(editor.selection.isSingleLine) {
			const scope = getCurrentScope(editor.document, e.selections[0].start);
			myStatusBarItem.text = scope as string;
		}
		
	}));
	context.subscriptions.push(disposable, disposable2, provider, provider2);
}

// this method is called when your extension is deactivated
export function deactivate() {}
