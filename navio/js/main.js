
var dataFileURL,
  configFileURL,
  datasetName;

var data,
  config,
  projectionConfigTemp,
  clusteringConfigTemp,
  autoRun = true,
  visibleData,
  colorFeature;

function getProjectionFeatures() {

  var features = config.features.filter( f => f.project === true );
  var featureNames = []; 

  features.forEach( f => featureNames.push( f.name ) );

  return featureNames;

}

function updateCluster() {

  // Verify the state of the input for run the clustering on projected data
  var run_on_projection = d3.select( '#runClusteringOnProjection' ).property( 'checked' );

  // Call function to run clustering model
  var clustering = cluster( visibleData, run_on_projection );

  // Set the new feature to be encoded by color
  colorFeature = 'cluster';

  // Update the dataset with the clustering model results
  clustering[ 'results' ].forEach( ( d, i ) => {
    visibleData[ i ][ colorFeature ] = d;
  } );

  config[ 'models' ][ 'clustering' ] = clustering[ 'hyper-parameters' ];

  // Create the new feature in the configuration 
  if( config.features.find( d => d.name === colorFeature ) === undefined )
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

    var projection = project( visibleData );
  
    projection[ 'results' ].forEach( ( d, i ) => {
      visibleData[ i ][ 'x' ] = d[ 0 ];
      visibleData[ i ][ 'y' ] = d[ 1 ];
    } );

    if( config[ 'models' ] === undefined ) config[ 'models' ] = {};
    config[ 'models' ][ 'projection' ] = projection[ 'hyper-parameters' ];

    // Create the new feature in the configuration 
    if( config.features.find( d => d.name === 'x' ) === undefined )
      config.features.push( {
        "name": "x", 
        "type": "sequential", 
        "project": false
      }, {
        "name": "y", 
        "type": "sequential", 
        "project": false
      } );

  }

  var chart = projectionChart()
    .x( ( d ) => d.x )
    .y( ( d ) => d.y  )
    .z( ( d ) => d[ colorFeature ]  );

  d3.select( '#projection' )
    .attr( 'class', null )
    .datum( visibleData )
    .call( chart );

}

// Load the dataset requested by the user
function loadData() {

  // Load the dataset in D3 format
  d3.csv( dataFileURL, d3.autoType ).then( ( data ) => {

    console.log( 'Dataset loaded!' );

    // Save the dataset for global access
    this.data = data;
    visibleData = data;

    // If a configuration file was not loaded
    if( config === undefined ) createConfig();
    setHyperParameters();
    
    // Initialize Feature Selection panel
    initFeatureSelection();

    // Initialize Encode Color panel
    updateEncodeColor();

    // Initialize and put data in Navio
    updateNavio();

    // Update the projection
    updateProjection();

    // Update the table details
    updateTable();

    updateTicks();

    // Hide the modal
    $( '#loadDataModal' ).modal( 'hide' );
    d3.select( '#data-description' ).html( ' ' + datasetName + ' dataset' );

  } );

}

function setHyperParameters() {

  d3.select( '#hparam-perplexity' )
    .property( 'value', config.models.projection.perplexity )
    .on( 'input', function() {
      d3.select( '#hparam-perplexity-span' ).html( this.value );
    } );

  d3.select( '#hparam-perplexity-span' )
    .html( config.models.projection.perplexity );

  d3.select( '#hparam-iterations' )
    .property( 'value', config.models.projection.iterations )
    .on( 'input', function() {
      d3.select( '#hparam-iterations-span' ).html( +this.value );
    } );

  d3.select( '#hparam-iterations-span' )
    .html( config.models.projection.iterations );

  d3.select( '#hparam-epsilon' )
    .property( 'value', config.models.projection.epsilon )
    .on( 'input', function() {
      d3.select( '#hparam-epsilon-span' ).html( +this.value );
    } );

  d3.select( '#hparam-epsilon-span' )
    .html( config.models.projection.epsilon );

  if( config.models.clustering !== undefined ) {

    d3.select( '#hparam-clusters' )
      .property( 'value', config.models.clustering.clusters )
      .on( 'input', function() {
        d3.select( '#hparam-clusters-span' ).html( +this.value );
      } );

    d3.select( '#hparam-clusters-span' )
      .html( config.models.clustering.clusters );

  }

}

function createConfig() {

  config = {};

  config.features = [];
  keys = Object.keys( data[ 0 ] );
  keys.forEach( ( k ) => {
    var type = ( typeof data[ 0 ][ k ] === 'number' ) ? 'sequential' : 'categorical';
    var project = ( type === 'sequential' ) ? true : false;
    config.features.push( { 'name' : k, 'type' : type, 'project' : project } );
  } );

  config.models = {
    "projection" : {
      "iterations" : 1000,
      "perplexity" : 25,
      "epsilon" : 200,
    }
  };

}

// Load the configuration file
function loadConfig() {

  if( configFileURL !== undefined ) {

     // Load the the configuration file
    d3.json( configFileURL ).then( ( config ) => {

      console.log( 'Configuration loaded!' );

      // Save the configuration for global access
      this.config = config;

      // Find features for color encoding
      var colorFeatures = config.features.filter( d => d.color );
      if( colorFeatures !== undefined && colorFeatures.lenght > 0 )
        colorFeature = colorFeatures[ 0 ].name;

      // Read hyper-parameters of models
      d3.select( '#hparam-perplexity-span' ).html( config.models.projection.perplexity );

    } ).catch( ( error ) => {

      console.log( 'Error loading the configuration file!' );

    } );

  }

  // Load the dataset
  loadData();

}

function loadDataAndConfig() {

  // Try to load first the config file to avoid async issues 
  if( dataFileURL !== undefined ) loadConfig();

}

/* Load data handlers */

d3.select( '#data-input' )
  .on( 'change', function() {

    // Get the file name
    var dataFile = d3.event.target.files[ 0 ];
    if ( !dataFile ) return;

    // Extract the name of the dataset
    datasetName = dataFile.name.split( '.' )[ 0 ];

    d3.select( '#data-name' ).html( dataFile.name );
    
    // Get the path of the file and call the function for load it
    var reader = new FileReader();
    reader.onloadend = function( evt ) {
      dataFileURL = evt.target.result;
    };
    reader.readAsDataURL( dataFile );

  } );

  d3.select( '#config-input' )
  .on( 'change', function() {

    // Get the file name
    var configFile = d3.event.target.files[ 0 ];
    if ( !configFile ) return;

    d3.select( '#config-name' ).html( configFile.name );
    
    // Get the path of the file and call the function for load it
    var reader = new FileReader();
    reader.onloadend = function( evt ) {
      configFileURL = evt.target.result;
    };
    reader.readAsDataURL( configFile );

  } );