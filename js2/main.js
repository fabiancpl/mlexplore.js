/* global d3, dataset, featureSelection, navio, nv, embed, cluster, embeddingPlot, miniEmbeddingPlot, tableDetails, featureDistribution, exportResults */

dataset.init();
$( '#load-data-modal' ).modal( 'show' );

function loadDataset( name ) {

  d3.select( '#load-data-load-btn' )
    .property( 'disabled', true )
    .html( '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>Loading...' );

  dataset.loadDataset( name ).then( _ => {

    // Clean interface
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
    featureSelection.init();

    // Initialize navio panel
    nv.data = dataset.data;
    nv.features = dataset.config.features;
    nv.onFiltering = navioFiltering;
    nv.init();

    // Initialize embedding panel
    embed.data = dataset.visibleData;
    embed.features = dataset.config.features;
    embed.onStep = embedStep;
    embed.onStop = embedOnStop;
    embed.init();
    embed.start();

    // Initialize cluster panel
    cluster.data = dataset.visibleData;
    cluster.features = dataset.config.features;
    //cluster.hparams = dataset.config.models.cluster;
    cluster.init();

    // Initialize table
    tableDetails.data = dataset.visibleData;
    tableDetails.features = dataset.config.features;
    tableDetails.onRowSelection = tableRowSelection;
    tableDetails.init();

    // Initialize feature distribution panel
    featureDistribution.data = dataset.visibleData;
    featureDistribution.features = dataset.config.features;
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

function featureAllowDrop( event ) {
  featureSelection.allowDrop( event );
}

function featureDrop( event ) {
  featureSelection.drop( event )
    .then( f => {

      // Update embedding
      embed.features = dataset.config.features;

      // Update embedding plot
      embeddingPlot.changeColor();
      miniEmbeddingPlot.changeColor();

      // Update feature distributions
      featureDistribution.features = dataset.config.features;
      featureDistribution.update();

    } ).catch( error => alert( error ) );
}

function featureDrag( event ) {
  featureSelection.drag( event );
}

function navioFiltering() {

  // Update table details
  tableDetails.data = dataset.visibleData;
  featureDistribution.features = dataset.config.features;
  tableDetails.update();

  // Update feature distributions
  featureDistribution.data = dataset.visibleData;
  featureDistribution.update();

}

function embedRun() {

  if( embed.running ) {
    embed.stop();
  } else {
    embed.start();
  }

}

function embedStep( embedding ) {

  // Update embedding plot
  embeddingPlot.data = dataset.visibleData;
  embeddingPlot.embedding = embedding.solution;
  embeddingPlot.features = dataset.config.features;
  embeddingPlot.draw();

}

function embedOnStop( embedding, hparams ) {

  dataset.visibleData = dataset.visibleData.map( ( d, i ) => {
    d.__x = embedding.solution[ i ][ 0 ];
    d.__y = embedding.solution[ i ][ 1 ];   
  } );

  hparams[ 'iterations' ] = embedding.i;
  dataset.config.models = { embedding: hparams };

  miniEmbeddingPlot.data = dataset.visibleData;
  miniEmbeddingPlot.features = dataset.config.features;
  miniEmbeddingPlot.draw();

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