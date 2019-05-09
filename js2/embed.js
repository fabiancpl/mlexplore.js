var embed = ( function() {

  var data, embedding, features, running = false,
    hparams = {
      epsilon: 200,
      perplexity: 25,
      scale_features: true
    },
    onStep, onStop;

  const worker = new Worker( './js2/workers/embedWorker.js' );

  function init() {

    d3.select( '#hparam-perplexity' )
      .property( 'value', hparams.perplexity )
      .on( 'input', function() {
        d3.select( '#hparam-perplexity-span' ).html( +this.value );
        hparams.perplexity = +this.value;
      } );

    d3.select( '#hparam-perplexity-span' )
      .html( hparams.perplexity );

    d3.select( '#hparam-iterations' )
      .property( 'value', hparams.iterations )
      .on( 'input', function() {
        d3.select( '#hparam-iterations-span' ).html( +this.value );
        hparams.iterations = +this.value;
      } );

    d3.select( '#hparam-iterations-span' )
      .html( hparams.iterations );

    d3.select( '#hparam-epsilon' )
      .property( 'value', hparams.epsilon )
      .on( 'input', function() {
        d3.select( '#hparam-epsilon-span' ).html( +this.value );
        hparams.epsilon = +this.value;
      } );

    d3.select( '#hparam-epsilon-span' )
      .html( hparams.epsilon );

    d3.select( '#scaleFeatures' )
      .property( 'checked', hparams.scale_features )
      .on( 'input', function() {
        hparams.scale_features = d3.select( '#scaleFeatures' ).property( 'checked' );
      } );

  }

  function start() {

    // Try to stop the previous worker loop if it exists
    worker.postMessage( { stop: true } );
    
    // Pass new parameters to the projection
    worker.postMessage( {
      data: data,
      features: features,
      hparams: hparams,
      dim: 2,
      iterations: 1000
    } );

    running = true;
    d3.select( '#run-embed-btn' ).html( 'Stop' );

    let frameId = null;
    worker.onmessage = function ( e ) {
      
      if( e.data.hasOwnProperty( 'stoped' ) ) {

        running = false;
        d3.select( '#run-embed-btn' ).html( 'Run t-SNE' );
        onStop( embedding, hparams );

      } else {

        embedding = e.data;

        function redrawEmbedding() {
          d3.select( '#embed-step-span' ).text( embedding.i );
          onStep( embedding );
        }

        // If we haven't launch the previous drawing command, skip it
        if( frameId ) window.cancelAnimationFrame( frameId );
        frameId = window.requestAnimationFrame( redrawEmbedding );

      }

    }

  }

  function stop() {
    worker.postMessage( { stop: true } );
    running = false;
    d3.select( '#run-embed-btn' ).html( 'Run t-SNE' );
    onStop( embedding, hparams );
  }

  return {
    init: init,
    start: start,
    stop: stop,
    set data( d ) {
      data = d;
    },
    set features( f ) {
      features = f;
    },
    get running() {
      return running;
    },
    set onStep( f ) {
      onStep = f;
    },
    set onStop( f ) {
      onStop = f;
    }
  }
} )();