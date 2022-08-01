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

Konekti.load('split', 'ace', 'navbar')

/** Konekti Plugin for Python */
class FunPLPlugIn extends PlugIn{
    /** Creates a Plugin for Python */
    constructor(){ super('funpl') }
    
    /**
     * Creates a client for the plugin's instance
     * @param config Python configuration
     */
    client(config){ return new FunPLClient(config) }
}

if( Konekti.funpl===undefined) new FunPLPlugIn()


/*
 *
 * A client for a Python server
 */  
class FunPLClient extends Client{
	/**
	 * Creates a Python server client
	 * @param config Configuration includes
	 * id: GUI's id,
	 * editor: Editor's id
	 * url: Python's server url
	 * run: Run button's id 
	 * console: Console/Terminal's id
	 * type If python console will be displayed as a row ('row') or as a column ('col') 
	 * captionRun Caption for the run button when ready for running python code (to start code running)
	 * captionStop Caption for the run button when running python code (to stop code running)
	 */
	constructor(config){
		super(config)
		var x = this
		x.api = config.api
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
 * Creates a FunPL client object
 * @param id GUI's id,
 * @param width Width of the component
 * @param height Height of the component
 * @param type If component will be displayed as a row ('row') or as a column ('col') 
 * @param mode Programming language mode 
 * @param code ACE code for syntax highlighting the programming language
 * @param api Programming language API
 * @param render Programming language render component
 * @param parent Parent component 
 */
Konekti.funplConfig = function(id, width, height, type, mode, code, api, render, parent='KonektiMain'){
	var editor = Konekti.aceConfig(id+'Coder', '100%', '100%', '', mode, 'eclipse', code)
	var term = Konekti.divConfig(id+'Console', '100%', '100%', '', '', id+'One')
	var one = Konekti.splitConfig(id+'One', '100%', '100%', 'row', 70, editor, term, id+'Split')
	
	var btn=[
		Konekti.btnConfig("remnants","fa-th", '', {'client':id}, "w3-blue-grey", ""),
		Konekti.btnConfig("primitives","fa-magic", '', {'client':id}, "w3-blue-grey", ""),
		Konekti.btnConfig("compile","fa-gear", '', {'client':id}, "w3-blue-grey", ""),
		Konekti.btnConfig("run","fa-play", '', {'client':id}, "w3-blue-grey", ""),
		Konekti.btnConfig("apply","fa-repeat", '', {'client':id}, "w3-blue-grey", "")
	]
	var navbar = Konekti.navbarConfig('funpl-navbar', 'w3-blue-grey', btn, 'client', 'select' ) 
	render.width = '100%'
	render.height = '100%'
	var command = Konekti.aceConfig(id+'Command', '100%', '100%', '', mode, 'eclipse', code)
	var split2 = Konekti.splitConfig(id+'Split2','100%','rest', 'row', 85, render, command, id+'Two')
	var two = Konekti.divConfig(id+'Two', '100%', '100%', '', [navbar,split2], id+'Split')

	var split = Konekti.splitConfig(id+'Split','100%','100%', type, 60, one, two, id)
	return {'plugin':'funpl', 'id':id, 'width':width, 'height' :height, 'parent':parent, 'api':api, 'children':[split]}
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
 */
 Konekti.funpl = function(id, width, height, type, mode, code, api, render){
	return Konekti.build(Konekti.funplConfig(id, width, height, type, mode, code, api, render))
}
