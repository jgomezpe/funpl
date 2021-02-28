package funpl.remote;

import aplikigo.web.EndPoint;
import funpl.FunAPI;

public class FunEndPoint extends EndPoint{
    /**
     * 
     */
    private static final long serialVersionUID = 3184723192570333996L;

    public FunEndPoint( String id, FunAPI api ) {
	server =  new FunRemoteApplication(id, api, this);
    }
}