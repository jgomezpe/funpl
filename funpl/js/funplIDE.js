
class KMain extends Client{
	constructor( page ){
		super('client')
		if( page === undefined || page === null ) page = 'home'
		this.page = page
		this.lang = ''
	}
	
	out( msg ){ this.console().setText(this.app.i18n(msg.replace("\n","<br>"))) }
	error( msg ){ this.console().setText(this.app.i18n(msg.replace("\n","<br>"))) }

	setParam( param, value ){
		var urlParams = new URLSearchParams(window.location.search)
		urlParams.set(param, value)
		history.replaceState(null, null, "?"+urlParams.toString())
	}

	select(page){
		var client = this
		if(page=='api') window.open("https://github.com/jgomezpe/quilt")
		else if(page=='ide') window.open(FunIDE.ide)
		else if( this.page != page ){			
			this.page = page
			this.setParam('page', this.page)
			var file = ((page=='home')?'i18n/':'src/plugin/'+page+'/')+this.lang+'/index'
			Konekti.i18n(file)	
			var cfg = FunIDE.cfg
			if( FunIDE[page] !== undefined ) cfg = FunIDE[page].cfg
			Konekti.resource.load(cfg, function(txt){
				client.cfg = JXON.parse(txt)
				function check(){
					if(Konekti.client('coder')===undefined || Konekti.client('command')===undefined)
						setTimeout(check,200)
					else{
						Konekti.ace(client.editor('coder'))
						Konekti.ace(client.editor('command'))
						client.api = FunIDE.api(client.cfg.fun)
						if(FunIDE.render !== undefined){
							client.cfg.render.id = 'render'
							Konekti[FunIDE.render](client.cfg.render)
						}
						client.app = new Application(FunIDE.title, Konekti.client('coder'), Konekti.client('command'), client, client,client.api, function(msg){ return Konekti.dom.fromTemplate(msg,client.msg) } )
					}
				}
				if( FunIDE.render !== undefined ) Konekti.load(FunIDE.render, check)
				else check()
			} )
		}
	}
	
	language(lang){
		var client = this
		if( lang != this.lang ){
			Konekti.resource.JSON('i18n/'+lang+'/'+FunIDE.language, function(json){ client.msg = json })
			if(this.lang=='') Konekti.resource.JSON('i18n/'+lang+'/toc', Konekti.tree )
			else Konekti.i18n('i18n/'+lang+'/toc')
			Konekti.i18n('i18n/'+lang+'/component')
			this.lang = lang
			this.setParam('lang',this.lang)
			var page = this.page
			this.page = ''	
			this.select(page)
		}
	}
	
	console(){ return Konekti.client('console') }
	
	render(obj){ 
		if( FunIDE.show === undefined )
			Konekti.client('render').setText(obj) 
		else
			FunIDE.show(obj)
	}

	remnants(){ this.out(this.api.values()) }

	primitives(){ this.out(this.api.opers_explain()) }
	
	compile(){ this.app.compile(this.app.program.getText()) }

	run(){ this.app.execute(this.app.command.getText()) }

	editor(id){
		this.cfg.ace.id = id 
		return this.cfg.ace
	}
}


function KonektiMain(){
	var urlParams = new URLSearchParams(window.location.search)
	var client = new KMain(urlParams.get('page'))

	Konekti.box('main', "", "width:100%;height:100%","hcf", 
		{
			"plugin":"sidebar",
			"main":{
				"plugin":"split",
				"type":"row",
				"start":30,
				"one":{ "plugin":"html", "id":"info", "initial":""},
				"two":{
					"plugin":"split", 
					"type":"col",
					"start":50, 
					"one": {
						"plugin":"split",
						"type":"row",
						"start":85,
						"two":{ "plugin":"html","id":"console", "initial":""},
						"one": {"plugin":"ace", "id":"coder", "mode":"html"}	
					},
					"two":{
						"plugin":"split",
						"type":"row",
						"start":85,
						"one":{ "plugin":"html","id":"render","initial":"" },
						"two": {"plugin":"ace", "id":"command", "mode":"html"}	
					}
				},
			},
			"side":{"id":"toc", "plugin":"html"},
			"navbar":{
				"id":"tools",
				"btn":[
					{"id":"remnants","icon":"fa fa-th", "onclick":{"method":"remnants"}},
					{"id":"primitives","icon":"fa fa-magic", "onclick":{"method":"primitives"}},
					{"id":"compile","icon":"fa fa-gear", "onclick":{"method":"compile"}},
					{"id":"run","icon":"fa fa-play", "onclick":{"method":"run"}},
					{"id":"apply","icon":"fa fa-repeat", "onclick":{"method":"apply"}}
				]
			}
		},
		{"plugin":"header","icon":"fa fa-th-large", "caption":FunIDE.title+" Programming Language", "h":4, "style":"w3-teal w3-center", "id":"title"},
		{"plugin":"header","id":"foot", "caption":"Developed by Professor Jonatan Gomez, Ph. D.", "h":6, "style":"w3-teal w3-center"}
	)

	function rendered(){
		var toolbar = Konekti.client('tools')
		toolbar.add( {"plugin":"dropdown", "id":"lang", "icon":"fa fa-language", "method":"language", 
		"options":[{"id":"es","caption":"Español"}, {"id":"en","caption":"English"}]} )
		var lang = urlParams.get('lang')
		if( lang === undefined || lang === null ) lang = window.navigator.language
		lang = lang.split('-')[0]
		if( lang != 'es' && lang != 'en' ) lang = 'en'
		client.language(lang)
	}

	Konekti.dom.check( rendered, 'toc', 'tools', 'info', 'coder', 'render' )
}

Konekti.uses('box','tree')

