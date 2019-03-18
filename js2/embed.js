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

  return {
    init: init,
    set data( d ) {
      data = d;
    },
    set features( f ) {
      features = f.filter( f => f.role === 'embed' );
    }
  }
} )();