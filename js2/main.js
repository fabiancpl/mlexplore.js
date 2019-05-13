/* global d3, dataset, featureSelection, navio, nv, embed, cluster, embeddingPlot, miniEmbeddingPlot, tableDetails, featureDistribution, exportResults, $ */

// Prepares the interface for load a dataset
dataset.init();
$( '#load-data-modal' ).modal( 'show' );

// Load a dataset specified by the user
function loadDataset( name ) {

  // Modify the Load button to evidence that process is running
  d3.select( '#load-data-load-btn' )
    .property( 'disabled', true )
    .html( '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>Loading...' );

  // Call load in Dataset component
  // Promise run when dataset has loaded successfully
  dataset.load( name ).then( _ => {

    // Clean the feature selection component
    featureSelection.clean();

    // Enable buttons for interact with models and export results
    d3.select( '#run-embed-btn' ).property( 'disabled', false );
    d3.select( '#stop-embed-btn' ).property( 'disabled', false );
    d3.select( '#run-cluster-btn' ).property( 'disabled', false );
    d3.select( '#export-results-btn' ).property( 'disabled', false );
    d3.select( '#export-embedding-btn' ).property( 'disabled', false );
    d3.select( '#export-config-btn' ).property( 'disabled', false );
    
    // Update the name of the selected dataset 
    d3.select( '#dataset-name-main' ).html( ' ' + dataset.name + ' dataset' );

    // Initialize feature selection panel
    featureSelection.features = dataset.config.features;
    featureSelection.roles = dataset.config.roles;
    featureSelection.onCheck = featureOnCheck;
    //featureSelection.onCheckAll = featureOnCheckAll;
    featureSelection.onColorChange = featureOnColorChange;
    featureSelection.init();

    // Initialize navio panel
    nv.data = dataset.data;
    nv.features = dataset.config.features;
    nv.onFiltering = navioFiltering;
    nv.init();

    // Initialize embedding panel
    embed.data = dataset.visibleData;
    embed.features = dataset.config.roles.embed;
    embed.onStep = embedOnStep;
    embed.onStop = embedOnStop;
    embed.init();
    embed.start();

    // Initialize cluster panel
    //cluster.data = dataset.visibleData;
    //cluster.features = dataset.config.roles.embed;
    cluster.onStop = clusterOnStop;
    cluster.init();

    embeddingPlot.config = dataset.config;
    embeddingPlot.onHighlighting = embeddingOnHighlighting;
    embeddingPlot.onCleaning = embeddingOnCleaning;

    miniEmbeddingPlot.features = dataset.config.features;

    // Initialize table
    tableDetails.data = dataset.visibleData;
    tableDetails.features = dataset.config.features;
    tableDetails.onRowSelection = tableRowSelection;
    tableDetails.init();

    // Initialize feature distribution panel
    featureDistribution.data = dataset.visibleData;
    featureDistribution.features = dataset.config.features;
    featureDistribution.roles = dataset.config.roles;
    featureDistribution.init();

    // Exports
    exportResults.name = dataset.name;
    exportResults.data = dataset.visibleData;
    exportResults.config = dataset.config;

    // Hide Load Data modal
    $( '#load-data-modal' ).modal( 'hide' );
    d3.select( '#load-data-load-btn' )
      .html( 'Load' );
    d3.select( '#dataset-name-span' )
      .text( '' );

  } );

}

function featureOnCheck( feature ) {

  // Update the config object
  if( dataset.config.roles.embed.indexOf( feature.name ) === -1 ) {
    dataset.config.roles.embed.push( feature.name );
  } else {
    dataset.config.roles.embed = dataset.config.roles.embed.filter( f => f !== feature.name );
  }

  // Restart the execution of a new embedding
  embed.data = dataset.visibleData;
  embed.features = dataset.config.roles.embed;
  //embed.stop();
  //embed.start();

  // Update feature distributions
  featureDistribution.roles = dataset.config.roles;
  featureDistribution.init();

}

var allChecked = false;

function featureOnCheckAll() {

  if( allChecked ) {
    d3.selectAll( '.custom-control-input' ).property( 'checked', false );
    dataset.config.roles.embed = [];
    allChecked = false;
  } else {
    
    dataset.config.roles.embed = dataset.config.features
      .filter( f => ( f.type !== 'categorical' ) )
      .map( f => {
        d3.select( '#' + f.name + '-chk' ).property( 'checked', true );
        return f.name;
      } );

    allChecked = true;
  }

}

function featureOnColorChange( feature_name ) {

  // Update the config object
  dataset.config.roles.color = undefined;
  if( feature_name !== '' ) dataset.config.roles.color = feature_name;

  // Update embedding plot
  embeddingPlot.color = dataset.config.roles.color;
  embeddingPlot.changeColor();
  

  miniEmbeddingPlot.color = dataset.config.roles.color;
  miniEmbeddingPlot.changeColor();

  // Update feature distributions
  featureDistribution.roles = dataset.config.roles;
  featureDistribution.init();

}

function navioFiltering() {

  console.log( dataset.visibleData );

  // Restart the execution of a new embedding
  //embed.data = dataset.visibleData;
  //embed.features = dataset.config.roles.embed;
  //embed.stop();
  //embed.start();

  embeddingPlot.data = dataset.visibleData;
  embeddingPlot.draw();
  
  miniEmbeddingPlot.data = dataset.visibleData;
  miniEmbeddingPlot.draw();

  // Update table details
  tableDetails.data = dataset.visibleData;
  tableDetails.update();

  // Update feature distributions
  featureDistribution.data = dataset.visibleData;
  featureDistribution.init();

}

function embedRun() {

  if( dataset.config.roles.embed.length > 0 ) {

    if( embed.running ) {
      embed.stop();
    } else {
      embed.data = dataset.visibleData;
      embed.features = dataset.config.roles.embed;
      embed.start();
    }

  } else {
    // TODO: Modal bootstrap
    alert( 'At least one attribute must be checked!' );
  }

}

function embedOnStep( embedding ) {

  dataset.visibleData = dataset.visibleData.map( ( d, i ) => {
    d.__x = embedding.solution[ i ][ 0 ];
    d.__y = embedding.solution[ i ][ 1 ];
  } );

  // Update embedding plot
  embeddingPlot.data = dataset.visibleData;
  //embeddingPlot.embedding = embedding.solution;
  embeddingPlot.color = dataset.config.roles.color;
  embeddingPlot.draw();

}

function embedOnStop( embedding, hparams ) {

  console.log(  'Embedding finished!' );

  // Clear previos embedding
  dataset.data.map( ( d, i ) => {
    d.__x = undefined;
    d.__y = undefined;
  } );

  dataset.visibleData = dataset.visibleData.map( ( d, i ) => {
    d.__x = embedding.solution[ i ][ 0 ];
    d.__y = embedding.solution[ i ][ 1 ];
  } );

  // Update embedding plot
  embeddingPlot.data = dataset.visibleData;
  //embeddingPlot.embedding = embedding.solution;
  embeddingPlot.color = dataset.config.roles.color;
  embeddingPlot.draw();

  hparams[ 'iterations' ] = embedding.i;
  if( dataset.config.models === undefined ) dataset.config.models = {};
  dataset.config.models.embedding = hparams;

  /*miniEmbeddingPlot.data = dataset.visibleData;
  miniEmbeddingPlot.color = dataset.config.roles.color;
  miniEmbeddingPlot.draw();*/

  // Update the domain of the embedding axes scales
  dataset.config.features.find( f => f.name === '__x' ).scale
    .domain( [ d3.min( dataset.data, d => d.__x ), d3.max( dataset.data, d => d.__x ) ] );
  dataset.config.features.find( f => f.name === '__y' ).scale
    .domain( [ d3.min( dataset.data, d => d.__y ), d3.max( dataset.data, d => d.__y ) ] );

  nv.update();
}

/*function embedStop() {
  embed.stop();  
}*/

function clusterRun() {

  cluster.data = dataset.visibleData;

   if( dataset.config.models === undefined ) dataset.config.models = {};
  if( dataset.config.models.clustering === undefined ) {
    cluster.features = dataset.config.roles.embed;
  } else {
    if( !dataset.config.models.clustering.embedded_space ) {
      cluster.features = dataset.config.roles.embed;
    } else {
      cluster.features = [ '__x', '__y' ];
    }
  }
  
  cluster.start();

}

function clusterOnStop( clusters, hparams ) {

  console.log(  'Clustering finished!' );

  // Clear previos cluster
  dataset.data.map( ( d, i ) => {
    d.__cluster = undefined;
  } );

  dataset.visibleData = dataset.visibleData.map( ( d, i ) => {
    d.__cluster = +clusters[ i ];
  } );

  dataset.config.roles.color = '__cluster';
  dataset.config.features.find( f => f.name === '__cluster' ).scale.domain( d3.map( dataset.visibleData, f => f[ '__cluster' ] ) );

  if( dataset.config.models === undefined ) dataset.config.models = {};
  dataset.config.models.clustering = hparams;

  featureSelection.addClusterFeature();

  // Update feature distributions
  featureDistribution.roles = dataset.config.roles;
  featureDistribution.init();

  nv.update();


  // TODO: Move to component
  d3.select( "#new-cluster" ).selectAll( 'option' )
    .data( d3.map( dataset.data, d => d.__cluster ).keys() )
    .enter()
    .append( 'option' )
      .attr( 'value', d => d )
      .text( d => d );

}

function embeddingOnHighlighting( selection ) {
  console.log( 'Elements highlighted: ', selection.length );

  // Update the dataset
  dataset.data.map( d => {
    var match = selection.find( k => d.__seqId === k.__seqId );
    if( match !== undefined ) d.__highlighted = true;
    else d.__highlighted = false;
  } );

  nv.update();

  miniEmbeddingPlot.highlight( selection );

  featureDistribution.init();

  // TODO: Move to component
  if( dataset.config.models.clustering !== undefined ) {
    d3.select( "#assign-cluster" )
      .property( 'disabled', false );
  }

}

function embeddingOnCleaning() {
  console.log( 'Cleaning highlighting!' );

  // Update the dataset
  dataset.data.map( d => d.__highlighted = true );

  nv.update();

  miniEmbeddingPlot.clean();

  featureDistribution.init();

  // TODO: Move to component
  d3.select( "#assign-cluster" )
    .property( 'disabled', true );

}

function updateMiniEmbedding() {
  miniEmbeddingPlot.data = dataset.visibleData;
  miniEmbeddingPlot.color = dataset.config.roles.color;
  miniEmbeddingPlot.draw();
}

function tableRowSelection( row, $element ) {
  embeddingPlot.onItemClick( row );
}

function assignCluster() {

  var newCluster = document.getElementById( "new-cluster" ).value;

  dataset.data.filter( d => d.__highlighted )
    .map( d => {
      d.__cluster = newCluster;
    } );

  // Update the dataset
  dataset.data.map( d => d.__highlighted = true );

  embeddingPlot.draw();
  miniEmbeddingPlot.draw();

  nv.update();

  featureDistribution.init();

  // Hide the modal
  $( "#assign-cluster-modal" ).modal( 'hide' );

  // TODO: Move to component
  d3.select( "#assign-cluster" )
    .property( 'disabled', true );

}

function exportData() {
  exportResults.data = dataset.visibleData;
  exportResults.exportData();
}


function exportEmbedding() {
  exportResults.exportEmbedding();
}

function exportConfiguration() {
  exportResults.exportConfiguration();
}