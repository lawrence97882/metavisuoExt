//
//Import the structure of the database that can be alterable
import * as metavisuo from './mtavisuo.js';
// 
//Import the php methods that are accesible to this application
import * as library from '../bolster/library.js'
import create_element from './create.js';

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
class page_graph extends metavisuo.schema.schema{
    //
    //The database name of the opened database it can be undefined since it is a user 
    //evoked input.
    public dbname?:string;
    // 
    //Get the type of the database to be opened
    public db_type?:metavisuo.schema.db_type;
    // 
    //The database that is currently being displayed.
    public dbase?:metavisuo.alterable_database;
    // 
    //The selector for database type.
    public type_selector?:HTMLSelectElement;
    // 
    //The selector for the dbname.
    public dbname_selector?:HTMLSelectElement;
    //
    //Use the querystring passed on from PHP to construct this page
    constructor(){super("page_graph");}
    // 
    //initialize this graph with the available databases for display 
    async initialize():Promise<void>{
        // 
        //Get the header section
        const header= <HTMLDivElement>document.querySelector('#header');
        // 
        //Create the dbselctor 
        this.type_selector= create_element(header,"select",{id:"type_selector"});
        // 
        //create the dbname selector that is populated by the onchange of the type selector 
        this.dbname_selector=create_element(header,"select",{id:"dbname_selector"});
        // 
        //Populate the selector with options.
        create_element(this.type_selector,"option",{textContent:"mysql",value:"mysql"});
        create_element(this.type_selector,"option",{textContent:"postgres",value:"postgres"});
        create_element(this.type_selector,"option",{textContent:"mssql",value:"mssql"});
        //
        //Add an event listener to the option that creates and populates the dbname selector 
        //with the available databases for that database type
        this.type_selector.onchange=async()=>await this.fill_selector;
    }
 
    //
    //Fomulate the sql and retrieve the database names from the local server which
    //populates the selector. This is on the assumption that all databases have a test 
    //database existing.
    async fill_selector():Promise<void>{
        //
        //Get the selected database type
        const type=<metavisuo.schema.db_type>this.type_selector!.value;
        // 
        //Fetch the database names that exist of this type.
        const dbnames= await this.exec(library.library,type,["test"],"")
        //
        //Append all fetched the database names to the selector 
        dbnames.forEach($dbname => {
                let dbasename = $dbname.dbname;
                //
                //Createan option using the $dbname
                let  $option = document.createElement('option');
                //
                //Set the text content as the dbase name 
                $option.textContent = dbasename;
                //
                //Append the child option to the selector
                selector.appendChild($option);
            });
            
        };
        //
        myfetch();
    }
    static get dbname(){
        //
        //Retrieve the selected option
        let sel = document.querySelector('select');
        return sel.options[sel.selectedIndex].text;  
    }
    //
    //Get the selected property and open a new database with it 
    static async changedb(){
        //
        //
        //Get the static database which is the php version of the database
        //this is to activate the library.js           
        const dbase = await page_graph.get_dbase(this.dbname);
        //
        //get the svg inner html from the javascript library 
        let $svg = databases[this.dbname].present();
        //
        //Get the svg element from the home page 
        let $content = document.getElementById("svg");
        //
        $content.innerHTML = $svg.innerHTML;
        //
        //Empty the selector with the hidden entities 
        const hidden = document.getElementById('hidden');
        const options=hidden.childNodes;
        for(let i=1; i<options.length; i++){
            hidden.removeChild(options[i]);
        }
        //
        //change the text content of the view database to close database
        //get the close dbase button 
        let close = document.getElementById('close_dbase');
        close.removeAttribute('hidden');
        close.textContent = 'close ' + this.dbname;
        //
        //popilate with the hidden entities also 
        this.fill_hidden();
    }
    //
    //Returns the dbase which is obtained via the javascript library 
    static async get_dbase(dbname){
        //
        //Check if the database is alraedy opened; if it is, use the opened 
        //database; otherwise, open a fresh one
        if (databases[dbname]!==undefined){
            return databases[dbname];
        }
        //
        //Get the static database which is the php version of the database
        //this is to activate the library.js
        //
        const _dbase = await mutall.fetch('database', 'export_structure', {name:dbname});
        //
        window.__static_dbase__= _dbase;
        const dbase = new alterable_database(_dbase);
        
        //
        //Add this database to the global collection
        databases[dbname]=dbase;
        //
        //Return the javascript database
        return dbase;
    }
    
    //
    //obtain the database request from the url using location.search
    static database_request_found($request) {
        //
        //tests if the url contains the dbname
        if (typeof $request['dbname'] === 'undefined' || $request['dbname'] === null) {
            //
            return false;
        } else {
            //
            //set the database name from the request property
            let dbname = $request['dbname'];
            return dbname;
        }
    }
    //
    //Loading a page sets the viewbox property
    static set_svg() {
        //Get the svg property  
        let svg = window.document.querySelector('svg');
        return svg;
    }

    //The view box property that controls panning and zooming.
    static get viewbox() {
        //
        //If eh viewbox is empty, fill it from the svg
        if (viewbox_.length === 0) {
            //
            //Get the svg tag 
            this.svg = this.set_svg();
            //
            //Retrieve the viewBox attribute
            let viewbox = page_graph.svg.getAttribute('viewBox');
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

    static set viewbox($v) {
        viewbox_ = $v;
    }

    //zoom function. True direction means to zoom out
    static zoom(dir = true) {
        //
        //get the third component of the viewbox which is the zoom
        let $zoom = page_graph.viewbox[2];
        //
        //Set the direction to + r -
        let $sign = dir ? 1 : -1;
        //
        //Increase/decrease zoom by, say, 100
        $zoom = $zoom + $step * $sign;
        //
        //Replace the 2nd and 3rd split values with the new zoom value
        page_graph.viewbox[2] = $zoom;
        page_graph.viewbox[3] = $zoom;
        //
        //Turn the array into text
        let $viewboxstr = page_graph.viewbox.join(" ");
        //
        //Assign the new view box to the svg viewBox Attribute
        document.querySelector('svg').setAttribute('viewBox', $viewboxstr);
    }
    //
    //Spans the graph to the left and to the right
    static side_pan(dir = true) {

        //
        //Geet the first compnent of the viewbox array which is the side pan 
        let $span = page_graph.viewbox[0];
        //
        //Set the direction to + r -
        let $sign = dir ? 1 : -1;
        //
        //Increase/decrease zoom by, say, 100
        $span = $span + $step * $sign;
        //
        //Replace the 1st element of the viewbox which is the side pan
        page_graph.viewbox[0] = $span;
        //
        //Turn the array into text
        let $viewboxstr = page_graph.viewbox.join(" ");
        //
        //Assign the new view box to the svg viewBox Attribute
        document.querySelector('svg').setAttribute('viewBox', $viewboxstr);
    }
    //
    //pans the chart in up down direction
    static top_pan(dir = true) {
        //
        //Geet the second compnent of the viewbox array which is the top pan 
        let $span = page_graph.viewbox[1];
        //
        //Set the direction to + r -
        let $sign = dir ? 1 : -1;
        //
        //Increase/decrease zoom by, say, 100
        $span = $span + $step * $sign;
        //
        //Replace the 2nd element of the viewbox which is the top pan
        page_graph.viewbox[1] = $span;
        //
        //Turn the array into text
        let $viewboxstr = page_graph.viewbox.join(" ");
        //
        //Assign the new view box to the svg viewBox Attribute
        document.querySelector('svg').setAttribute('viewBox', $viewboxstr);
    }
    
    //
    //Return a selected entity if there is a selected element or a false if no
    //selected element 
    static get_selected(){
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
        const entity = databases[page_graph.dbname].entities[ename];
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
    //This method creates the array of teh form:-
    //[{ename, cx, cy}, ...]
    //where ....an array consisting of objects where the coordinates
    //of various ellipses are saved for further altering of the database 
    //structure. 
    static async save_view() {
        //
        //Get all the new coordinates of the entities
        const coordinates = page_graph.get_coordinates();
        //
        //formulate sql alter comand statements to save the structure 
        const sqls = coordinates.forEach(coordinate=>{
            const {name, cx, cy} = coordinate;
            //
            //Get the existing entity comment 
            const comment= databases[page_graph.dbname].entities[name].comment;
            //
            //Add coodinates to the comment if they do not exist or update the existing ones
            //
            //update the coodinates of this entity 
            comment.cx= cx;
            comment.cy= cy; 
            //
            //save the comment 
            databases[page_graph.dbname].entities[name].alter(comment);
        });
    }
    
    //
    //Returns all the coordinates of the entities of the current database
    static get_coordinates(){
        //
        //Let coordinates be an empty array where we will save all the coodinates
        //of the ellipses for saving 
        const coordinates = [];
        //
        //Get the collection of all the entities represented by the ellipses   
        const ellipses = document.querySelectorAll('ellipse');
        //
        //Loop through the collection of the ellpses to obtain the new coodinates of each 
        ellipses.forEach($e => {
            //
            //this is the object to which we save the coodinates 
            const coordinate = {};
            //
            //Get the name of the entity
            coordinate.name =$e.getAttribute('id');
            // 
            // Test if the entity has saved its new coodinates
            // 
            //1.Does not contains the new coodinates save the previous old coodinates
            if (parseInt($e.getAttribute('newx'))===0){
               //
               //set the coodinate 
               coordinate.cx= $e.getAttribute('cx');
               coordinate.cy= $e.getAttribute('cy');
               //
                //Collect the x and y coordinates of the  ellipses into an array
                //Push the coodinate to the array 
                coordinates.push(coordinate);
            }
            //
            // New coordinates have been saved 
            else {
               coordinate.cx = parseInt($e.getAttribute('newx'));
               coordinate.cy = parseInt($e.getAttribute('newy'));
               //  
               //
                //Collect the x and y coordinates of the  ellipses into an array
                //Push the coodinate to the array 
                coordinates.push(coordinate);
            }
            //
            //Collect the x and y coordinates of the  ellipses into an array
            //Push the coodinate to the array 
            coordinates.push(coordinate);
        });
        //
        return coordinates;
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

//
//
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
// 
//Onload of this class call the initialize method.
window.onload = async () => {
    const Graph=new page_graph();
    Graph.initialize();
};