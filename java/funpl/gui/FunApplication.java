package funpl.gui;

import java.io.IOException;
import java.util.HashMap;

import funpl.FunAPI;
import funpl.util.FunConstants;
import jxon.Configurable;
import jxon.JXON;
import speco.object.Named;
import lifya.Position;
import lifya.Token;
import lifya.lexeme.Symbol;
import utila.I18N;
import aplikigo.Application;
import aplikigo.Component;
import aplikigo.gui.Console;
import aplikigo.gui.Render;
import aplikigo.gui.Editor;

public class FunApplication implements Application, Configurable{
    public String PROGRAM = "program";
    public String COMMAND = "command";
    public String RENDER = "render";
    public String CONSOLE = "console";
    protected HashMap<String, Component> component = new HashMap<String, Component>();
    protected String id = "funpl";
    protected FunAPI api;
    
    public FunApplication() {}

    public FunApplication(String id, Editor program, Editor command, Console console, Render render, FunAPI api){ 
	this.id = id;
	this.api = api;
	if( program instanceof Named ) PROGRAM = ((Named)program).id();
	component.put(PROGRAM, program);
	if( command instanceof Named ) COMMAND = ((Named)command).id();
	component.put(COMMAND, command);
	if( render instanceof Named ) RENDER = ((Named)render).id();
	component.put(RENDER, render);
	if( console instanceof Named ) CONSOLE = ((Named)console).id();
	component.put(CONSOLE, console);	
    }
  
    public String i18n(String code){ return I18N.process(code); }
 
    public void error(String msg) {
	try {
	    JXON json = JXON.parse(msg);
	    int pos = json.integer(Position.START);
	    int end = json.valid(Token.END)?json.integer(Token.END):pos+1;
	    int row = json.integer(Position.ROW);
	    int col = json.integer(Position.COLUMN);
	    String value = json.string(Token.VALUE);
	    Editor e = (Editor)get(json.string(Position.INPUT)); 
	    e.highlight(row);
	    e.locate(row,col);
	    String c = e.getText().substring(pos,end);
	    StringBuilder sb = new StringBuilder();
	    switch(value) {
	    case FunConstants.VALUE:
	    case FunConstants.FUNCTION:
	    case FunConstants.VARIABLE:
	    case FunConstants.PRIMITIVE:
		    sb.append("·Unexpected "+value+"· "+c);
		    break;
	    case Symbol.TAG:
	    case Token.ERROR:
		    sb.append("·Unexpected character· "+c);
		    break;
	    default:
		   sb.append(value);  
	    }
	    sb.append(" [·row· ");
	    sb.append(row+1);
	    sb.append(", ·column· ");
	    sb.append(col+1);
	    sb.append(']');
	    ((Console)get(CONSOLE)).error(i18n(sb.toString()));	   
	} catch (IOException e1) {}
    }
    
    public void compile() { compile(program().getText()); }
    
    public void compile( String code ) {
	try {
	    api.compile(code, PROGRAM);
	    ((Console)get(CONSOLE)).out(i18n("·No errors·"));
	} catch (IOException e) {
	    error(e.getMessage());
	}
    }

    public Object execute() { return execute(command().getText()); }
    
    public Object execute( String command ) {
	try {
	    Object obj = api.run(command, COMMAND);
	    ((Console)get(CONSOLE)).out(i18n("·No errors·"));
	    render().render(obj);
	    return obj;
	} catch (Exception e) {
	    e.printStackTrace();
	    error(e.getMessage());
	    return null;
	}
    }
    
    public Object apply() { return apply(command().getText()); }
    
    public Object apply( String command ) {
	try {
	    Object obj = api.apply(command, COMMAND);
	    ((Console)get(CONSOLE)).out(i18n("·No errors·"));
	    render().render(obj);
	    return obj;
	} catch (Exception e) {
	    ((Console)get(CONSOLE)).error(i18n(e.getMessage()));
	    return null;
	}
    }
    
    public Editor program() { return editor(PROGRAM); }
    public Editor command() { return editor(COMMAND); }
    protected Editor editor(String id) { return (Editor)get(id); }
    
    public Console console() { return (Console)get(CONSOLE); }
    
    public Render render() { return (Render)get(RENDER); }
       
    @Override
    public Component get(String id){ return component.get(id); }

    @Override
    public void id(String id) { this.id = id; }
    
    @Override
    public String id() { return id; }

    @Override
    public void config(JXON json) {
	if( json.string("id")!=null ) id = json.string("id");
	String tag = json.string("program");
	if( tag!=null ) {
	    component.put(tag, program());
	    PROGRAM = tag;
	}
	tag = json.string("command");
	if( tag!=null ) {
	    component.put(tag, command());
	    COMMAND = tag;
	}
	tag = json.string("console");
	if( tag!=null ) {
	    component.put(tag, console());
	    CONSOLE = tag;
	}
	tag = json.string("render");
	if( tag!=null ) {
	    component.put(tag, render());
	    RENDER = tag;
	}
	api.config(json.object("api"));
    }

    @Override
    public boolean accessible(String object, String method) {
	// TODO Auto-generated method stub
	return true;
    }

    @Override
    public boolean authorized(JXON user, String object, String method) {
	// TODO Auto-generated method stub
	return false;
    }
}