package funpl.semantic;

import java.util.HashMap;

import funpl.util.FunConstants;

public class FunCommandDef extends FunCommand{
	protected FunCommandCall left;
	protected FunCommandCall right;

	public FunCommandDef(FunMachine machine, FunCommandCall left, FunCommandCall right ){
		super( left.input(), left.start(), machine );
		this.left = left;
		this.right = right;
	}
	
	public HashMap<String,Object> match( Object... values ) throws Exception{
		if(left.arity()==0) return new HashMap<String,Object>();
		return left.match(values);
	}
	
	class ComponentRun implements Runnable{
		protected Object obj;
		protected FunCommandCall call; 
		protected HashMap<String, Object> map;
		protected Exception e=null;
		protected boolean done = false;
		
		public ComponentRun(FunCommandCall call, HashMap<String, Object> map) { 
			this.call = call; 
			this.map = map;
		}
		
		@Override
		public void run() {
			try { obj = call.run(map); } catch (Exception ex) { e = ex; }
			done = true;
		}
		
	}

	@Override
	public Object execute( Object... values ) throws Exception{ 
		HashMap<String, Object> map = match(values);
		if(right instanceof FunTuple) {
			// Parallel computation of components can be carried on...
			FunCommandCall[] right = this.right.args;
			ComponentRun[] run = new ComponentRun[right.length];
			for( int i=0; i<right.length; i++) {
				run[i] = new ComponentRun(right[i],map);
				Thread t = new Thread(run[i]);
				t.start();
			}
			boolean check = true;
			while(check){
				int i=0;
				while(i<run.length && run[i].done) i++;
				check = i<run.length;
				if(check) Thread.sleep(0,1000); 
			}
			Object[] objs = new Object[run.length];
			for( int i=0; i<run.length; i++)
				objs[i] = run[i].obj;
			return objs;
		}else return right.run(map); 
	}

	public String name(){ return left.name(); }

	@Override
	public int arity(){ return left.arity(); }
	
	public String toString(){
		StringBuilder sb=new StringBuilder();
		sb.append(left);
		sb.append(FunConstants.ASSIGN);
		sb.append(right);
		return sb.toString();
	}
	
}