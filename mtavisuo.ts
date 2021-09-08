// 
//Import the schema library where the schema class is defined. that is extended in this 
//metavisuo file to include all the metavisuo editable classes.
import * as schema from "../bolster/schema";
// 
//The databases that can be displayed and altered in this metavisuo platform.
type db_type = "mysql"|"postgres"|"mssql";
//
//The metavisuo alterable database for the support of metavisuo features. i.e., for the support of
//of the Data definition Language(for alter commands)
class alterable_database extends schema.database {
    // 
    //The type of this database
    public type:db_type;
    //
    //
    constructor(dbase:schema.database){
        super(dbase.static_dbase);
        this.type=<db_type>dbase.;
    }
    //
    //overwrite this inorder to create a collection of alterable entities 
    activate_entities(){
        //
        //Loop through all the static entities and activate each one of them
        for(let ename in this.entities){          
            //
            let static_entity = this.entities[ename];
            //
            //Create the active entity, passing this database as the parent
            let active_entity = new alterable_entity(this, static_entity);
            //
            //Replace the static with the active entity
            this.entities[ename] = active_entity;
        }
    }
    
}
//
//
class alterable_column extends column{
    //
    //the constructor 
    constructor(entity, static_column){
        //
        //Create the parent 
        super(entity, static_column);
    }
    
    //
    //Compiles and returns a clause that is required in the altering of this 
    //attribute
    get_clause(){
        //
        //the clause should majorly contain the datatype, null and the default 
        //
        //begin with an empty string 
        let clause = "";            
        //
        //Get the datatype of the column
        clause +`${this.data_type}`;
         //
         //Fill the null clause 
        if (this.is_nullable ==='NO'){
           clause +` NOT NULL`;
        }
        //
        //Fill the default clause
        if (this.default ===!null){
           clause +` DEFAULT ${this.default}`;
        }
        //
        //return the clause         
        return clause;
    }
    
    //
    //Alter the structure of the column either to add a comment or change the
    //alterable properties
    async alter(comment){
        // 
        //Get the clause 
        const clause= this.get_clause();
        //
        //encode the entire comment to make it a json format 
        const comment_str = JSON.stringify(comment);
        //
        //compile an alter command 
        //
        //Compile the alter command
        const alter=`ALTER TABLE ${this.entity.name}  MODIFY  ${this.name}
                     ${clause}  COMMENT  '${comment_str}'`;
        //
        //Run the query 
        await mutall.fetch('database', 'query', {alter});
    }
}