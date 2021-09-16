<html>
    <head>
        <link rel="stylesheet" type="text/css" href="home.css">
        <<script src="dragndrop_library.js"></script>
        <script <script src="kld-intersections/dist/index-umd.js"></script> 
        <script type="module">
            // 
            //Import the matavisuo module 
            import graph from './page_graph.js';
            // 
            //Make the graph public 
            window.graph=graph;
        </script>
    </head>
    <body>
        <div class="navbar">
            <div class="dropdown">
              <button class="dropbtn">Entity operations
                <i class="fa fa-caret-down"></i>
              </button>
              <div class="dropdown-content">
                  <li id="alter_entity" onclick="graph.current.display_entity()">Display entity</li>
                  <li id="review_record" onclick="graph.current.review_entity()">Review Entity</li>
                   
              </div>
            </div> 
            <div class="dropdown">
              <button class="dropbtn">Selected  
                <i class="fa fa-caret-down"></i>
              </button>
              <div class="dropdown-content">
                  <li id="alter_entity" onclick="graph.current.edit_relation()">Edit relation</li>
                  <li id="alter_entity" onclick="graph.current.edit_attributes()">Edit attributes</li>
                  <li id="alter_entity" onclick="graph.current.display_entity()">Edit entity</li>
                  <li id="hide_entity">Hide Selected</li>
                  <li id="delete_entity">Delete selected</li>
              </div>
            </div>
            <div class="dropdown">
              <button class="dropbtn">view
                <i class="fa fa-caret-down"></i>
              </button>
              <div class="dropdown-content">
                <li id="save_structure" onclick="graph.current.save_view()">Save view</li>
                <li id="show_entity" onclick="$graph.current.show_element()">Show Entity</li>
                <li id="hidden_entities">Hidden entities</li>
              </div>
            </div> 
        </div>
        <div id="select">
            <button type="button" onclick="graph.current.zoom(false)"><b>+</b></button>
            <button type="button" onclick="graph.current.side_pan(true)"><b>&lt;</b></button>
            <button type="button" onclick="graph.current.top_pan(true)" ><b>˄</b></button>
            <button type="button"onclick="graph.current.side_pan(false)"><b>&gt;</b></button>
            <button type="button" onclick='graph.current.zoom(true)'><b>-</b></button>
            <button type="button" onclick="graph.current.top_pan(false)"><b>˅</b></button>
            <select id="db_type" placeholder="select type of database" onchange="graph.current.fill_selector()"> 
            </select>
            <select id="db_name" placeholder="select your database" onchange="graph.current.change_db()">
            </select>
            <button id="close_dbase" onclick="graph.current.close_dbase()">Close database</button> 
       </div> 
            <div id="content">
                <svg height="100%" width="100%" viewbox="100 -100 3000 2400" onload="new dragndrop()"id="svg">
                </svg>
            </div>
       
</body>
</html>
