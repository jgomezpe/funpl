/**
*
* funplIDE.js
* <P>Java Script defining the IDE of a FunPL (Functional/Logic Programming Language).</P>
* <P> requires base64.js, kompari.js, lifya.js, and jxon.js (jxon_wrap.js). </P>
* <P>A numtseng module <A HREF="https://numtseng.com/modules/funplIDE.js">https://numtseng.com/modules/funplIDE.js</A> 
*
* Copyright (c) 2021 by Jonatan Gomez-Perdomo. <br>
* All rights reserved. See <A HREF="https://github.com/jgomezpe/funpl">License</A>. <br>
*
* @author <A HREF="https://disi.unal.edu.co/~jgomezpe/"> Professor Jonatan Gomez-Perdomo </A>
* (E-mail: <A HREF="mailto:jgomezpe@unal.edu.co">jgomezpe@unal.edu.co</A> )
* @version 1.0
*/

/**
*
* python.js
* <P>A client for a Python server (See <A HREF="https://github.com/jgomezpe/aplikigo">aplikigo</A> package) </P>
* <P>Requires Konekti.js, and finapunkto.js </P>
* <P>A numtseng module <A HREF="https://numtseng.com/modules/python.js">https://numtseng.com/modules/python.js</A> 
* Copyright (c) 2021 by Jonatan Gomez-Perdomo. <br>
* All rights reserved. See <A HREF="https://github.com/jgomezpe/python">License</A>. <br>
*
* @author <A HREF="https://disi.unal.edu.co/~jgomezpe/"> Professor Jonatan Gomez-Perdomo </A>
* (E-mail: <A HREF="mailto:jgomezpe@unal.edu.co">jgomezpe@unal.edu.co</A> )
* @version 1.0
*/

/*
 *
 * A client for a Python server
 */  
class FunPLPlugin extends PlugIn{
	constructor(){ super('funpl') }

	/**
	 * Creates a FunPL client object
	 * @param parent Parent component 
	 * @param id GUI's id,
	 * @param width Width of the component
	 * @param height Height of the component
	 * @param type If component will be displayed as a row ('row') or as a column ('col') 
	 * @param mode Programming language mode 
	 * @param code ACE code for syntax highlighting the programming language
	 * @param api Programming language API
	 * @param render Programming language render component
	 * @param config Component configuration
	 */
	setup(parent, id, type, mode, code, api, render, config={}){
		var editor = {'plugin':'ace', 'setup':[id+'Coder', '', mode, 'eclipse', code, {'style':'width:100%;height:100%;'}]}
		var term ={'plugin':'latex', 'setup':[id+'Console', '', {'style':'width:100%;height:100%;'}]}
		var one = {'plugin':'split', 'setup':[id+'One', 'row', 70, editor, term, {'style':'width:100%;height:100%;'}]}
		
		var btn=[
			{'plugin':'btn', 'setup':["remnants","fa-th", '', {'client':id}]},
			{'plugin':'btn', 'setup':["primitives","fa-magic", '', {'client':id}]},
			{'plugin':'btn', 'setup':["compile","fa-gear", '', {'client':id}]},
			{'plugin':'btn', 'setup':["run","fa-play", '', {'client':id}]},
			{'plugin':'btn', 'setup':["apply","fa-repeat", '', {'client':id}]}
		]
		var navbar = {'plugin':'navbar', 'setup':['funpl-navbar', btn, '', {'class':'w3-blue-grey'}]} 
		var command = {'plugin':'ace', 'setup':[id+'Command', '', mode, 'eclipse', code, {'style':'width:100%;height:100%;'}]}
		var split2 = {'plugin':'split', 'setup':[id+'Split2', 'row', 85, render, command, {'style':'width:100%;height:fit;'}]}
		var two = {'plugin':'raw', 'setup':[id+'Two', [navbar,split2], {'style':'width:100%;height:100%;'}]}

		var split = {'plugin':'split', 'setup':[id+'Split', type, 50, one, two, {'style':'width:100%;height:100%;'}]}
		var c = super.setup(parent, id, split, config)
		c.api = api
		return c
	}

	client(config){ return new FunPLClient(config) }
}

new FunPLPlugin()

/*
 *
 * A client for a Python server
 */  
class FunPLClient extends Client{
	/**
	 * Creates a FunPL client object
	 * @param config Component configuration
	 */
	constructor(config){
		super(config)
		var x = this
		x.app = new Application( x.id, Konekti.client[x.id+'Coder'],  Konekti.client[x.id+'Command'], x, x, x.api, 
			function(msg){ return Konekti.dom.fromTemplate(msg,x.msg) } 
		)
	}

	console(){ return Konekti.client[this.id+'Console'] }

	out( msg ){ this.console().setText(this.app.i18n(msg.replace("\n","<br>"))) }
	error( msg ){ this.console().setText(this.app.i18n(msg.replace("\n","<br>"))) }
	
	render(obj){ Konekti.client[this.id+'Render'].setText(obj) }

	remnants(){ this.out(this.api.values()) }

	primitives(){ this.out(this.api.opers_explain()) }
	
	compile(){ this.app.compile(this.app.program.getText()) }

	run(){ this.app.execute(this.app.command.getText()) }

	apply(){ this.app.apply(this.app.command.getText()) }
}

/**
 * Creates a FunPL client
 * @param id GUI's id,
 * @param width Width of the component
 * @param height Height of the component
 * @param type If component will be displayed as a row ('row') or as a column ('col') 
 * @param mode Programming language mode 
 * @param code ACE code for syntax highlighting the programming language
 * @param api Programming language API
 * @param render Programming language render component
 * @param config Configuration of the funpl component
 * @param callback Function called when the funpl component is ready
 */
 Konekti.funpl = function(parent, id, type, mode, code, api, render, config, callback){
	var args = []
	for(var i=0; i<arguments.length; i++) args[i] = arguments[i]
	if(args.length==7) args[7] = {}
	if(args.length==8) args[8] = function(){}
	Konekti.add('funpl', ...args)
}
