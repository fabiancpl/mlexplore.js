
var data,
  config,
  autoRun = true,
  visibleData,
  color_feature;

function updateCluster() {

  // Call function to run clustering model
  var clusters = cluster( visibleData, config );

  // Set the new feature to be encoded by color
  color_feature = 'cluster';

  // Update the dataset with the clustering model results
  clusters.forEach( ( d, i ) => {
    visibleData[ i ][ color_feature ] = d;
  } );

  // Create the new feature in the configuration 
  if( config.features.find( d => d.name === color_feature ) === undefined )
    config.features.push( {
      "name": "cluster", 
      "type": "categorical", 
      "project": false
    } );

  // Update Encode Color and Projection panels
  updateEncodeColor();
  updateProjection( run_model = false );

}

// Project the data calling re-train model if specified
function updateProjection( run_model = true ) {

  if( run_model ) {

    var projection = project( visibleData, config );
  
    projection.forEach( ( d, i ) => {
      visibleData[ i ][ 'x' ] = d[ 0 ];
      visibleData[ i ][ 'y' ] = d[ 1 ];
    } );

  }

  var chart = projectionChart()
    .x( ( d ) => d.x )
    .y( ( d ) => d.y  )
    .z( ( d ) => d[ color_feature ]  );

  d3.select( '#projection' )
    .attr( 'class', null )
    .datum( visibleData )
    .call( chart );

}

// Load the dataset requested by the user
function loadData( url ) {

  // Load the dataset in D3 format
  d3.csv( url, d3.autoType ).then( ( data ) => {

    console.log( 'Dataset loaded!' );

    // Save the dataset for global access
    this.data = data;
    visibleData = data;


    // If configuration file was not found,
    // Get features from data and assign by default type
    if( config === undefined ) {
      config = {};
      config.features = [];
      keys = Object.keys( data[ 0 ] );
      keys.forEach( ( k ) => {
        config.features.push( { 'name' : k, 'type' : 'categorical', 'project' : true } );
      } );
    }
    
    // Initialize Feature Selection panel
    initFeatureSelection();

    // Initialize Encode Color panel
    updateEncodeColor();

    // Initialize and put data in Navio
    updateNavio();

    // Update the projection
    updateProjection();

  } );

}

// Find a configuration file previously saved and try to load it
// The name of the configuration file it is expected to be the same and its format must be json
function loadConfig( url, filename ) {

  // Build the name of the configuration file
  var configname = filename.split( '.' );
  configname[ configname.length - 1 ] = '.json';
  configname = configname.join( '' );

  // Load the the configuration file
  d3.json( './config/' + configname ).then( ( config ) => {

    console.log( 'Configuration founded!' );

    // Save the configuration for global access
    this.config = config;
    
    // Load the dataset
    loadData( url ); 

    // Find features for color encoding
    var color_features = config.features.filter( d => d.color === true );
    color_feature = color_features[ 0 ].name;

  } ).catch( ( error ) => {

    console.log( 'Configuration not found!' );
    
    // Load the dataset
    loadData( url );

  } );

}

// Event handler for loading a dataset by the user
d3.select( '#file-input' )
  .on( 'change', function() {

    // Get the file name
    var file = d3.event.target.files[ 0 ];
    if ( !file ) return;
    d3.select( '#file-name' ).html( file.name );
    
    // Get the path of the file and call the function for load it
    var reader = new FileReader();
    reader.onloadend = function( evt ) {
      var dataUrl = evt.target.result;
      loadConfig( dataUrl, file.name );
    };
    reader.readAsDataURL( file );

  } );