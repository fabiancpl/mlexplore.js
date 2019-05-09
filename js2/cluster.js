var cluster = ( function() {

  var data, clusters, features,
    hparams = {
      clusters: 3,
      embedded_space: false
    };

  const worker = new Worker( './js2/workers/clusterWorker.js' );

  function init() {

    d3.select( '#hparam-clusters' )
      .property( 'value', hparams.clusters )
      .on( 'input', function() {
        d3.select( '#hparam-clusters-span' ).html( +this.value );
        hparams.clusters = +this.value;
      } );

    d3.select( '#hparam-clusters-span' )
      .html( hparams.clusters );

    d3.select( '#runClusteringOnProjection' )
      .property( 'checked', hparams.embedded_space )
      .on( 'input', function() {
        hparams.embedded_space = d3.select( '#runClusteringOnProjection' ).property( 'checked' );
      } );

    /*d3.select( '#scaleFeatures' )
      .property( 'checked', hparams.scale_features )
      .on( 'input', function() {
        hparams.scale_features = d3.select( '#scaleFeatures' ).property( 'checked' );
      } );*/

  }

  function start() {

    d3.select( '#run-cluster-btn' )
      .property( 'disabled', true )
      .html( '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>Running...' );

    // Send message to worker to start model training
    worker.postMessage( {
      data: data,
      features: features,
      hparams: hparams
    } );

    worker.onmessage = function ( e ) {
      d3.select( '#run-cluster-btn' )
        .property( 'disabled', false )
        .html( 'Run K-Means' );

      clusters = e.data.solution;
      onStop( clusters, hparams );
    };

  }

  return {
    init: init,
    start: start,
    set data( d ) {
      data = d;
    },
    set features( f ) {
      features = f;
    },
    set onStop( f ) {
      onStop = f;
    }
  }
} )();