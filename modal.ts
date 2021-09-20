import { create_html_element } from './create';
//
//To create a dialog boxes while interacting with users of this application
class modal{
    // 
    //The html element for the clossing  of this modal
    public close:HTMLElement;
    // 
    //The html element that contains the user data requested
    public content:HTMLElement;
    // 
    //The document that hosts this modal
    public doc:document;
    // 
    //The style tag
    insert_styles():HTMLStyleElement{
        // 
        //
        const style= create_html_element(this.doc,"style",{id:"modal_obj", innerHTML:this.modal_text()});
        return style;
    }
    // 
    //
    modal_text():string{
        return `<style>`
            
            /**
             *  The Modal (content element styling) 
             * 1.BY default these elements are hidden
             * 2.Positions at one places
             * 3.Background color setting
             * */
           +`.modal {
                display: none; /* Hidden by default */
                position: fixed; /* Stay in place */
                z-index: 1; /* Sit on top */
                padding-top: 100px; /* Location of the box */
                left: 0;
                top: 0;
                width: 100%; /* Full width */
                height: 100%; /* Full height */
                overflow: auto; /* Enable scroll if needed */
                background-color: rgb(0,0,0); /* Fallback color */
                background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
            }`
            
            /**
             * Modal Content : these are any html element found within the modal element
             * helps to control the width and 
            */
            +`.modal-content {
                background-color: #fefefe;
                margin: auto;
                padding: 20px;
                border: 1px solid #888;
                width: 80%;
            }`
            /**
             * The Close Button
             * position the button that closses this model
             */
            +`.close {
            color: #aaaaaa;
            float: right;
            font-size: 28px;
            font-weight: bold;
            }`
        +`</style> `;
    }
}