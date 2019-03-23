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

  function start() {

    console.info( 'Clustering data!' );
    console.info( 'Number of clusters: ' + hparams.clusters );
    console.info( 'Attributes: ' + features );
    console.info( 'Númber of Items: ' + data.length );

    // Transform data to multi-dimensional array
    var featuredData = data.map( d => {
      datum = {};
      features.forEach( f => {
        datum[ f ] = +d[ f ];
      } );
      return datum;
    } );

    var Http = new XMLHttpRequest();
    var url = 'https://t17ah9d6hf.execute-api.us-east-1.amazonaws.com/dev/kmeans/' + hparams.clusters;
    Http.open( 'POST', url, false );
    Http.setRequestHeader( 'Content-Type', 'application/json' );
    Http.send( JSON.stringify( featuredData ) );
    
    onStop( Http.responseText.split( ' ' ), hparams );

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