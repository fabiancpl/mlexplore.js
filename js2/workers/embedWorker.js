/* global tsnejs, importScripts */

function projectWorker() {
  let me = this,
    shouldStop = false,
    intervalId = null;

  function init(e) {
    if (intervalId) {
      console.log('Stopping previous interval');
      clearInterval(intervalId);
      intervalId = null;
    }

    console.log('Project Worker: Message received from main script');
    shouldStop = false;

    const data = e.data.data;
    const features = e.data.features;
    // var features = getProjectionFeatures();

    // Build hyper-parameters object
    var params = {};
    // params.epsilon = projectionConfigTemp.epsilon;
    params.epsilon = e.data.epsilon;
    // params.perplexity = projectionConfigTemp.perplexity;
    params.perplexity = e.data.perplexity;
    params.dim = e.data.perplexity || 2;


    console.info( 'Projecting data in ' + e.data.iterations + ' iterations!' );
    console.info( params );
    console.info( 'Attributes: ' + features );
    console.info( 'Númber of Items: ' + data.length );

    // Transform data to multi-dimensional array
    var arrayData = [];
    data.forEach( d => {
      let row = [];
      features.forEach( feature => {
        row.push( +d[ feature ] );
      } );
      arrayData.push( row );
    } );

    importScripts('../../../libs/tsne.js');

    // Instantiate t-SNE object and attach the data
    var tsne = new tsnejs.tSNE( params );
    tsne.initDataRaw( arrayData );

    // Run t-SNE iterations
    let k = 0;

    function iterate() {
      if (k > e.data.iterations || shouldStop) {
        console.log('Finishing interval', k);
        clearInterval(intervalId);
        intervalId = null;
        return;
      }
      console.log('TSNE step', k);
      tsne.step();
      postMessage({
        solution: tsne.getSolution(),
        i: k++
      });
    }

    intervalId = setInterval(iterate, 1);

    // for( let k = 0; k < e.data.iterations && !shouldStop; k++ ) {


    // }

  }

  function stop() {
    console.log('Stopping Worker');
    shouldStop = true;
  }

  me = {
    init,
    stop
  };

  return me;
}

const myWorker = projectWorker();

onmessage = function(e) {
  if (e.data.hasOwnProperty('stop')) {
    myWorker.stop();
    return;
  }

  myWorker.init(e);
};