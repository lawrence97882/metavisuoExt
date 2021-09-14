// 
//Import the schema library where the schema class is defined. that is extended in this 
//metavisuo file to include all the metavisuo editable classes.
import * as schema from "../bolster/schema";
import { create_svg_element,create_html_element } from './create';
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
    present(svg:SVGElement):SVGElement{
        //
        //Append all the graphic in entities as children from the entities which 
        //contain a group with an ellipse, text and the attributes  
        for (let key  in this.entities){
            //
            //Get the entity referenced by the key
             let entity= <alterable_entity>this.entities[key];
             //
             //Get the presentation from the individual entities
             entity.present(svg);
        }
        
       return svg;
    }
}
// 
//The color of an entity 
/**
 * red:error
 * green :new entity 
 * yellow: entity with user defined coodinates 
 *  */
type entity_color= "red"|"green"|"yellow"
//
//This is an extented class of the entity in my library.js
class alterable_entity extends schema.entity{
    // 
    //The svg group tag where this entity is displayed
    public group ?:SVGGElement;
    // 
    //The ellipse that represents an entity coodinates.
    public cx?:SVGAnimatedLength;
    public cy?:SVGAnimatedLength;
    // 
    //The colors that are used to represent this entiy this
    public color?:entity_color;
    // 
    //This property determines if this entity is hidden, i.e., can be displayed or not 
    public visibility?:boolean;
    //
    //The alterable entity constructor
    constructor(dbase:alterable_database, static_entity:schema.Ientity){
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
    //Display this entity as an ellipse with all its attribute.
    present(svg:SVGElement):SVGGElement{
        //
        //set the radius of the elipse as rx and the ry while the dy is the diference
        //between text in a tspan
        const dy= 20, ry= 50;  
        //
        //Get the group which is a graphic representation of the ellipse and 
        //its attribute 
        this.group = this.get_group(svg, ry); 
        //
        //Append  the attributes of an entity
        //
        //
        //Get all the column attributes contained in this entity 
        const attributes = Object.values(this.columns).filter(column=>{
           return column.constructor.name==='alterable_attribute';
        });
        //Get the number of the attributes in this entity 
        const count= attributes.length;
        //
        //create a text inorder to append all the attributes as a tspan
        let text= document.createElement('text');
        //
        //Set the attributes of the text
        text.setAttribute( 'x', `${this.cx}`);
        text.setAttribute( 'y',`${this.cy-dy*(count-1)-ry-dy}`);
        text.setAttribute( 'font-size', "30px");
        text.setAttribute( 'fill', "black");
        //text.setAttribute( 'id', "");
        //
        //Append the tspans from the column attributes
        attributes.forEach(column=>column.present(text, dy));
        //Append the text containing attributes to the entity group
        this.group.appendChild(text);
        //
        //Append the graphical entity group to the svg
        svg.appendChild(this.group);
        //
        //Append the this entity's relations' to the svg element as lines
        // 
        //Collect the foreign key columns for this entity.
        const columns = Object.values(this.columns).filter(column => {
            //
            //Test if the column is foreign and return  the condition
            return column.constructor.name==='alterable_relation';
        });
        //
        //loop through the foreign column and call the methord set line 
        columns.forEach(column=>{
            //invoke the function to set the line with the svg as a parameter
            column.set_line(svg);
         });
         //Test if the entity is visible to construct its group
        const visible= this.is_visible();
        //
        //continue with the presentation if true
        if (visible===false){
           this.group.classList.add( "hide");
        }
        return this.group!;
    }
    //
    //Test if the entity is visible or invisible as set by the user 
    //and sets the property  visible of this entity aas either true or false 
    is_visible(){
      //
      //Get the comment that contains the user inputs 
      const comment = this.metadata.visibility; 
      //
      //If it is set to true set the attribute of visibility to true
      if(comment===true){
          //
          //Create a visible property of this entity and set it to true 
          this.visibility=false;
          return false;
      }
      //
      //if the cmment is undefined, null or even set to  false it is set to false 
      else {
          //
          //create a property of vsible 
          this.visibility=true;
          return true;
      }
    }
    //
    //Returns the  graphic group containig html ellipse (to represent an entity)
    //a text (which represents the name of the entity
    get_group(svg:SVGElement,ry:number):SVGGElement{
        //
        //Create teh group element
        const group= create_svg_element(svg,"g",{id:`${this.name}_group`});
        //
        //set the radii of the ellipse. 
        const rx =100; 
        
        //Populate the group tag with an ellipse to represent an entity.
        create_svg_element(group,"ellipse",{
              id:this.name,
              cx:this.cx,
              cy:this.cy,
              rx:rx, 
              ry:ry,
              className:"draggable"  
            }
        ) 
        // 
        //The label of the ellipse.
        create_svg_element(group,"text",
            {
               x:this.cx,
               y:this.cy,
               textContent:this.name,
               fill:'blue',
               id:`_${this.name}`,
            }
        )

       //Return the group tag
       return group;
    }//
    //sets the oodinates both the cx and the cx 
    fill_coodinates(){
        //test if the comment is undefined
        if (this.comment.cx=== undefined || this.comment.cy === undefined){
         // Get the coodinates from a random value 
          this.cx= Math.floor(Math.random()*3000);
          this.cy= Math.floor(Math.random()*1200);
          // 
          const y = xScale
          //for deburging 
          this.color= 'green';
        //
        }
       //
       //Test if the coodinates are set else set a random value
       else{
            //Set the coodinates of the ellipse from the comment
           this.cx = parseInt(this.comment.cx);
           this.cy= parseInt(this.comment.cy);
           //for deburging        
            //Get the indexed column names
            const index_names = Object.values(this.indices);
            //
            //If red the entity does not have indexes
            if( index_names.length === 0){
               this.color="red"; 
            }
           //
           //If yellow the entity has indexes
           else{
             this.color= 'yellow';
           }
      }
        
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
//
//This class models an sql record that has all the column 

//
class alterable_attribute extends column_attribute {
    //
    //the constructor 
    constructor(entity, static_column){
        //
        //Create the parent 
        super(entity, static_column);
    }
    
    //
    //Returns a div that Displays the column containig the
    //description of this column and the coment saved in it as the matadata
    display(div=null){
       //
       //Test if there is a div called with the method and if null create one
       if (div===null){
            //
            //Create the div element with the id of the column name 
            div= document.createElement('div');
            div.setAttribute('id', `${this.name}`);
       }
        //
        //Populate the div with the discription of the column
        //
        //create the datatype input tag 
        //
        //create a new div that stores information about the description of this 
        //column  various input tags 
        const description= document.createElement('div');
        description.innerHTML=
          `<h3>column description</h3>      
         <input type="text" name="type" value=${this.data_type}>Datatype<br>
         <input type="text" name="null" value=${this.is_nullable}>is_nullabe<br>
         <input type="text" name="default" value=${this.Default}>default`;
        //
        //Append the description to the div
         div.appendChild(description);
       //
       //Get the current comment 
       let title;
       let eg;
       //
       if (this.comment===!undefined){
            title = this.comment.title!==undefined ? this.comment.title : '';
            eg = this.comment.example!==undefined ? this.comment.example : '';
        }
           title=''; eg='';
       //
       //Get a new div that contains the comment structure
       const metadata= document.createElement('div');
       metadata.innerHTML=
            `<h3>column metadata</h3>
            <label>Title: <input type="text" name="title" value='${title}'></label>
            <label>E.g.: <input type="text" name="example" value='${eg}'></label>`;
       div.appendChild(metadata);
       //
       //Return the div 
       return div;
    } 
    
    //
    //Update the structure of this column inorder to save the new structure and 
    //the new comment 
    update(div){
       //
       //destructure the div and save the structure and the comments
       //Get the comment div {description(0) and metadata(1)}
       const sections= div[0].children;
       //
       //update the description of the comment if any changes where made
       //Get the children of the first section which are named inputs descructured below
       //{input[name=data_type] , input[name=is_nullable], input[name=default]}
       const description=sections[0].childNodes;
       //
       //loop through the inputs and update this column description
       for(let i=0; i<description.length; i++){
            //Get the ith input 
            const input = description[i];
            //
            //Get the named metadata as a $key ie the data_type, is_nullable, default
            let key = input.name;
            //
            //The values are the user inputs 
            let value= input.value;
            //
            //update the property in the given key name 
            this[key]= value;
        }
       //
       //save the comment 
       const comment= this.get_comment(sections[1]);
       //
       //Save the comment 
       this.alter(comment);
    }
    
     //
    //Compiles and returns a clause that is required in the altering of this 
    //attribute
    get_clause(){
        //
        //the clause should majorly contain the datatype, null and the default 
        let nullable, $default;
         //
         //Fill the null clause 
        if (this.is_nullable ==='NO'){
           nullable =` NOT NULL`;
        }
        else{
             nullable=`NULL`;
        }
        //
        //Fill the default clause
        if (this.Default ===!null){
            $default  =` DEFAULT ${this.default}`;
        }
        else {
             $default  =``;
        }
        //
        //begin with an empty string 
        let clause = ``            
        //
        //Get the datatype of the column
         +`${this.data_type}`
         //
         //Get the null
         +`${nullable}`
         //
         //Get the default
         +`${$default}`;
        //
        //return the clause         
        return clause;
    }
    
    //
    //Returns a compiled comment ready to be saved 
    get_comment(div){
        //
        //Get the inputs
        const inputs= div.children;
        //
        //create an empty array to store the comment
        const comment={};
        //
        //loop through the creating a comment creating a comment of named key pair
        // values 
        for(let i=0; i<inputs.length; i++){
            //Get the ith input 
            const input = inputs[i];
            let key = input.name;
            let value= input.value;
            //
            //push the new comment 
            comment[key]=value;
        }
        //
        //Return the comment
        return comment;
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
        const sql=`ALTER TABLE ${this.entity.name}  MODIFY  ${this.name}
                     ${clause}  COMMENT  '${comment_str}'`;
        //
        //Run the query 
        await mutall.fetch('database', 'query', {sql});
    }

}
class alterable_relation extends column_foreign{
    //
    //
    //the constructor 
    constructor(entity, static_column){
        //
        //Create the parent 
        super(entity, static_column);
        //
        //Borroow methods from the column_foreign key. Use mixin???????
    }
    
    //
    //Displays the relationship represented by this relation and its metadata 
     //bnghvutfu75
    //Returns a table populated with the column name given that represents a relation 
    //and is metadata comment if any already saved at the database 
    display(div=null){
        //
        //Test if the method was callled with a div else create a div to append 
        //the components of a relation 
       if (div===null){
           //
           div = document.createElement('div');
       } 
       //
       //Place he relation id in the parent div
       div.setAttribute('ename', this.entity.ename);
       div.setAttribute('cname', this.name);
       div.setAttribute('id', 'relation');
            
      //
      //return the entire div 
      return div;
    }
    
    //
    //Get updated structure from the div. The div has the form (see above)
    //The outpyut comment has the structure
    //{start, type:{type, name}, end}
    //    
    get_comment(div){
        //
        //start with an empty comment
        const comment={};
        //
        //Get the children of the div{div#ename, div#type, div#metadata}
        const sections= div.children;
        //
        //loop through the inputs assigning the types
        for(let i=0; i<sections.length; i++){
            //
            //Get the element in the div
          const element= sections[i];
          //
          //Test if the element is a div
          //
          //Element is not a div
          if (element.nodeName===!'button'){
              return ;
          }
          //
          //element is a div
          //
          //Test if the id is an ename 
          if (element.id=== "start"){
              
              //Get the selected value 
              const value=element.value;
              //
              //Add it to the comment 
              comment["start"]= value;
          }
           if (element.id=== "end"){
              //
              //Get the end value 
              const value=element.value;
              //
              //Add it to the comment 
              comment["end"]= value;
          }
           if (element.id=== "type"){
              //
              //Get the the first radio input 
              const is_a= element.firstChild;
              //
              //test if checked
              if(is_a.checked){
                  //
                  //update the comment 
                  comment["type"]= {"type":"is_a"};
              }
              //Get the the last radio input 
              const has_a= element.lastChild.firstChild;
              //
              //test if checked
              if(has_a.checked){
                  //
                  //Get the name of the rerlation 
                  const name= element.firstChild.value;
                  //
                  //update the comment 
                  comment["type"]= {"type":"has_a",name};
              }  
          }
        }
    }
     
      //
    //Compiles and returns a clause that is required in the altering of this 
    //attribute
    get_clause(){
        //
        //the clause should majorly contain the datatype, null and the default 
        let nullable, $default;
         //
         //Fill the null clause 
        if (this.is_nullable ==='NO'){
           nullable =` NOT NULL`;
        }
        else{
             nullable=`NULL`;
        }
        //
        //Fill the default clause
        if (this.Default ===!null){
           Default  =` DEFAULT ${this.default}`;
        }
        else {
             $default  =`DEFAULT NULL`;
        }
        //
        //begin with an empty string 
        let clause = ``            
        //
        //Get the datatype of the column
         +`${this.data_type}`
         //
         //Get the null
         +`${nullable}`
         //
         //Get the default
         +`${$default}`;
        //
        //return the clause         
        return clause;
    }
     //
    //Compiles and returns a clause that is required in the altering of this 
    //attribute
    get_clause(){
        //
        //the clause should majorly contain the datatype, null and the default 
        let nullable, $default;
         //
         //Fill the null clause 
        if (this.is_nullable ==='NO'){
           nullable =` NOT NULL `;
        }
        else{
             nullable=`NULL `;
        }
        //
        //Fill the default clause
        if (this.Default ===!null){
           $default  =` DEFAULT ${this.Default} `;
        }
        else {
             $default  =``;
        }
        //
        //begin with an empty string 
        let clause = ``            
        //
        //Get the datatype of the column
         +`${this.data_type} `
         //
         //Get the null
         +`${nullable}`
         //
         //Get the default
         +`${$default}`;
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
        const sql=`ALTER TABLE ${this.entity.name}  MODIFY  ${this.name}
                     ${clause}  COMMENT  '${comment_str}'`;
        const name= this.entity.dbase.name;
        //
        //Run the query 
        await mutall.fetch('database', 'query', {name,sql});
    }

}

export {alterable_database,schema}