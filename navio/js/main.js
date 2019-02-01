
var data,
  visibleData,
  features,
  catFeatures,
  seqFeatures;

var nv;

function initNavio() {

  nv = navio( d3.select( '#navio' ), 500 );

  catFeatures = [ 'hair', 'feathers', 'eggs', 'milk', 'airborne', 'aquatic', 'predator', 'toothed', 'backbone', 'breathes', 'venomous', 'fins', 'tail', 'domestic', 'catsize', 'class_name' ];
  seqFeatures = [ 'legs' ];

  catFeatures.forEach( ( c ) => nv.addCategoricalAttrib( c ) );
  seqFeatures.forEach( ( c ) => nv.addSequentialAttrib( c ) );

}

function initFeatureSelection() {

  d3.select( '#feature-selection #no-group .content' )
    .selectAll( 'button' )
    .data( features )
    .enter()
      .append( 'button' )
        .attr( 'class', 'btn btn-primary' )
        .text( d => d );

}

initNavio();

d3.csv( './data/animals.csv' ).then( function( data ) {

  this.data = data;
  visibleData = data;
  features = Object.keys( data[ 0 ] );
  initFeatureSelection();

  nv.data( this.data );

  nv.updateCallback( () => visibleData = nv.getVisible() );

} );