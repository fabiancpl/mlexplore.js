/* global d3, dataset, featureSelection, navio, nv, embed, cluster, embeddingPlot, miniEmbeddingPlot, tableDetails, featureDistribution, exportResults */

dataset.init();
$( '#load-data-modal' ).modal( 'show' );

function loadDataset( name ) {

  d3.select( '#load-data-load-btn' )
    .property( 'disabled', true )
    .html( '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>Loading...' );

  dataset.loadDataset( name ).then( _ => {

    // TODO: Clean interface
    featureSelection.clean();

    d3.select( '#run-embed-btn' ).property( 'disabled', false );
    d3.select( '#restart-embed-btn' ).property( 'disabled', false );
    d3.select( '#run-cluster-btn' ).property( 'disabled', false );
    d3.select( '#export-results-btn' ).property( 'disabled', false );
    d3.select( '#export-embedding-btn' ).property( 'disabled', false );
    d3.select( '#export-config-btn' ).property( 'disabled', false );
    d3.select( '#dataset-name-main' ).html( ' ' + dataset.name + ' dataset' );

    // Initialize feature selection panel
    featureSelection.features = dataset.config.features;
    featureSelection.roles = dataset.config.roles;
    featureSelection.onCheck = featureOnCheck;
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
    embed.onStep = embedStep;
    embed.onStop = embedOnStop;
    embed.init();
    embed.start();

    // Initialize cluster panel
    cluster.data = dataset.visibleData;
    cluster.features = dataset.config.roles.embed;
    cluster.onStop = clusterOnStop;
    cluster.init();

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
  embed.features = dataset.config.roles.embed;
  //embed.stop();
  //embed.start();

  // Update feature distributions
  featureDistribution.roles = dataset.config.roles;
  featureDistribution.init();

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

  // Restart the execution of a new embedding
  embed.data = dataset.visibleData;
  //embed.stop();
  //embed.start();

  // Update table details
  tableDetails.data = dataset.visibleData;
  tableDetails.update();

  // Update feature distributions
  featureDistribution.data = dataset.visibleData;
  featureDistribution.init();

}

function embedRun() {

  if( embed.running ) {
    embed.stop();
  } else {
    embed.start();
  }

}

function clusterRun() {

  cluster.data = dataset.visibleData;
  cluster.features = dataset.config.roles.embed;
  cluster.start();
  
}

function embedStep( embedding ) {

  // Update embedding plot
  embeddingPlot.data = dataset.visibleData;
  embeddingPlot.embedding = embedding.solution;
  embeddingPlot.color = dataset.config.roles.color;
  embeddingPlot.draw();

}

function embedOnStop( embedding, hparams ) {

  console.log(  'Embedding finished!' );

  dataset.visibleData = dataset.visibleData.map( ( d, i ) => {
    d.__x = embedding.solution[ i ][ 0 ];
    d.__y = embedding.solution[ i ][ 1 ];   
  } );

  hparams[ 'iterations' ] = embedding.i;
  if( dataset.config.models === undefined ) dataset.config.models = {};
  dataset.config.models.embedding = hparams;

  miniEmbeddingPlot.data = dataset.visibleData;
  miniEmbeddingPlot.color = dataset.config.roles.color;
  miniEmbeddingPlot.draw();

}

function clusterOnStop( clusters, hparams ) {

  console.log(  'Clustering finished!' );

  dataset.visibleData = dataset.visibleData.map( ( d, i ) => {
    d.__cluster = +clusters[ i ];   
  } );

  dataset.config.roles.color = '__cluster';

  if( dataset.config.models === undefined ) dataset.config.models = {};
  dataset.config.models.clustering = hparams;

  featureSelection.addClusterFeature();

  // Update feature distributions
  featureDistribution.roles = dataset.config.roles;
  featureDistribution.init();

}

function tableRowSelection( row, $element ) {
  console.log( row );
  //$element.css( { "background-color": "gray" } );
}

function exportData() {
  //exportResults.exportData();
}


function exportEmbedding() {
  exportResults.exportEmbedding();
}

function exportEmbedding() {
  exportResults.exportEmbedding();
}

function exportConfiguration() {
  exportResults.exportConfiguration();
}