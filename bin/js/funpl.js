/**
*
* funpl.js
* <P>Java Script for FunPL (Functional/Logic Programming).</P>
* <P> requires base64.js, kompari.js, lifya.js, and jxon.js (jxon_wrap.js). </P>
* <P>A numtseng module <A HREF="https://numtseng.com/modules/funpl.js">https://numtseng.com/modules/funpl.js</A> 
*
* Copyright (c) 2021 by Jonatan Gomez-Perdomo. <br>
* All rights reserved. See <A HREF="https://github.com/jgomezpe/funpl">License</A>. <br>
*
* @author <A HREF="https://disi.unal.edu.co/~jgomezpe/"> Professor Jonatan Gomez-Perdomo </A>
* (E-mail: <A HREF="mailto:jgomezpe@unal.edu.co">jgomezpe@unal.edu.co</A> )
* @version 1.0
*/

//////////// FunPL //////////////

//////////// CONSTANTS //////////
FunConstants={
    novalue:"·No valid value· ",
    NUMBERID:"numberid",

    // FunEncoder
    code:"code",
    arity:"arity",
    priority:"priority",
    extra:"extra",
    EOF:-1,
    DOLLAR:1,
    ASSIGN:':',
    COMMA:',',
    OPEN:'(',
    CLOSE:')',
    SPACE:' ',

    // FunLexer
    COMMENT:"comment",
    FUNCTION: "function",
    VALUE: "value",
    PRIMITIVE: "primitive",
    VARIABLE: "variable",
    
    // FunParser
    EXPRESSION:"expression",
    DEFINITION:"definition",
    DEF_LIST:"list",
    COMMAND:"command",
    ARGS:"args",
    
    expected:"·Expecting· ",
    unexpected:"·Unexpected· ",
    noargs:"·No arguments· ",

    // FunMeaner
    nocommand:"·Not a command· ",
    argmismatch:"·Argument mismatch· ",
    argnumbermismatch:"·Argument number mismatch· ",
    novar:"·No a variable· "   
}

//////////// LEXER /////////////

class Comment extends Lexeme{
    constructor(){
        super()
        this.type = FunConstants.COMMENT 
    }

    match(input, start, end) {
        start = start || 0
        end = end || input.length
        if(typeof input === 'string') input = new Source(input)
        if(!this.startsWith(input.get(start))) return this.error(input, start, start+1)
        var n=end
        end=start
        while(end<n && this.followsWith(input.get(end))) end++
        return this.token(input,start,end,input.substring(start,end))
    }

    startsWith(c){ return c=='%' }

    followsWith(c){ return c!='\n' && c!='\r' }
}

class Function extends Lexeme{
    constructor(canStartWithNumber=true){ 
        super()
        this.withNumber = canStartWithNumber
        this.type = FunConstants.FUNCTION
    }

    match(input, start, end) {
        start = start || 0
        end = end || input.length
        if(typeof input === 'string') input = new Source(input)
        if(!this.startsWith(input.get(start))) return this.error(input, start, start+1)
        var n = end
        end = start+1
        while(end<n && this.followsWith(input.get(end))) end++
        return this.token(input,start,end,input.substring(start,end))
    }
    
    startsWith(c){ 
        return Character.isLowerCase(c) || (this.withNumber && Character.isDigit(c))
    }

    followsWith(c){ 
        return Character.isAlphabetic(c) || c=='_'
    }  
}

class Variable extends Lexeme{
    constructor(){
        super()
        this.type = FunConstants.VARIABLE
    }
    
    match(input, start, end) {
        start = start || 0
        end = end || input.length
        if(typeof input === 'string') input = new Source(input)
        if(!this.startsWith(input.get(start))) return this.error(input, start, start+1)
        var n = end
        end = start
        while(end<n && this.followsWith(input.get(end))) end++
        return this.token(input,start,end,input.substring(start,end))
    }

    startsWith(c){ return Character.isUpperCase(c) }

    followsWith(c){ return Character.isAlphabetic(c) || c=='_' }
}

class FunLexer extends LookAHeadLexer{
    constructor( canStartWithNumber, value, primitive ) {
        super( [Space.TAG, FunConstants.COMMENT],
                [
                    new Variable(),
                    new Function(canStartWithNumber),
                    value, primitive,
                    new Symbol("()=,"),
                    new Comment(),
                    new Space()
                ]
            )
    }   
}

//////////// PARSER /////////////

class Arguments extends ListRule{
    constructor(parser) { 
        super(FunConstants.ARGS, parser, FunConstants.EXPRESSION, '(', ')', ',')
    }
}

class Command extends Rule{
    constructor(parser) { super(FunConstants.COMMAND, parser) }

    analize(lexer, current=lexer.next()) {
        if(!this.startsWith(current)) return current.toError()
        var input = current.input
        var start = current.start
        var end = current.end
        var type = current.type
        var command = []
        command.push(current)
        if(type!=FunConstants.VALUE) {
            var c = lexer.next()
            lexer.goback()
            if(c!=null && this.check_symbol(c, '(')) {
                var args = this.parser.analize(lexer,FunConstants.ARGS)
                if(args.isError()) return args
                command.push(args)
                end = args.end
            }else {
                if(type==FunConstants.PRIMITIVE)
                    if(c==null) return this.eof(input,end)
                    else return c.toError()
            }
        }
        return this.token(input,start,end,command)
    }

    startsWith(token) {
        var type = token.type
        return type==FunConstants.VALUE || type==FunConstants.FUNCTION ||
            type==FunConstants.PRIMITIVE || type==FunConstants.VARIABLE
    }
}

class Definition extends Rule{
    constructor(parser) { super(FunConstants.DEFINITION, parser) }
    
    startsWith(t) { return t.type==FunConstants.FUNCTION }
    
    analize(lexer, current=lexer.next()) {
        if(!this.startsWith(current)) return current.toError()
        var input = current.input
        var start = current.start
        var end = current.end
        var pair = []
        pair.push(this.parser.rule(FunConstants.COMMAND).analize(lexer,current))
        if(pair[0].isError()) return pair[0]
        current = lexer.next()
        if(current==null) return this.eof(input,end)
        if(!this.check_symbol(current, '=')) return current.toError()
        end = current.end
        pair.push(this.parser.analize(lexer,FunConstants.EXPRESSION))
        if(pair[1].isError()) return pair[1]
        return this.token(input,start,pair[1].end,pair)
    }
}

class DefList  extends Rule{
    constructor(parser) { super(FunConstants.DEF_LIST, parser) }

    startsWith(t) { return t.type==FunConstants.FUNCTION }
    
    analize(lexer, current=lexer.next()) {
        if(!this.startsWith(current)) return current.toError()
        var input = current.input
        var start = current.start
        var end = current.end
        var list = []
        while(current!=null && this.startsWith(current)){
            var t = this.parser.rule(FunConstants.DEFINITION).analize(lexer, current)
            if(t.isError()) return t
            list.push(t)
            end = current.end
            current = lexer.next()
        }
        if(current!=null) return current.toError()
        return this.token(input,start,end,list)
    }
}

class Expression extends Rule{
    constructor(parser, operator_priority) {
        super(FunConstants.EXPRESSION, parser)
        this.operator_priority = operator_priority
    }

    
    analize(lexer, current=lexer.next()) {
        var t = this.inner_analize(lexer,current)
        if(!t.isError()) {
            var list = t.value
            for( var i=1; i<list.length; i+=2) { 
                var oper = this.operator_priority[list[i].value]
                if( oper[0] == 1 )
                    return list[i].toError()
            }
            t = this.tree(list)
        }
        return t 
    }

    tree(list) {
        if( list.length==1 ) return list[0]
        var p = this.operator_priority[list[1].value][1]
        var k = 1
        for( var i=3; i<list.length; i+=2) { 
            var pi = this.operator_priority[list[i].value][1]
            if(pi<p) {
                k = i
                p = pi
            }
        }
        var args = [list[k-1],list[k+1]]
        var node = [list[k],
            new Token(args[0].input, args[0].start, args[1].end, args, FunConstants.ARGS)]
        list.splice(k+1,1)
        list[k]=new Token(node[0].input, node[1].start, node[1].end, node, FunConstants.COMMAND)
        list.splice(k-1,1)
        return this.tree(list)
    }
    
    inner_analize(lexer, current) {
        if(!this.startsWith(current)) return current.toError()
        var input = current.input
        var start = current.start
        var end = current.end
        var command
        if( this.check_symbol(current, '(')) {
            current = lexer.next()
            command = this.analize(lexer,current)
            if(command.isError()) return command
            end = current.end
            current = lexer.next()
            if(current==null) return this.eof(input,end)
            if(!this.check_symbol(current, ')')) return current.toError()
        }else {
            command = this.parser.rule(FunConstants.COMMAND).analize(lexer,current)
            if(command.isError()) return command
        }
        current = lexer.next()
        if(current==null || current.type!=FunConstants.PRIMITIVE) {
            lexer.goback()
            return this.token(input,start,command.end,[command])
        }
        end = current.end
        var oper = current
        current = lexer.next()
        if(current==null) return this.eof(input,end)
        var list = this.inner_analize(lexer,current)
        if(list.isError()) return list
        var l = list.value
        l.splice(0, 0, command)
        l.splice(1, 0, oper)
        return this.token(input,start,list.end,l)
    }

    startsWith(token) {
        return this.parser.rule(FunConstants.COMMAND).startsWith(token) || 
            this.check_symbol(token, '(')
    }
}

class FunParser extends Parser{  
    static rules(operator_priority) { 
        return [
            new Definition(null),
            new DefList(null),
            new Expression(null,operator_priority),
            new Arguments(null),
            new Command(null) ]
    }

    constructor(operator_priority, rule){
        super(FunParser.rules(operator_priority), rule)
    }
}

//////////// MEANER /////////////
class FunAssignment { 
    check(variable, obj ){}
}

class FunObject extends Position{
    constructor( input, pos, machine ){ 
        super(input,pos)
        this.machine = machine;
    }
    
    exception(code){
        var t = new Token(this.input, this.start, this.start+1, code)
        return t.stringify()
    }    
}

class FunCommand extends FunObject{
    constructor(input=null, start=0, machine=null) {
        super(input, start, machine)
    }
    
    reverse( value, original) { return null }
    
    comment(){
        var sb = "·"+this.name+"·\n"+this.name
        var n = this.arity
        if( n>0 ){
            var v="XYZABCDEIJKNM"
            sb += FunConstants.OPEN
            sb += v.charAt(0)
            for(var i=1; i<n; i++){
                sb += FunConstants.COMMA         
                sb += v.charAt(i%v.length)+((i>=v.length)?(""+i/v.length):"")
            }
            sb += FunConstants.CLOSE     
        }
        return sb
    }   
}

class FunCommandCall extends FunObject {
    constructor(input, pos, machine, name, args=[]){
        super(input, pos, machine)
        this.name = name
        this.ho_name = name
        this.args = args
        this.arity = this.args.length
    }

    var2assign(variables) {
        var undvars = {}
        var vars = this.getVars()
        for( var v in vars ) {
            var o = variables[v]
            if(o===undefined || o==FunVariable.UNASSIGNED) undvars[v] = FunVariable.UNASSIGNED
        }
        return undvars
    }
    
    size(variables){
        var i=0
        for( var v in variables ) i++
        return i
    }
    
    match(values, variables={}){
        this.ho_name = variables[this.name] || this.name
        if( this.arity == 0 ){
            var obj=this.machine.execute(this, this.ho_name)
            if(obj==null || values.length!=1 || !Compare.equals(obj,values[1])) 
                throw this.exception(FunConstants.argmismatch + values[1])
            return variables
        }
        if( values.length != this.arity ) 
            throw this.exception(FunConstants.argnumbermismatch + values.length + "!=" + this.arity)
        var ex = null
        var index = []
        for( var i=0; i<this.arity; i++ ) index.push(i)
        var k
        // Checking FunValues and Variables
        var i=0
        while(i<index.length) {
            k=index[i]
            if( this.args[k] instanceof FunValue || this.args[k] instanceof FunVariable ){
                this.args[k].match([values[k]],variables)
                index.splice(i,1)
            }else i++
        }
        // Checking other commands  
        var m = 1
        i=0
        while(index.length>0 && m<3) {
            k = index[i]
            if(this.size(this.args[k].var2assign(variables)) <= m) {
                var aname = this.args[k].name
                try{
                    var c = this.machine.primitive[aname]
                    if(c !== undefined ){
                        var a = c.arity
                        var toMatch = []
                        for( var j=0; j<a; j++ )
                            try{ 
                                toMatch.push(this.args[k].args[j].run(variables))
                            }catch(x){ toMatch.push(null) }
                        c.input = this.args[k].input
                        c.start = this.args[k].start
                        var objs = c.reverse(values[k], toMatch)
                        this.args[k].match(objs, variables)
                    }else{
                        var obj = this.args[k].run(variables)
                        if( obj==null || !Compare.equals(obj,values[k]) ) 
                            throw this.args[k].exception(FunConstants.argmismatch + values[k])
                    }
                    index.splice(i,1)
                    i=-1 
                    m=1
                }catch(e){
                    ex = e
                }
            }
            i++
            if(i==index.length) {
                m++
                i=0
            }
        }
    
        if( index.length > 0 ) {
            var sb = ""
            var uvars = this.var2assign(variables)
            for(var uv in uvars) sb += " "+uv
            ex = ex!=null?ex:this.exception(FunConstants.novar + sb)
            throw ex
        }
        return variables 
    }
   
    run( variables ){
        this.ho_name = variables[name] || this.name
        var a = this.arity
        var obj = []
        for( var i=0; i<a; i++ ) obj.push(this.args[i].run(variables))
        return this.machine.execute(this, this.ho_name, obj)
    }

    apply(arg){
        var vars = this.getVars()
        if(Object.keys(vars).length!=1) throw this.exception(FunConstants.argnumbermismatch)
            
        for(var k in vars) vars[k] = arg    
        return this.run(vars)
    }

    getVars(vars={}) {
        for( var i=0; i<this.args.length; i++ ) this.args[i].getVars(vars)
        return vars
    }
    
    toString(){
        var sb = this.name
        var n = this.arity
        if( n>0 ){
            sb += FunConstants.OPEN
            sb += this.args[0].toString()
            for( var i=1; i<n;i++ ){
                sb += FunConstants.COMMA          
                sb += this.args[i].toString()
            }
            sb += FunConstants.CLOSE         
        }
        return sb
    }
}

class FunCommandDef extends FunCommand{
    constructor(machine, left, right ){
        super( left.input, left.start, machine )
        this.left = left
        this.right = right
        this.name = left.name
        this.arity = left.arity
    }
    
    match(values){
        if(this.left.arity==0) return {}
        return this.left.match(values)
    }

    execute(values){ 
        return this.right.run(this.match(values)) 
    }
    
    toString(){
        var sb = left.toString()
        sb += FunConstants.ASSIGN
        sb += right.toString()
        return sb
    }  
}

class FunValue extends FunCommandCall{
    constructor(input, pos, machine, name) {
        super(input, pos, machine, name)
        try{ 
            this.obj = machine.value.get(name)
            this.e = null
        }catch(e){
            this.obj = null
            this.e = this.exception(FunConstants.novalue + name) 
        }
    }
    
    run(){
        if( this.e != null ) throw this.e
        return this.obj
    }
    
    match( values, variables={} ) {
        if( values.length!=1 )  throw this.exception(FunConstants.argnumbermismatch + 1 + "!=" + values.length)
        var value = values[0]
         if( this.obj===null || !Compare.equals(this.obj,value) ) throw this.exception(FunConstants.argmismatch + value)
        return variables
    }
    
}

class FunVariable extends FunCommandCall{
    static UNASSIGNED = "%unassigned"
    
    constructor(input, pos, machine, name) { super(input, pos, machine, name) }
    
    run( variables ){
        var v = variables[this.name]
        if(v===undefined || v===null){ throw this.exception(FunConstants.novar) }
        return v
    }   

    getVars(vars) { vars[this.name] = FunVariable.UNASSIGNED }
    
    match(values, variables={}){
        if( values.length!=1 )  
            throw this.exception(FunConstants.argnumbermismatch + 1 + "!=" + values.length)
        var value = values[0]
        var match = true
        var obj = variables[this.name]
        if(obj!=null) match = Compare.equals(obj,value)
        else{ 
            match = this.machine.can_assign(this.name, value)
            if(match) variables[this.name] = value
        }       
        if( !match ) throw this.exception(FunConstants.argmismatch + value)
        return variables
    }
}

class FunProgram extends FunCommand{
    static MAIN="main"
    
    constructor(machine, commands){
        super(commands[0].input, commands[0].start, machine)
        this.commands = {}
        this.add(commands)
        this.arity = 0
        this.name = FunProgram.MAIN
        machine.program = this
    }

    addDef(def){
        var name = def.name
        var vdef = this.commands[name]
        if( vdef === undefined ){
            vdef = []
            this.commands[name] = vdef
        }
        vdef.push(def)
    }

    add(defs){ 
        for( var i=0; i<defs.length; i++ ) this.addDef(defs[i])
    }
    
    clear(){ this.commands = {} }
    
    defined(command){ return this.commands[command] !== undefined } 
    
    candidates(command, arity){
        var candidates = []
        try{
            var v = this.commands[command]
            for( var i=0; i<v.length; i++ ) if( v[i].arity==arity ) candidates.push(v[i])
        }catch(e){}
        return candidates
    }
    
    constant(command){ return this.candidates(command,0).length>0 }

    execute(command, values ){
        if( !this.defined(command) ) 
            throw this.exception(FunConstants.nocommand + command)
        var candidates = this.candidates(command,values.length )
        if(candidates.length==0) 
            throw this.exception(FunConstants.argnumbermismatch + command)
        var e=null
        var i=0
        while( i<candidates.length ){
            var cand = candidates[i]
            try{ 
                cand.match(values)
                i++;
            }catch(ex){
                e = ex
                candidates.splice(i,1)
            }
        }   
        if( candidates.length == 0 ) throw e
        e = null;
        for( i=0; i<candidates.length; i++ ){
            try{ return candidates[i].execute(values) }
            catch(ex){ e = ex }
        }   
        throw e
    }
    
    toString(){
        var sb = ''
        for( var d in this.commands )
            for( var i=0; i<this.commands[d].length; i++ ) sb += this.commands[d][i].toString()+"\n"    
        return sb
    }   
}

class FunValueInterpreter {
    get(value){}
    valid(value){}
    description(){}
}

class FunMachine{
    constructor( primitives, value, assignment=null ){
        this.setPrimitives( primitives )
        this.value = value
        this.assignment = assignment
    }
    
    setPrimitives(primitives) {
        this.primitive = primitives 
        for( var i in primitives ) primitives[i].machine = this
    }

    setProgram( program ){
        this.program = program
        program.machine = this
    }
    
    clear(){ this.program.clear() }
    
    can_assign( variable, value ){
        var flag = false
        if( this.assignment != null ) flag = this.assignment.check(variable, value)
        if(!flag){
            var cmd = value.toString()
            return this.primitive.get(cmd)!=null || this.program.defined(cmd)
        }
        return flag
    }
    
    execute( pos, command, args ){
        if(this.value.valid(command)){
            if( args.length>0) {
                this.program.start = pos.start
                throw this.program.exception(FunConstants.unexpected)
            }
            return this.value.get(command)
        }
        var c = this.primitive[command]
        if( c!=null ){
            c.input = pos.input
            c.start = pos.start
            if(args.length != c.arity){
                if( args.length > 0 ) 
                    throw c.exception(FunConstants.argnumbermismatch + command)
                else return command
            }
            return c.execute(args)
        }
        this.program.start = pos.start
        try{
            return this.program.execute(command, args)
        }catch(e){
            if(this.program.defined(command) && 
                !this.program.constant(command) && args.length==0 ) return command
            else throw e
        }   
    }
}

class FunMeaner extends Meaner{
    constructor(machine=null){
        super() 
        this.machine = machine
        this.src = 'noname' 
    }
    
    
    get( v, i ){
        try{ return v[i] }catch(e){ return null }
    }
        
    command_def(v){
        return new FunCommandDef(this.machine, this.command(v[0]), this.command(v[1]))
    }

    command_def_list(list){
        var defs = []
        for(var i=0; i<list.length; i++) defs.push(this.command(list[i]))
        return new FunProgram(this.machine, defs)
    }
    
    command_array(v){
        var name = null
        var xt = v[0]
        if(xt.type==FunConstants.VALUE) 
            return new FunValue(this.src, xt.start, this.machine, xt.value.toString())
        if(xt.type==FunConstants.VARIABLE) 
            return new FunVariable(this.src, xt.start, this.machine, xt.value)
        name = xt.value
        if(v.length>1) v = v[1].value
        else v = []
        var args = []
        for( var i=0; i<v.length; i++ )
            args.push(this.command(v[i]))
        return new FunCommandCall(this.src, xt.start, this.machine, name, args)
    }

    command(rule){
        if(Array.isArray(rule)) return this.command_array(rule)
        switch( rule.type ){
            case FunConstants.VARIABLE: 
                return new FunVariable(this.src, rule.start, this.machine, rule.value)
            case FunConstants.VALUE: 
                return new FunValue(this.src, rule.start, this.machine, rule.value)
            case FunConstants.DEFINITION: return this.command_def(rule.value)
            case FunConstants.DEF_LIST: return this.command_def_list(rule.value)
            case FunConstants.COMMAND: return this.command(rule.value)
        }
        return null
    }

    apply(rule){
        rule.value = this.command(rule)
        return rule
    }
}

////////// Language //////////////

class FunLanguage extends Language{
    constructor(lexer, parser, machine, rule){ 
        super(lexer, parser, new FunMeaner(machine)) 
        parser.rule(rule)
    }   
}

////////// API //////////////
GUIFunConstants ={
    ERROR : "·Error·",
    OUT : "·Out·",
    VALUE : "·Value·",
    PRIMITIVE : "·Primitive·",
    LANGUAGE : "·Language·",
    NONAME : "·noname·",
    CLEAN : "·Clean programming areas?·",
    NEW : "·New·",
    OPEN : "·Open·",
    SAVE : "·Save·",
    COMPILE : "·Compile·",
    EXECUTE : "·Execute·",
    COMMAND : "·Command·:",
    APPLY : "·Apply to output·:",
    TITLE : "·Title·",
    FILE : "·File·",
    NO_ERRORS : "no_errors",
    ERRORS : "errors",
    MACHINE : "·Machine·",
    STYLE : "·Editor Style·",
    FUN : "fun",
    FMC : "config",
    FMP : "type",   
    FML : ".i18n"
}

class FunAPI extends Configurable{
    constructor() {
        super()
        this.machine = new FunMachine() 
        this.primitive = {}
        this.operator = {}
        this.assignment = null
        this.canStartWithNumber=true
        this.filetype = ".fmp"
        this.conftype = ".fmc"
        this.output = null
    }
    
    clear() {
        this.primitive = {}
        this.operator = {}
        this.value = null
        this.assignment = null
    }
    
    config(jxon) {
        this.clear()
        this.filetype = jxon[GUIFunConstants.FMP]
        this.conftype = jxon[GUIFunConstants.FMC]
        if( jxon[FunConstants.NUMBERID] !== undefined )
            this.canStartWithNumber = jxon[FunConstants.NUMBERID]
    }   
        
    addOperator( command, priority ){
        this.primitive[command.name] = command
        this.operator[command.name] = [command.arity, priority]
        command.machine = this.machine
    }
    
    values() { return this.value.description() }
    
    primitive_lexeme(){
        var p = []
        for( var k in this.operator) {
            p.push(k)
        }
        return new Words(FunConstants.PRIMITIVE,p)
    }

    operators(separator) {
        var sb = ""
        var pipe = ""
        for(var k in this.operator) {
            sb += pipe
            pipe = separator
            sb += k
        }
        return sb    
    }
    
    opers_explain(separator='\n') {
        var sb = ""
        var pipe = ""
        for(var k in this.primitive) {
            sb += pipe
            pipe = separator
            sb += this.primitive[k].comment()
        }
        return sb    
    }
    
    lexer() {
        return new FunLexer(this.canStartWithNumber, this.value.lexeme, this.primitive_lexeme()) 
    }
    
    init() {
        var lexer = this.lexer()
        var parser = new FunParser(this.operator,FunConstants.DEF_LIST)  
        this.machine= new FunMachine(this.primitive, this.value, this.assignment)
        this.lang = new FunLanguage(lexer,parser,this.machine,FunConstants.DEF_LIST)
    }

    compile(program, component='noname'){
        var src = new Source(program,component)
        this.init()
        this.lang.parser.main = FunConstants.DEF_LIST
        this.lang.meaner.src = src
        var prog = this.lang.get(src,0,program.length)
        this.machine.setProgram(prog)
    }
    
    run(command,component='noname'){
        var src = new Source(command,component)
        if(this.lang==null ) this.init()
        this.lang.parser.main = FunConstants.EXPRESSION
        this.lang.meaner.src = src
        var cmd = this.lang.get(src,0,command.length)
        if( cmd != null ) {
            this.output = cmd.run({})
            return this.output
        }
        return null
    }   

    apply( command, component='noname' ){
        var src = new Source(command,component)
        if( this.lang==null ) this.init()
        this.lang.parser.main = FunConstants.EXPRESSION
        var cmd=this.lang.get(src,0,command.length)
        if( cmd != null ) {
            this.output = cmd.execute( this.output )
            return this.output
        }
        return null
    }   
}

////////// GUI //////////////
class Application extends Configurable{    
    constructor(id, program, command, console, render, api, i18n){ 
        super()
        this.id = id
        this.api = api
        this.program = program
        this.command = command
        this.render = render
        this.console = console   
        if(i18n === undefined )
            i18n = function(code){ return code }
        this.i18n = i18n
    }
  
    error(msg) {
        try {
        console.log(msg)
            var json = JXON.parse(msg)
            var pos = json[Position.START]
            var end = json[Token.END] || pos+1
            var row = json[Position.ROW]
            var col = json[Position.COLUMN]
            var value = json[Token.VALUE]
            var e = this[json[Position.INPUT]] 
            e.highlight(row)
            e.locateCursor(row,col)
            var c = e.getText().substring(pos,end)
            var sb = ""
            switch(value) {
            case FunConstants.VALUE:
            case FunConstants.FUNCTION:
            case FunConstants.VARIABLE:
            case FunConstants.PRIMITIVE:
                sb += "·Unexpected "+value+"· "+c
                break;
            case Symbol.TAG:
            case Token.ERROR:
                sb += "·Unexpected character· "+c
                break;
            default:
               sb += value  
            }
            sb += " [·row· " + (row+1)+", ·column· "+(col+1)+"]"
            this.console.error(this.i18n(sb))    
        } catch (e1) { console.log(e1) }
    }
        
    compile( code ) {
        if(code===undefined) code = this.program.getText()
        try {
            this.api.compile(code, "program")
            this.console.out(this.i18n("·No errors·"))
        } catch (e) {
            this.error(e)
        }
    }

    execute( command ) {
        if(command===undefined) command = this.command.getText()
        try {
            var obj = this.api.run(command, "command")
            this.console.out(this.i18n("·No errors·"))
            this.render.render(obj)
            return obj
        } catch (e) {
            this.error(e)
            return null
        }
    }
    
    apply( command ) {
        if(command===undefined) command = this.command.getText()
        try {
            var obj = this.api.apply(command, "command")
            this.console.out(this.i18n("·No errors·"))
            this.render.render(obj)
            return obj
        } catch (e) {
            console.error(this.i18n(e.getMessage()))
            return null
        }
    }
    
    config(json) {
        this.api.config(json.api)
    }
}
