/* global d3, dataset, featureSelection, navio, nv, embed, cluster, tableDetails, featureDistribution */

dataset.init();
$( '#load-data-modal' ).modal( 'show' );

function loadDataset( name ) {

  // TODO: Clear interface
  //clearInterface();

  dataset.loadDataset( name ).then( _ => {

    $( '#load-data-modal' ).modal( 'hide' );
    d3.select( '#load-config-btn' ).classed( 'disabled', false );
    d3.select( '#load-config-input' ).property( 'disabled', false );
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
    nv.callback = navioCallback;
    nv.init();

    // Initialize embedding panel
    embed.data = dataset.visibleData;
    embed.features = dataset.config.features;
    //embed.hparams = dataset.config.models.embed;
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
    tableDetails.callback = tableDetailsCallback;
    tableDetails.init();

    // Initialize feature distribution panel
    featureDistribution.data = dataset.visibleData;
    featureDistribution.features = dataset.config.features;
    featureDistribution.init();

    // TODO: Exports

  } );

}

function navioCallback() {

  // Update table details
  tableDetails.data = dataset.visibleData;
  featureDistribution.features = dataset.config.features;
  tableDetails.update();

  // Update feature distributions
  featureDistribution.data = dataset.visibleData;
  featureDistribution.update();

}

function tableDetailsCallback( row, $element ) {
  console.log( row );
  //$element.css( { "background-color": "gray" } );
}


function featureAllowDrop( event ) {
  featureSelection.allowDrop( event );
}

function featureDrop( event ) {
  featureSelection.drop( event )
    .then( f => {

      // TODO: Update embedding

      // Update feature distributions
      featureDistribution.features = dataset.config.features;
      featureDistribution.update();

    } ).catch( error => alert( error ) );
}

function featureDrag( event ) {
  featureSelection.drag( event );
}