/* global d3, cluster, project, updateEncodeColor, updateNavio, updateTable, updateTicks, projectionChart, initFeatureSelection */

var dataFileURL,
  configFileURL,
  datasetName;

var data,
  config,
  projectionConfigTemp,
  clusteringConfigTemp,
  visibleData,
  colorFeature,
  run_clustering_on_start = false;

const projectWorker = new Worker('./js/components/non-visual/projectWorker.js');

function getProjectionFeatures() {

  var features = config.features.filter( f => ( f.project ) && ( ![ '__seqId', 'x', 'y', 'cluster' ].includes( f.name ) ) );
  var featureNames = [];

  features.forEach( f => featureNames.push( f.name ) )

  return featureNames;

}

function getColoredFeatures() {

  var features = config.features.filter( f => !f.project );
  var featureNames = [];

  features.forEach( f => {
    if( ![ '__seqId', 'x', 'y' ].includes( f.name ) ) featureNames.push( f.name );
  } );

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

  config[ 'models' ][ 'clustering' ] = clustering[ 'config' ];

  // Clean the config for the color
  config.features.filter( f => !f.project ).forEach( f => delete f.color );

  // Create the new feature in the configuration
  if( config.features.find( d => d.name === colorFeature ) === undefined ) {
    config.features.push( {
      'name': 'cluster',
      'type': 'categorical',
      'project': false,
      'color' : true
    } );
  } else {
    config.features.find( d => d.name === colorFeature ).color = true;
  }

  // Update Encode Color and Projection panels
  updateEncodeColor();
  updateProjection( false );
  updateNavio();
  updateTable();
  updateTicks();

}

function stopProjection() {
  // projectWorker.terminate();
  projectWorker.postMessage({stop:true});
}

// Project the data calling re-train model if specified
function updateProjection( run_model = true ) {

  d3.select( '#projection-panel' )
    .attr( 'class', null );

  if (run_model) {
    // Try to stop the previous worker loop if it exists
    projectWorker.postMessage({stop:true});

    console.log('Sending data to Worker');
    // Pass new parameters to the projection
    projectWorker.postMessage({
      data: visibleData,
      features: getProjectionFeatures(),
      epsilon: projectionConfigTemp.epsilon,
      perplexity: projectionConfigTemp.perplexity,
      iterations: projectionConfigTemp.iterations,
      dim: 2
    });
  }

  let frameId = null;
  projectWorker.onmessage = function (e) {
    const projection = e.data;

    function redrawProjection() {

      d3.select('#spanIter').text(projection.i);
      console.log('Redrawing projection ', projection.i);
      // drawing = true;
      projection.solution.forEach( ( d, i ) => {
        visibleData[ i ][ 'x' ] = d[ 0 ];
        visibleData[ i ][ 'y' ] = d[ 1 ];
      } );

      if( config[ 'models' ] === undefined ) config[ 'models' ] = {};
      config[ 'models' ][ 'projection' ] = projection[ 'config' ];

      // Create the new feature in the configuration
      if( config.features.find( d => d.name === 'x' ) === undefined )
        config.features.push( {
          'name': 'x',
          'type': 'sequential',
          'project': false
        }, {
          'name': 'y',
          'type': 'sequential',
          'project': false
        } );

      var chart = projectionChart()
        .x( ( d ) => d.x )
        .y( ( d ) => d.y  )
        .z( ( d ) => d[ colorFeature ]  );

      d3.select( '#projection' )
        .datum( visibleData )
        .call( chart );
    }

    // If we haven't launch the previous drawing command, skip it
    if(frameId) window.cancelAnimationFrame(frameId);

    frameId = window.requestAnimationFrame(redrawProjection);

  }; // Worker update

  // updateNavio();
  updateTable();


}

function setHyperParameters() {

  d3.select( '#hparam-perplexity' )
    .property( 'value', projectionConfigTemp.perplexity )
    .on( 'input', function() {
      d3.select( '#hparam-perplexity-span' ).html( +this.value );
      projectionConfigTemp.perplexity = +this.value;
      updateProjection();
    } );

  d3.select( '#hparam-perplexity-span' )
    .html( projectionConfigTemp.perplexity );

  d3.select( '#hparam-iterations' )
    .property( 'value', projectionConfigTemp.iterations )
    .on( 'input', function() {
      d3.select( '#hparam-iterations-span' ).html( +this.value );
      projectionConfigTemp.iterations = +this.value;
    } );

  d3.select( '#hparam-iterations-span' )
    .html( projectionConfigTemp.iterations );

  d3.select( '#hparam-epsilon' )
    .property( 'value', projectionConfigTemp.epsilon )
    .on( 'input', function() {
      d3.select( '#hparam-epsilon-span' ).html( +this.value );
      projectionConfigTemp.epsilon = +this.value;
      updateProjection();
    } );

  d3.select( '#hparam-epsilon-span' )
    .html( projectionConfigTemp.epsilon );

  d3.select( '#hparam-clusters' )
    .property( 'value', clusteringConfigTemp.clusters )
    .on( 'input', function() {
      d3.select( '#hparam-clusters-span' ).html( +this.value );
      clusteringConfigTemp.clusters = +this.value;
    } );

  d3.select( '#hparam-clusters-span' )
    .html( clusteringConfigTemp.clusters );

  d3.select( '#runClusteringOnProjection' )
    .property( 'checked', clusteringConfigTemp.run_on_projection )
    .on( 'input', function() {
      clusteringConfigTemp.runClusteringOnProjection = d3.select( '#runClusteringOnProjection' ).property( 'checked' );
    } );

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
    updateNavio( true );

    // Update the projection
    updateProjection();

    if( run_clustering_on_start ) updateCluster();

    // Update the table details
    updateTable();

    // Update the ticks panel
    updateTicks();

    // Show the export panel
    d3.select( '#export-panel' )
      .classed( 'hide', false );

    // Hide the modal
    $( '#loadDataModal' ).modal( 'hide' );
    d3.select( '#data-description' ).html( ' ' + datasetName + ' dataset' );

  } );

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

  projectionConfigTemp = {
    'iterations' : 1000,
    'perplexity' : 25,
    'epsilon' : 200,
  };

  clusteringConfigTemp = {
    'clusters' : 3
  };

}

// Load the configuration file
function loadConfig() {

  if( configFileURL !== undefined ) {

    // Load the the configuration file
    d3.json( configFileURL ).then( ( config_temp ) => {

      console.log( 'Configuration loaded!' );

      // Save the configuration for global access
      this.config = {};
      this.config[ 'features' ] = config_temp[ 'features' ];

      if( config_temp[ 'models' ] !== undefined ) {

        if( config_temp[ 'models' ][ 'projection' ] !== undefined ) projectionConfigTemp = config_temp[ 'models' ][ 'projection' ];

        if( config_temp[ 'models' ][ 'clustering' ] !== undefined ) {
          clusteringConfigTemp = config_temp[ 'models' ][ 'clustering' ];
          run_clustering_on_start = true;
        }

      }

    } ).catch( ( error ) => {

      console.log( 'Error loading the configuration file!' );

    } );

  }

  // Load the dataset
  loadData();

}

function loadDataAndConfig() {

  clearInterface();

  // Try to load first the config file to avoid async issues
  if( dataFileURL !== undefined ) loadConfig();

}

function loadPreloadedDataset( dataset ) {

  clearInterface();

  datasetName = dataset;
  dataFileURL = './data/' + datasetName + '.csv';

  loadData();

}

function clearInterface() {

  // Restart state
  data = undefined;
  config = undefined;
  projectionConfigTemp = undefined;
  clusteringConfigTemp = undefined;
  visibleData = undefined;
  colorFeature = undefined;
  nv = undefined;
  run_clustering_on_start = false;
  cleanFeatureSelection();
  stopProjection();

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

