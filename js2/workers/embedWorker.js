/* global tsnejs, importScripts */

function embedWorker() {

  let me = this,
    shouldStop = false,
    intervalId = null;

  function start( e ) {
    
    if( intervalId ) {
      clearInterval( intervalId );
      intervalId = null;
    }

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
        clearInterval( intervalId );
        intervalId = null;

        postMessage( {
          stoped: true,
        } );

        return;
      }

      tsne.step();
      postMessage( {
        solution: tsne.getSolution(),
        i: k++
      } );
    }

    intervalId = setInterval( iterate, 1 );

  }

  function stop() {
    shouldStop = true;
  }

  me = {
    start,
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
  myWorker.start( e );
};