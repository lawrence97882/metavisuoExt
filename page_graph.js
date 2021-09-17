//
//Import the structure of the database that can be alterable
import * as metavisuo from './mtavisuo.js';
//
//
import {create_html_element} from './create.js'
//
//Panning and zooming step (you may want to consider 2 steps, one for zooming
//the other for panning
var step = 100;
//
//
var viewbox_ = [];
//
//Keep track of databases
var databases={};
//
//keep track of the database names that is required to access the database 
var dbname=null;
//
// 
var current_db=null;


////This class was motivated by the need to present any data model in a graphical 
//way
export default class graph extends metavisuo.schema.schema{
    /**
    //
    //The database that is currently being displayed.
     * public dbase?:metavisuo.alterable_database;
    // 
    //The selector for database type.
     *public type_selector?:HTMLSelectElement;
    // 
    //The selector for the dbname.
      *public dbname_selector?:HTMLSelectElement;
    // 
    //The svg element where the presentation is taking place.
        *public svg?:SVGSVGElement;
    **/
    // 
    // The static object to attach the pagegrah event listeners
    static current; /*:graph*/
    //
    //Use the querystring passed on from PHP to construct this page
    constructor(){super("graph");}
    // 
    //initialize this graph with the available databases for display 
    async initialize()/*:Promise<void>*/{
        // 
        //Get the header section
        const header= /*<HTMLDivElement>*/document.querySelector('#header');
        // 
        //Create the dbselctor 
        this.type_selector= document.getElementById("db_type");;
        // 
        //create the dbname selector that is populated by the onchange of the type selector 
        this.dbname_selector=document.getElementById("db_name");
        // 
        //Populate the selector with options.
        create_html_element(this.type_selector,"option",{textContent:"MYSQL",value:"mysql"});
        create_html_element(this.type_selector,"option",{textContent:"PostgreSQL",value:"postgres"});
        create_html_element(this.type_selector,"option",{textContent:"MicrosoftSQL",value:"mssql"});
        // 
        //Set the svg element. 
        this.svg=/*<SVGSVGElement>*/document.querySelector("#svg");
        // 
        //Save the view box 
        this.viewbox= this.get_viewbox();
    }
 
    //
    //Fomulate the sql and retrieve the database names from the local server which
    //populates the selector. This is on the assumption that all databases have a test 
    //database existing.
    async fill_selector()/*:Promise<void>*/{
        // 
        //Empty the options in the dbnames of the previous selection;
        this.dbname_selector.innerHTML="";
        //
        //Get the selected database type
        const type=/*<metavisuo.schema.db_type>*/this.type_selector.value;
        // 
        //Fetch the database names that exist of this type.
        const dbnames= await this.exec(type,["test"],"get_dbnames",[]);
        //
        //Append all fetched the database names to the selector 
        dbnames.forEach(dbase=> {
            //
            create_html_element(this.dbname_selector,"option",{textContent:dbase.dbname,value:dbase.dbname});
        });
    }
    // 
    //The currently selected dbname as set by the user.
    get dbname()/*:string*/{return this.dbname_selector.value;}
    // 
    //The type of database selected by the user.
    get db_type()/*:metavisuo.schema.db_type*/{return /*<metavisuo.schema.db_type>*/this.type_selector.value;}
    //
    //Display the newly selected database
    async change_db(){
        // 
        //Clear the text content of the svg so as to append new content
        this.svg.innerHTML="";
        //
        //
        //Get the static database which is the php version of the database
        //this is to activate the library.js           
        this.dbase = await this.get_dbase(this.db_type,this.dbname);
        //
        //Append the various database componets to this svg.
        this.dbase.present(this.svg);
    }
    //
    //Returns the dbase which is obtained via the javascript library 
    async get_dbase(dbtype/**:metavisuo.schema.db_type*/, dbname/*:string*/)/*:Promise<metavisuo.alterable_database>**/{
//        //
//        //Check if the database is alraedy opened; if it is, use the opened 
//        //database; otherwise, open a fresh one
//        if (metavisuo.alterable_database.opened_databases[dbtype][dbname]===undefined){
//            //
            //Get the static database which is the php version of the database
            //this is to activate the library.js
            const _dbase = await this.exec(dbtype,[dbname],"export_structure",[])
            //
            //Create the schema database
            const schema = new metavisuo.schema.database(_dbase);
            //
            return new metavisuo.alterable_database(schema);
//        }
//        //
        //Return the javascript database
        return metavisuo.alterable_database.opened_databases[dbtype][dbname];
    }

    //The view box property that controls panning and zooming.
    get_viewbox()/*:Array<number>[4]*/ {
        //
        //If the viewbox is empty, fill it from the svg
        if (viewbox_.length === 0) {
            //
            //Retrieve the viewBox attribute
            let viewbox = this.svg.getAttribute('viewBox');
            //
            //split the view box properties using the space 
            let $split_strs = viewbox.split(" ");
            //
            //Convert the strings to numbers
            viewbox_ = $split_strs.map($x => {
                return parseInt($x);
            });
        }
        //
        return viewbox_;
    }
    //
    //zoom function. True direction means to zoom out
    zoom(dir = true) {
        //
        //get the third component of the viewbox which is the zoom
        let zoom = this.viewbox[2];
        //
        //Set the direction to + r -
        let sign = dir ? 1 : -1;
        //
        //Increase/decrease zoom by, say, 100
        zoom = zoom + step * sign;
        //
        //Replace the 2nd and 3rd split values with the new zoom value
        this.viewbox[2] = zoom;
        this.viewbox[3] = zoom;
        // 
        //Display the new settings 
        this.display();
    }
    // 
    //Changes the view setting to a user defined setting 
    display()/*:void*/{
        //
        //Turn the array into text
        let viewboxstr = this.viewbox.join(" ");
        //
        //Assign the new view box to the svg viewBox Attribute
        this.svg.setAttribute('viewBox', viewboxstr);
    }
    //
    //Spans the graph to the left and to the right
    side_pan(dir = true) {
        //
        //Geet the first compnent of the viewbox array which is the side pan 
        let span = this.viewbox[0];
        //
        //Set the direction to + r -
        let sign = dir ? 1 : -1;
        //
        //Increase/decrease zoom by, say, 100
        span = span + step * sign;
        //
        //Replace the 1st element of the viewbox which is the side pan
        this.viewbox[0] = span;
        //
        this.display();
    }
    //
    //pans the chart in up down direction
    top_pan(dir = true) {
        //
        //Geet the second compnent of the viewbox array which is the top pan 
        let span = this.viewbox[1];
        //
        //Set the direction to + r -
        let sign = dir ? 1 : -1;
        //
        //Increase/decrease zoom by, say, 100
        span = span + step * sign;
        //
        //Replace the 2nd element of the viewbox which is the top pan
        this.viewbox[1] = span;
        // 
        this.display();
    }
    
    //
    //Return a selected entity if there is a selected element or a false if no
    //selected element 
    get_selected(){
        //
        //Get the affected/selected entity that we want to alter. The altering 
        //an entity can only happen if there is a selected element 
        const selection = document.querySelector('[selected=true]');
        //
        //Test if the selection is a null or undefined and return a false if true 
        if (selection===null|| selection===undefined){
            //
            //Return a false since no entity was selected 
            return false;
        }
        //
        //Test if what was selected is an ellipse 
        if (selection.nodeName !== "ellipse"){
            //
            //If the selected element is not an ellipse return a false 
            return false ;
        }
        //
        //1. Get the selected entity's name
        const ename= selection.id; 
        //
        //Derive the affected entity from the dbase
        const entity =this.dbase.entities[ename];
        // 
        //Return the selected entity 
        return entity;
    }
    
   
    //Review the records of the selected entity
    static review_entity(){
        //
        //returns either a swelected entity or a false 
        const $entity = this.get_selected();
        //
        //If no selected entity return alert an error msg 
        if ($entity===false){
            alert('please select an entity to do this operation');
            //
            return ;
        }
        //
        //call the review methord for this name
        $entity.review();
    }
    
    
    //Create a new record for the selected entity using a new window
    static create_records() {
        //
        //Get the $name of the selected entity using the id as tname meaning table name
        let $tname = document.querySelector('[selected=true]').id;
        //
        //Open an empty brand new window
        let $win = window.open("page_create.php");
        //
        $win.onload = () => {
            //
            //Get the $body element of $win (window).
            let $body = $win.document.querySelector('form');
            //
            //looping through all the columns to create a label inputs
            for (let $cname in databases[page_graph.dbname].entities[$tname].columns) {

                //
                //Get the named column
                let $column = databases[page_graph.dbname].entities[$tname].columns[$cname];
                //
                //Append all the column as lables appended to the body of the new window 
                $column.display($body);
            };
        };

    }
    
    //
    //Displays the entity with the metadata contained in is providing an interface 
    //for editing 
   static display_entity(entity=null){
        //
        //Test if the user called this method with an entity else check if any 
        //was selected for this operation
        //no entity was passed to the method 
        if (entity===null){
            //
            //Get the affected/selected entity that we want to alter. The altering 
            //an entity can only happen if there is a selected element 
            const selection = document.querySelector('[selected=true]');
            //
            //If no selected element send and alert the there must be a selected element 
            if(selection===null){
                alert('Select an element to do this operation');
                return;
            }  
            //
            //1. Get the selected entity's name
            const ename= selection.id; 
            //
            //Derive the affected entity from the dbase
            entity = databases[page_graph.dbname].entities[ename];
        }
        //
        //Get the current comment for this entity 
        const comment= entity.comment;
        //
        //Get the entity ellipse representing this entity so as to update its
        //current position in the svg 
        const ellipse = document.getElementById(`${entity.name}`);
        //
        //Update the comment coodinates to make them current if the user may have 
        //draged the ellipse before selecting 
        if (ellipse.getAttribute('newx')===!"0"){
            comment.cx= parseInt(ellipse.getAttribute('newx'));
            comment.cy= parseInt(ellipse.getAttribute('newy'));
        }
        //
        //Call the display of the alterable entity inorder to display
        const display= databases[page_graph.dbname].entities[entity.name].display(comment);
        //
        //The new dialogue should contain a form with three checkboxes reporting, 
        //administration, and visible ,  text input for title, the cx and the cy
        //and a save button
        //
        //Open a new window based on the foxed template, entity_view.php
        let win = window.open("entity_view.php","mywindow", "location=1,status=1,scrollbars=0,width=500,height=300,resizable=0");
        //
        //Bootrap to popilate the window with the display of this entity
        win.onload =() => {
            //
            //Get the body of the new window
            const body = win.document.querySelector(`body`);
            
            body.appendChild(display);
            //
            //Add an event listener to the save to enable the save button to enable a save
            //
            //get the save button 
            const save=win.document.getElementById('save');
            //
            //Add a click event listener for saving
            save.addEventListener('click',()=>{
                //
                //Get all the inputs that contains the edited data
                const div = win.document.querySelector('div');
                //
                //Extract the data and save the changes
                entity.get_comment(win);;
                //Close the window
                 win.close();
            });
            //
            //get the cancel bu tton 
            const cancel=win.document.getElementById('cancel');
            //
            //Close the  window 
            cancel.addEventListener('click', ()=>{win.close();});
        };    
    }
    
    //
    //Fills the tspan at the end of the relation
    static fill_end(){
        //
        //Get the parent selector 
        let sel = document.querySelector('select');
        //
        //Get the select children 
        const options = sel.options;
        //
        //Loop through the nodelist to obtain the option not selected 
        for (let i=0; i<options.length; i++){
           let option = options[i];
           //
           //if not selected get the value 
           if (option.selected===false){
               //
               //Get the span 
               let span = document.getElementById('end');
               span.textContent=`${option.value}`;
           }
        }
    }

    //
    //displays a list of hidden element that are part of this database and upon select 
    //sets the invisible comment to false and the element becomes visible 
    static show_entity(){
        //
        //Get the target element 
        const sel = document.getElementById('hidden');
        //
        //Get the selected entity name 
        const ename= sel.options[sel.selectedIndex].text;;
        //
        //Get the comment of te selected element 
        const comment= databases[page_graph.dbname].entities[ename].comment;
        //
        //change the visible property to false and update the database 
        comment.visible=false;
        //
        //get the ellipse referenced 
        const group= document.getElementById(`${ename}_group`);
        //
        //Remove the invisible class attribute 
        group.classList.remove('hide');
        //
        //Get the relations that reference this entity 
        const relations= document.querySelectorAll('line');
        //
        //loop through the diplaying only those entities that do not reference a 
        //hidden entity 
        for(let i=0; i<relations.length; i++){
            //
            //Get the entities referenced by the relation
            const relation = relations[i];
            const enames= relation.getAttribute('id').split(".");
            //
            //
            if (enames[0]===ename){
                //test if the referenced entity is hidden 
                //
                //Get the referenced entity 
                const end = document.getElementById(`${enames[1]}_group`);
                //
                //If the end entits is not hidden unhide the relation
                const invisible=end.classList.contains('hide');
                if(invisible === false){
                    //
                    //unhide only thise whose end entity are not hidden 
                    relation.classList.remove('hide');
                    const circle= document.getElementById(`${enames[0]}_${enames[1]}`);
                    circle.classList.remove( "hide");
                }
                
            }
            //
            //
            if (enames[1]===ename){
                //test if the referenced entity is hidden 
                //
                //Get the referenced entity 
                const start = document.getElementById(`${enames[0]}_group`);
                //
                //Test if the start of this relation is invisible 
                const invisible=start.classList.contains('hide');
                //
                //If the end entits is not hidden unhide the relation 
                if(invisible===false){
                    //
                    //unhide only thise whose end entity are not hidden 
                    relation.classList.remove('hide');
                    const circle= document.getElementById(`${enames[0]}_${enames[1]}`);
                    circle.classList.remove( "hide");
                }
                
            }
       
        }
        //
        //Save the current coodinates of the entity 
        databases[page_graph.dbname].entities[ename].alter(comment);
        //
        //update the hidden entities selector 
        //
        //Get the selector that contains the hidden entities 
        const select = document.getElementById('hidden');
        //
        //Get the entity shown
        const option= document.getElementById(`hidden_${ename}`);
        select.removeChild(option);
    }
      
    //
    //Saves the current positions of the ellipses in the database for the persistence of the
    //the position of the ellipses in the svg. this happens by collecting the information in the 
    //following manner[{ename:string,comment:string}]
    async save_view()/*:Promise<void>*/ {
        //
        //Get all the new coordinates of the entities
        const changes/**Array<{ename:string,comment:string}> */= this.complete_table_comment();
        // 
        //Push the changes about the updated metadata to the database
        const ok/** boolean*/=await this.exec(this.db_type,[this.dbname],"Update_entity_metadata",[changes])
        console.log(ok);
        //
        //Report the outcome of the updatting process
        if(ok) alert("Your structure has been succesfully saved");
        else alert("Errors occured when saving the new display see the error in the errors tab"); 
    }
    
    //
    //Compiles all the metadata of a prticular entity preparing to be saved as a comment 
    //to the respective entity.
    complete_table_comment()/**Array<{ename,comment}> */{
        //
        //Get the collection of all the entities represented by the ellipses that represents all the 
        //tables of a particular database.  
        const ellipses/**Array<SVGEllipseElement> */ = Array.from(document.querySelectorAll('ellipse'));
        // 
        //Return the the ename and the comment that is associated with each entity. i.e., {ename, comment}
        return /**Array<{ename,comment}> */ ellipses.map(ell=>{
            // 
            //The ename of this entity is the id of this entity.
            const ename=ell.id;
            //
            //Get the entity represented by this entity.
            const entity= this.dbase.entities[ename];
            //
            //Update this entity with the new state 
            entity.update_metadata(ell);
            //
            //Save all the metadata as a comment
            const comment=JSON.stringify(entity.metadata);
            //
            //Return the the ename and comment structure expected.
            return {ename,comment};
        })
    }

    //
    //on click we close the database 
    static close_dbase() {
        location.reload();
    }
    //
    //Displays the entity attributes with the metadata and the ulterable properties
    //as an interfase for updates
    static edit_attributes(){
        //
        //Test if there is a selected element is an entity 
        //
        //Get the selected element 
        const selected = document.querySelector('[selected=true]'); 
        //
        //1. There was no element selected alert an element has to selected 
        if(selected===null || selected===undefined){
            alert('Select an ellipse to do this operation');
        }
        //
        //when the selected element is an ellipse
        if(selected.nodeName ===!'ellipse' ){
            alert('This operation can  only happen with an ellipse selected');
        }
        //
        //Get the selected element which is an ellipse and a text tspan
        const e_name = selected.id;
        //
        //Open an empty brand new window
        let win = window.open("alter_attributes.php","mywindow", "location=1,status=1,scrollbars=0,width=600,height=600,resizable=0");
        //
        //Build the new window by populating it with the column for editing the 
        //the comment
        win.onload =() => {        
            //
            //Get the table element
            const table = win.document.querySelector('table');
            //
            //Fill the entity name 
            const td= win.document.getElementById('entity_name');
            td.textContent=`${e_name}`;
            //
            //populate the table with the various raws 
            databases[page_graph.dbname].entities[e_name].display_attributes(table);
            //Add an event listener to the save to enable the save button to enable a save
            //
            //get the save button 
            const save = win.document.getElementById('save');
            //
            //Add a click event listener for saving
            save.addEventListener('click',async()=>{
                //
                //Get the table from which the column was displayed in
                const table= win.document.querySelector('table');
                //
                //Update the columns at the alterable entity {alter column}
                 databases[page_graph.dbname].entities[e_name].alter_attributes(table); 
                //close the new window
                win.close();
            });
            //
            //get the cancel button 
            const cancel=win.document.getElementById('cancel');
            //
            //Close the  window 
            cancel.addEventListener('click', ()=>{win.close();});
        };
        //
    }
    
    //
    //Display the relation in a new window to enable the users to edit 
    static edit_relation(){
        //
        //Test if there is a selected element is a relation 
        //
        //Get the selected element 
        const selected = document.querySelector('[selected=true]'); 
        //
        //1. There was no element selected alert an element has to selected 
        if(selected.nodeName===!'line'|| selected===undefined){
            alert('Select a relation to do this operation');
        }
        //
        //There was a selected element test if it is a line that representd a 
        //a relation 
            //
            //if the selected element was an ellipse edit the attributes of this entity 
            //or if the selected element is a line that represents a relation
            //
            //Get the name of the relation
            const name=selected.id;
            //
            //Split the name to obtain the column name 
            const lnames=name.split('.');
            //
            //the second component is the column name
            const c_name= lnames[1];
            const ename = lnames[0];
            //
            //Open an empty brand new window
            let win = window.open(
                "alter_relation.php?id="+name,"mywindow", 
                "location=1,status=1,scrollbars=0,width=600,height=600,resizable=0");
            //
            //Build the new window by populating it with the column for editing the 
            //the comment
            win.onload =() => {        
                //
                //get the save button 
                const save = win.document.getElementById('save');
                //
                //Add a click event listener for saving
                save.addEventListener('click',()=>{
                    this.save_relation(win, ename, c_name);
                    win.close();
                });
                //
                //get the cancel bu tton 
                const cancel=win.document.getElementById('cancel');
                //
                //Close the  window 
                cancel.addEventListener('click', ()=>{win.close();});
          };
        
    }
    //
    //Saves the relation by compiling a comment
    static save_relation(win, ename, cname){
        const comment= {};
        //
        //Get the value of the start 
        comment["start"]=win.document.getElementById("start").value;
        //
        //Get the end of the comment
       comment["end"]=  win.document.getElementById("end").innerText;
        //
        //Get the is_a selection option inorder to test if selected
        const is_a=win.document.getElementById("is_a").checked;
        //
        //if the is_a is selected save the type of the relation as an is_a 
        if(is_a){
          comment["type"]={"type":"is_a"};  
        }
        //
        //GEt the option for the has_a relation to test if it is selected 
        const has_a =win.document.getElementById("has_a").checked;
        //
        //If selected save the type of the relaation as a has a and also include the
        //title of the relation 
        if(has_a){
          comment["type"]={"type":{"has_a":win.document.getElementById("title").value}};
        }
        //
        //update the database 
        databases[page_graph.dbname].entities[ename].columns[cname].alter(comment);
    }
    
    //
    //fill the selector with the hidden entities 
    static fill_hidden(){
        //
        //Get the select  to be popilated with the hidden entities 
        const select= document.getElementById('hidden');
        //
        //Get all the hidden entities 
        const entities = databases[page_graph.dbname].entities;
         //
         //filter entities and remain with only those with a hidden attribute at the comment
         //
         //declare an empty array to store the hidden entities
         const  hidden_entities= [];
         //
         //loop through the entities and pust only those with hidden attribute into the array 
         for (let [key, value] of Object.entries(entities)) {
           //Get the comment in this entity 
            const visible = value.comment.visible;
            //
            //If the visible true push the entity into the array 
             if (visible==='true'|| visible===true){
                 //
                 //push the entity into the array 
                 hidden_entities.push([key]);
            } 
         }
        //
        //loop through the hidden names creating an option for each and appending each to the  select
        hidden_entities.forEach(name=>{
            //
            //Create an option 
            let option = document.createElement('option');
            //
            //Set the text content of the option this name 
            option.textContent=`${name}`;
            option.setAttribute('id',`hidden_${name}`);
            //
            //Append the option to the select 
            select.appendChild(option);
        }); 
    }
 
    //
    //Sets the attribute hidden to true to the selected element to hide its visibility 
    static hide_element(evt) {
        //
        //Get the selected elements name which is its id.
        const element = document.querySelector('[selected=true]').id;
        //
        //Get the selected group containing the text and the attributes t spans 
        const group = document.getElementById(`${element}_group`);
        //
        //Set attribute hidden to the selected element to true 
        group.classList.add('hide');
        //
        //Get all the relation inorder to hide all the relation related with the 
        //selected element 
        const relations = document.querySelectorAll('line');
        //
        //loop through all the lines 
        relations.forEach($e => {
            //
            //Get the id
            let line_name = $e.getAttribute('id');
            //
            //Split the line names to obtain the entities linked by the line 
            let e_name = line_name.split('.');
            //
            //Test if the relation starts from the selected element
            if (e_name[0] === element) {
                //
                //Set the hidden attribute to true 
                $e.classList.add('hide');
                //
                //Get the line referencing this relation 
                let circle = document.getElementById(`${e_name[0]}_${e_name[1]}`);
                //
                //hide the circle
                circle.setAttribute('class', 'hide');
            }
            //
            //Test if the relation ends at the selected element 
            else if (e_name[1] === element) {
                //
                //Set the hidden attribute to true 
                $e.setAttribute('class', 'hide');
                 // 
                 //Hide the circle rellating to this relation 
                let circle = document.getElementById(`${e_name[0]}_${e_name[1]}`);
                //
                //hide the circle
                circle.setAttribute('class', 'hide');
            }
        });
        const comment =databases[page_graph.dbname].entities[element].comment;
        comment.visible= true;
       //
       //save the visible property at the database  
        databases[page_graph.dbname].entities[element].alter(comment);
        //
        //update the hidden entities selector to add this entity
        const option = document.createElement('option');
         option.textContent=`${element}`;
         option.setAttribute('id',`hidden_${element}`);
        //
        //append the option 
        const selector= document.getElementById('hidden');
        selector.appendChild(option);
    }
    
}
// 
//Onload of this class call the initialize method.
window.onload = async () => {
    graph.current=new graph();
    graph.current.initialize();
};