/* global tsnejs, importScripts */

function embedWorker() {

  let me = this,
    shouldStop = false,
    intervalId = null;

  function init( e ) {
    
    if( intervalId ) {
      console.log( 'Stopping previous interval' );
      clearInterval( intervalId );
      intervalId = null;
    }

    console.log( 'Project Worker: Message received from main script' );
    shouldStop = false;

    const data = e.data.data;
    const features = e.data.features;
    const hparams = e.data.hparams;
    hparams.dim = e.data.dim

    console.info( 'Projecting data in ' + e.data.iterations + ' iterations!' );
    console.info( hparams );
    console.info( 'Attributes: ' + features );
    console.info( 'Númber of Items: ' + data.length );

    // Transform data to multi-dimensional array
    var arrayData = data.map( d => features.map( feature => +d[ feature ] ) );

    importScripts( '../../libs/tsne.js' );

    // Instantiate t-SNE object and attach the data
    var tsne = new tsnejs.tSNE( hparams );
    tsne.initDataRaw( arrayData );

    // Run t-SNE iterations
    let k = 0;

    function iterate() {

      if( k > e.data.iterations || shouldStop ) {
        console.log( 'Finishing interval', k );
        clearInterval( intervalId );
        intervalId = null;
        return;
      }

      console.log( 'TSNE step', k );
      tsne.step();
      postMessage( {
        solution: tsne.getSolution(),
        i: k++
      } );
    }

    intervalId = setInterval( iterate, 1 );

  }

  function stop() {
    console.log( 'Stopping Worker' );
    shouldStop = true;
  }

  me = {
    init,
    stop
  };

  return me;
}

const myWorker = embedWorker();

onmessage = function( e ) {
  if( e.data.hasOwnProperty( 'stop' ) ) {
    myWorker.stop();
    return;
  }
  myWorker.init( e );
};