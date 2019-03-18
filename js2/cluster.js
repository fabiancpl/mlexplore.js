var cluster = ( function() {

  var data, features,
    hparams = {
      clusters: 3,
      embedded_space: false
    };

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

  }

  return {
    init: init,
    set data( d ) {
      data = d;
    },
    set features( f ) {
      features = f.filter( f => f.role === 'cluster' );
    }
  }
} )();