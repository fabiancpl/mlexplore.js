/* global d3, dataset, featureSelection, navio, nv */

dataset.init();

function loadDataset( name ) {

  // TODO: Clear interface
  //clearInterface();

  dataset.loadDataset( name ).then( _ => {

    $( '#load-data-modal' ).modal( 'hide' );
    d3.select( '#load-config-btn' ).classed( 'disabled', false );
    d3.select( '#load-config-input' ).property( 'disabled', false );
    d3.select( '#export-results-btn' ).property( 'disabled', false );
    d3.select( '#export-embedding-btn' ).property( 'disabled', false );
    d3.select( '#export-config-btn' ).property( 'disabled', false );
    d3.select( '#dataset-name-main' ).html( ' ' + dataset.name + ' dataset' );

    featureSelection.features = dataset.config.features;
    featureSelection.init();

    nv.data = dataset.data;
    nv.features = dataset.config.features;
    nv.init();    

  } );

}

function featureAllowDrop( event ) {
  featureSelection.allowDrop( event );
}

function featureDrop( event ) {
  featureSelection.drop( event )
    .then( f => {
      
      dataset.config.features = f;

      // TODO: Update interface

    } ).catch( error => alert( error ) );
}

function featureDrag( event ) {
  featureSelection.drag( event );
}