/* global XMLHttpRequest */

function clusterWorker() {

  let me = this;

  function start( e ) {

    const data = e.data.data;
    const features = e.data.features;
    const hparams = e.data.hparams;

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

    if( Http.status === 200 ) {
      console.log( 'Response from server for K-Means' );
      postMessage( {
        solution: Http.responseText.split( ' ' )
      } );
    }

  }

  me = {
    start
  };

  return me;
}

const myClusterWorkerWorker = clusterWorker();

onmessage = function( e ) {
  myClusterWorkerWorker.start( e );
};