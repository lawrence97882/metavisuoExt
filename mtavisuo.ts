// 
//Import the schema library where the schema class is defined. that is extended in this 
//metavisuo file to include all the metavisuo editable classes.
import * as schema from "../bolster/schema";
import create_element from "./create";
//
//The metavisuo alterable database for the support of metavisuo features. i.e., for the support of
//of the Data definition Language(for alter commands)
class alterable_database extends schema.database {
    // 
    //The type of this database
    public type:schema.db_type;
    // 
    //Save a collection of the opened databases as a Map
    static opened_databases:{[db_type:string]:{[dbname:schema.dbname]:alterable_database}}={};
    //
    //
    constructor(dbase:schema.database){
        super(dbase.static_dbase);
        this.type=dbase.static_dbase.class_name;
        // 
        //Throw an error if by any chance we are recreating this database
        if(alterable_database.opened_databases[this.type][this.name] instanceof alterable_database)
            throw new schema.mutall_error("this class is being overidden");
        // 
        //Set this database in the collection of databases.
        alterable_database.opened_databases[this.type][this.name]=this;
    }
    // 
    //Overide the schema entity with this alterable entity that support the data definition 
    //language capabilities
    activate_entities(): {}{
        //
        //start with an empty map
        const entities :{[index:string]:schema.entity}= {};
        //
        //Loop through all the static entities and activate each one of them setting it in
        //the object entities indexed by thr 
        for(let ename in this.static_dbase.entities){          
            //
            let static_entity = this.static_dbase.entities[ename];
            //
            //Create the active entity, passing this database as the parent
            let active_entity =  new alterable_entity(this, static_entity);
            //
            //Replace the static with the active entity
            entities[active_entity.name] = active_entity;
        }
        //
        //Return the entities of this database
        return entities;
    }  
    //
    //Display the database interms of ellipses for entities and lines for relations
    present():SVGElement{
        //
        //Create the svg  element 
        const svg = document.createElement('div');
        //
        //Append all the graphic in entities as children from the entities which 
        //contain a group with an ellipse, text and the attributes  
        for (let key  in this.entities){
            //
            //Get the entity referenced by the key
             let entity= this.entities[key];
             //
             //Get the presentation from the individual entities
             entity.present(div);
        }
        
       return div;
    }
}
//
//This is an extented class of the entity in my library.js
class alterable_entity extends schema.entity{
    //
    //The alterable entity constructor
    constructor(dbase, static_entity){
          //
          //Create the parent 
          super(dbase, static_entity);
    }
      
    //overwrite the collumns to create a collection of the alterable columns and relations
    activate_columns(){
        //
        let columns = [];
        //
        //Loop through all the static columns and activate each of them
        for(let cname in this.columns ){
            //
            //Get the static column
            let static_column = this.columns[cname];
            //
            //Define a dynamic column
            let dynamic_column;
            switch(static_column.type){
                //
                case "primary": 
                    dynamic_column = new schema.primary(this, static_column);
                    break;
                case "attribute": 
                    dynamic_column = new alterable_attribute(this, static_column);
                    break;
                case "foreign":
                    dynamic_column = new alterable_relation(this, static_column);
                    break;
                default:
                    alert (`Unknow column type {static_column.type}`);
            }
        //
        //Replace the static column with the dynamic one
        columns.push(dynamic_column);
        }
        return columns;
    }
      //
      //Displays and returns this entity in a div as an interface for editing
      display(comment){
          if(comment.title===undefined){comment.title='';}
          const text=`
              <label>Entity name:<input name="ename" readonly="true" value="${this.name}"/></label>
              <label>Title <input type="text" name="title"value="${comment.title}" id="title"/></label>
              <label><input type="checkbox" name="reporting" id = "report"/>Reporting </label>
              <label><input type="checkbox" name="administration" id ="admin"/>Administration</label>
              <label><input type="checkbox" name="visible" id= "visible"/>invisible</label>
              <label>coordinates cx:<input type="text" name="cx"value="${comment.cx}" id="cx"/>
              cy:<input type="text" name="cy" value="${comment.cy}" id="cy"/></label>
              <button id="save" onclick ="$page_graph.save_entity(this)" >Save</button> <button id="cancel">cancel</button>`;
          //
          //Create a div which will be appended this entity 
          const div = create_element(document,"div",{innerHTML:text});
          //
          //Set the inner html of the div
          //
          //Return the display
          return div;
      }
      
      //
      //Get the updated comment and save it 
      get_comment(win){
          //
          //Start with an empty array to store the comment
          const comment= {}; 
          //
          //Get the title input by the user to this entity 
          comment['title']= win.document.getElementById("title").value;
          //
          //Get the input tag for reporting and test if it is checked
          comment["reporting"] =win.document.getElementById("report").checked;
          //
          //Get the administration data 
          comment["administration"] =win.document.getElementById("admin").checked;
          //
          //Get the visible data 
          comment["visible"] =win.document.getElementById("visible").checked;
          //
          //Get the coodinates data of the entity 
          comment["cx"] =win.document.getElementById("cx").value;
          comment["cy"] =win.document.getElementById("cy").value;
          //
          //Save the comment 
          this.alter(comment);
      }
      
      //
      //Returns a table popilated with the attributes of this entity and the metadata
      //curently saved in them in a table format 
      display_attributes(table=null){
          //
          //if the table is null create our own table
          if (table===null){table = document.createElement('table');}        
          //
          //loop throough the entity columns and append the various culumn names 
          const attributes=Object
              //
              //Get the columns
              .values(this.columns)
              //
              //Select attributes only
              .filter(column=>{
                  return column.type==='attribute';
              });
          //
          //Map each column to a tr
          const rows=attributes.map(column=>{
              //
              //Create a raw
              const row = window.document.createElement('tr');
              //build the row with the relevant tds, labels and the inputs respectively
              //
              //Create the first td which contains the name of the column
              const td1 = document.createElement('td');
              td1.innerHTML=`<td>${column.name}</td>`;
              row.appendChild(td1);
              //
              //Create the table data to append the attribute div
              const td2 = document.createElement('td');
              //
              //Get the divs that represent the attribute 
              td2.appendChild(column.display());
              row.appendChild(td2);
             //
             //Return the raw
             return row;
          });
          //
          //Append each tr to the table
          rows.forEach(row=>{
            //
            //Append the raws to the table
            table.appendChild(row);  
          });
      }
    
      //
      //Alters the metadata of the entity including the title or any other friendly name 
      //data input by the user in the page graph interface 
      async alter(comment){
          //
          //This comment can either be saves in the database or at the windows local storage 
          //for now we save everything in this entity comment 
          //
          //
          //encode the entire comment to make it a json format 
          const comment_str = JSON.stringify(comment);
          //
          //Save the newly updated  comment to the database as a comment  
          //
          //Generate the sql for the alter command 
          const sql = "ALTER TABLE "
          //
          //The name of the table to be altered is the name of the coodinate 
          +`\`${this.name}\``
          // 
          //Update the comment to now fit the the new view of reporting 
          + "COMMENT "
              //
              //The cooment information has to be in a json format ie'{"cx":5500,"cy":3300,......}'
          +`'${comment_str}'`;
          //Execute the sql in the server side 
          const name= page_graph.dbname;
          //
          //
          this.exec()
          await mutall.fetch('database', 'query', {name, sql});
  
      }
      
      //
      //Alters the comment metadata at the column level and updates it with the new 
      //comment structure as inserted by the user as the attribute metadata retrieved 
      //from a table
      alter_attributes(table){
          //
          //Get the table rows 
          const column_rows= table.getElementsByTagName('tr');
          //
          //loop through each row to get the respective cell data 
          for (let i = 2; i< column_rows.length; i++){
              //
              //every row represents a column;
              //
              //Get the ith raw
              const row= column_rows[i];
              //
              //obtain the column name
              const cname= row.cells[0].innerHTML;
              //Create the comment property to store the various components 
              //
              //Get the div that displays the attribute
              const rw= row.lastChild;
              //
              const div= rw.childNodes;
              //Update the structure of the alterable attribute compilling it  for 
              //altering the attribute 
              this.columns[cname].update(div);    
          }
      }
}
  
//
//
class alterable_column extends schema.column{
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
        if (typeof this.default==='string'){
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

export {alterable_database,schema}