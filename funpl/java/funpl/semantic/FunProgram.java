package funpl.semantic;

import java.io.IOException;
import java.util.HashMap;

import funpl.util.FunConstants;
import speco.array.Array;

public class FunProgram extends FunCommand{
	public static String MAIN="main";
	
	public FunProgram(FunMachine machine, Array<FunCommandDef> commands){
		super(commands.get(0).input(), commands.get(0).start(), machine);
		add(commands);
	}

	protected HashMap<String, Array<FunCommandDef>> commands = new HashMap<String,Array<FunCommandDef>>();
	
	public void add(FunCommandDef def){
		String name = def.name();
		Array<FunCommandDef> vdef = commands.get(name);
		if( vdef == null ){
			vdef = new Array<FunCommandDef>();
			commands.put(name, vdef);
		}
		vdef.add(def);
	}

	public void add(Array<FunCommandDef> def){ 
		for( FunCommandDef d:def ) add(d);
	}
	
	public void clear(){ commands.clear(); }
	
	public boolean defined(String command){	return commands.containsKey(command);	} 
	
	protected Array<FunCommandDef> candidates(String command, int arity ){
		Array<FunCommandDef> candidates = new Array<FunCommandDef>();
		try{
			Array<FunCommandDef> v = commands.get(command);
			for( FunCommandDef c:v ) if( c.arity()==arity ) candidates.add(c);
		}catch(Exception e){}
		return candidates;
	}
	
	public boolean constant(String command){ return candidates(command,0).size()>0;	}

	
	public Object execute( String command, Object... values ) throws Exception{
		if( !defined(command) ) throw exception(FunConstants.nocommand + command);
		Array<FunCommandDef> candidates = candidates(command,values.length );
		if(candidates.size()==0) throw exception(FunConstants.argnumbermismatch + command);
		Exception e=null;
//		LanguageMultiException e=null;
		int i=0; 
		while( i<candidates.size() ){
			FunCommandDef cand = candidates.get(i);
			try{ 
			    cand.match(values);
			    i++;
			}catch(Exception ex){
/*					if( e!=null ){
						e.add(ex);
					}else e = new LanguageMultiException(ex); */
			    	e = ex;
				candidates.remove(i);
			}
		}	
		if( candidates.size() == 0 ) throw e;
		e = null;
		for( FunCommandDef c:candidates ){
			try{ return c.execute(values); }
			catch(IOException ex){
			    e = ex;
				//if( e != null ) e.add(ex); else e = new LanguageMultiException(ex);
			}
		}	
		throw e;
	}
	
	@Override
	public Object execute(Object... args) throws Exception { return execute(MAIN,args); }

	@Override
	public int arity(){ return 0; }

	@Override
	public String name() { return MAIN; }
	
	public String toString(){
		StringBuilder sb=new StringBuilder();
		for( Array<FunCommandDef> d:this.commands.values() )
			for( FunCommandDef c:d ) sb.append(c+"\n");		
		return sb.toString();
	}	
}