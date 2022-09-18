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
class FunPLClient extends Container{
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
	setup(id, width, height, type, mode, code, api, render, parent='KonektiMain'){
		var editor = {'plugin':'ace', 'setup':[id+'Coder', '100%', '100%', '', mode, 'eclipse', code]}
		var term ={'plugin':'div', 'setup':[id+'Console', '100%', '100%', '', '', id+'One']}
		var one = {'plugin':'split', 'setup':[id+'One', '100%', '100%', 'row', 70, editor, term, id+'Split']}
		
		var btn=[
			{'plugin':'btn', 'setup':["remnants","fa-th", '', {'client':id}, "w3-blue-grey", ""]},
			{'plugin':'btn', 'setup':["primitives","fa-magic", '', {'client':id}, "w3-blue-grey", ""]},
			{'plugin':'btn', 'setup':["compile","fa-gear", '', {'client':id}, "w3-blue-grey", ""]},
			{'plugin':'btn', 'setup':["run","fa-play", '', {'client':id}, "w3-blue-grey", ""]},
			{'plugin':'btn', 'setup':["apply","fa-repeat", '', {'client':id}, "w3-blue-grey", ""]}
		]
		var navbar = {'plugin':'navbar', 'setup':['funpl-navbar', 'w3-blue-grey', btn, 'client', 'select']} 
		var command = {'plugin':'ace', 'setup':[id+'Command', '100%', '100%', '', mode, 'eclipse', code]}
		var split2 = {'plugin':'split', 'setup':[id+'Split2','100%','rest', 'row', 85, render, command, id+'Two']}
		var two = {'plugin':'container', 'setup':[id+'Two', '100%', '100%', '', [navbar,split2], id+'Split']}

		var split = {'plugin':'split', 'setup':[id+'Split','100%','100%', type, 60, one, two, id]}
		return {'plugin':'funpl', 'id':id, 'width':width, 'height' :height, 'parent':parent, 'api':api, 'children':[split]}
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
	 constructor(id, width, height, type, mode, code, api, render, parent='KonektiMain'){
		super(...arguments)
	}

	setChildrenBack(){
		super.setChildrenBack()
		var x = this
		x.api = this.config.api
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
 */
 Konekti.funpl = function(id, width, height, type, mode, code, api, render){
	return new FunPLClient(id, width, height, type, mode, code, api, render)
}
