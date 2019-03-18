var embed = ( function() {

  var data, features,
    hparams = {
      epsilon: 200,
      perplexity: 25
    };

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

  }

  function start() {

    // Try to stop the previous worker loop if it exists
    worker.postMessage( { stop: true } );

    console.log( 'Sending data to Worker' );
    
    // Pass new parameters to the projection
    worker.postMessage( {
      data: data,
      features: features.map( f => f.name ),
      hparams: hparams,
      dim: 2,
      iterations: 1000
    } );

    let frameId = null;
    worker.onmessage = function ( e ) {
      
      const embedding = e.data;

      function redrawEmbedding() {

        d3.select( '#embed-step-span' ).text( embedding.i );
        console.log('Redrawing embedding ', embedding.i );

        embedding.solution.forEach( ( d, i ) => {
          data[ i ][ '__x' ] = d[ 0 ];
          data[ i ][ '__y' ] = d[ 1 ];
        } );

        //if( config[ 'models' ] === undefined ) config[ 'models' ] = {};
        //config[ 'models' ][ 'projection' ] = projection[ 'config' ];

        // Create the new feature in the configuration
        /*if( config.features.find( d => d.name === 'x' ) === undefined )
          config.features.push( {
            'name': 'x',
            'type': 'sequential',
            'project': false
          }, {
            'name': 'y',
            'type': 'sequential',
            'project': false
          } );*/

        /*var chart = projectionChart()
          .x( ( d ) => d.x )
          .y( ( d ) => d.y  )
          .z( ( d ) => d[ colorFeature ]  );

        d3.select( '#projection' )
          .datum( visibleData )
          .call( chart );*/

      }

      // If we haven't launch the previous drawing command, skip it
      if( frameId ) window.cancelAnimationFrame( frameId );
      frameId = window.requestAnimationFrame( redrawEmbedding );

    }

  }

  function stop() {
    worker.postMessage( { stop: true } );
  }

  return {
    init: init,
    start: start,
    stop: stop,
    set data( d ) {
      data = d;
    },
    set features( f ) {
      features = f.filter( f => f.role === 'embed' );
    }
  }
} )();