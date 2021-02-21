package funpl;

import java.io.IOException;
import java.util.HashMap;

import funpl.gui.GUIFunConstants;
import funpl.lexer.FunLexer;
import funpl.semantic.FunAssignment;
import funpl.semantic.FunCommand;
import funpl.semantic.FunCommandCall;
import funpl.semantic.FunMachine;
import funpl.semantic.FunMeaner;
import funpl.semantic.FunProgram;
import funpl.semantic.FunValueInterpreter;
import funpl.syntax.FunParser;
import funpl.util.FunConstants;
import jxon.JXON;
import jxon.Configurable;
import lifya.Source;
import lifya.lexeme.Lexeme;
import lifya.lexeme.Words;

public class FunAPI implements Configurable{
    protected FunMachine machine;
    protected FunLanguage lang;
    protected HashMap<String,FunCommand> primitive = new HashMap<String, FunCommand>();
    protected HashMap<String,int[]> operator = new HashMap<String, int[]>();
    protected FunValueInterpreter value;
    protected FunAssignment assignment=null;
    protected boolean canStartWithNumber=true;
    protected String filetype = ".fmp";
    protected String conftype = ".fmc";
    protected Object output = null;

    public FunAPI() { machine = new FunMachine(); }
	
    public void clear() {
	primitive = new HashMap<String, FunCommand>();
	operator = new HashMap<String, int[]>();
	value = null;
	assignment = null;
    }
	
    public void config(JXON json) {
	this.clear();
	filetype = json.string(GUIFunConstants.FMP);
	conftype = json.string(GUIFunConstants.FMC);
	if( json.get(FunConstants.NUMBERID) != null )
	    canStartWithNumber = json.bool(FunConstants.NUMBERID);
    }	
    	
    public String type() { return filetype; }
	
    public String cfg() { return conftype; }
    
    public void setAssignment( FunAssignment assignment ) {this.assignment = assignment; }
		
    public void addOperator( FunCommand command, int priority ){
	primitive.put(command.name(), command);
	operator.put(command.name(), new int[] {command.arity(), priority});
    }
	
    public void setValue( FunValueInterpreter value ){
	this.value = value; 
    }
	
    public void setNames( boolean canStartWithNumber ) { this.canStartWithNumber = canStartWithNumber; }
	
    public String values() { return value.description(); }
	
    public Lexeme<String> primitive(){
	String[] p = new String[operator.size()];
	int i=0;
	for( String k:operator.keySet()) {
	    p[i]=k;
	    i++;
	}
	return new Words(FunConstants.PRIMITIVE,p);
    }

    public String operators(char separator) {
	StringBuilder sb = new StringBuilder();
	String pipe = "";
	String sep = ""+separator;
	for( String k:operator.keySet()) {
	    char c = k.charAt(0);
	    sb.append(pipe);
	    pipe = sep;
	    sb.append(c);
	}
	return sb.toString(); 	    
    }
	
    public String opers_explain(char separator) {
	StringBuilder sb = new StringBuilder();
	String pipe = "";
	String sep = ""+separator;
	for( String k:primitive.keySet()) {
	    sb.append(pipe);
	    pipe = sep;
	    sb.append(primitive.get(k).toString());
	}
	return sb.toString(); 	    
    }
	
    public FunLexer lexer() {
	return new FunLexer(canStartWithNumber, value.lexeme(), primitive()); 
    }
	
    protected void init() {
	FunLexer lexer = lexer();
	FunParser parser = new FunParser(operator,FunConstants.DEF_LIST);	
	machine= new FunMachine(primitive, value, assignment);
	lang = new FunLanguage(lexer,parser,machine,FunConstants.DEF_LIST);
    }

    public void compile( String program ) throws IOException{
	compile(program, "noname");
    }
    
    public void compile( String program, String component ) throws IOException{
	Source src = new Source(component,program);
	init();
	((FunParser)lang.parser()).main(FunConstants.DEF_LIST);
	((FunMeaner)lang.meaner()).src(src);
	FunProgram prog = (FunProgram)lang.get(src,0,program.length());
	machine.setProgram(prog);
    }
	
    public Object run( String command ) throws Exception{
	return run(command, "noname");
    }
    
    public Object run( String command, String component ) throws Exception{
	Source src = new Source(component,command);
	if( lang==null ) init();
	((FunParser)lang.parser()).main(FunConstants.EXPRESSION);
	((FunMeaner)lang.meaner()).src(src);
	FunCommandCall cmd = (FunCommandCall)lang.get(src,0,command.length());
	if( cmd != null ) {
	    output = cmd.run( new HashMap<String, Object>() );
	    return output;
	}
	return null;
    }	

    public Object apply( String command ) throws Exception{
	return apply(command, "noname");
    } 
    
    public Object apply( String command, String component ) throws Exception{
	Source src = new Source(component,command);
	if( lang==null ) init();
	((FunParser)lang.parser()).main(FunConstants.EXPRESSION);
	FunCommandCall cmd=null;
	cmd = (FunCommandCall)lang.get(src,0,command.length());
	if( cmd != null ) {
	    output = cmd.execute( output );
	    return output;
	}
	return null;
    }	
}