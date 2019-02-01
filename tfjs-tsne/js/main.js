
const width = 500,
  height = 300,
  padding = 20
  r = 3;

const features = [ 'sepal_length', 'sepal_width', 'petal_length', 'petal_width' ];

var svg1, svg2, svg3,
  g1, g2, g3,
  xScale1, xScale2, xScale3,
  yScale1, yScale2, yScale3,
  colorScale;

var data,
  arrayData,
  tensorData;

var ITERATE,
  ITERATIONS = 400,
  PERPLEXITY = 18;

function initForm() {

  // Input for iterations
  d3.select( 'input#iterations' )
    .property( 'value', ITERATIONS )
    .on( 'change', function() {
      ITERATIONS = +this.value;
    } );

  // Input for perplexity
  d3.select( 'input#perplexity' )
    .property( 'value', PERPLEXITY )
    .on( 'change', function() {
      PERPLEXITY = +this.value;
    } );

}

function loadData() {

  d3.csv( './data/iris.csv', function( d ) {

    d.sepal_length = +d.sepal_length;
    d.sepal_width = +d.sepal_width;
    d.petal_length = +d.petal_length;
    d.petal_width = +d.petal_width;
    return d;

  } ).then( function( data ) {

    this.data = data;

    initProjection();

    arrayData = [];
    data.forEach( d => {

      row = [];
      features.forEach( k => {
        row.push( d[ k ] );
      } );
      arrayData.push( row );
    } );

  } );

}

function initProjection( id  ) {

  d3.select( '#projections' ).html( '' );

  // Define projection scales
  xScale1 = d3.scaleLinear()
    .domain( [ 0, 1 ] )
    .range( [ padding, width - padding ] );

  xScale2 = d3.scaleLinear()
    .domain( [ 0, 1 ] )
    .range( [ padding, width - padding ] );

  xScale3 = d3.scaleLinear()
    .domain( [ 0, 1 ] )
    .range( [ padding, width - padding ] );
    
  yScale1 = d3.scaleLinear()
    .domain( [ 0, 1 ] )
    .range( [ height - padding, padding ] );

  yScale2 = d3.scaleLinear()
    .domain( [ 0, 1 ] )
    .range( [ height - padding, padding ] );

  yScale3 = d3.scaleLinear()
    .domain( [ 0, 1 ] )
    .range( [ height - padding, padding ] );

  // Define color scale
  colorScale = d3.scaleOrdinal( d3.schemeCategory10 )
    .domain( d3.map( data, d => d.class ) );

  // Create SVG
  svg1 = d3.select( '#projections' )
    .append( 'svg' )
      .attr( 'width', width )
      .attr( 'height', height )

  svg2 = d3.select( '#projections' )
    .append( 'svg' )
      .attr( 'width', width )
      .attr( 'height', height );

  svg3 = d3.select( '#projections' )
    .append( 'svg' )
      .attr( 'width', width )
      .attr( 'height', height );

  g1 = svg1.append( 'g' );
  g2 = svg2.append( 'g' );
  g3 = svg3.append( 'g' );

  g1.selectAll( 'circle' )
    .data( data )
    .enter()
      .append( 'circle' )
      .attr( 'cx', width / 2 )
      .attr( 'cy', height / 2 )
      .attr( 'r', r )
      .attr( 'fill', d => colorScale( d.class ) );

  g2.selectAll( 'circle' )
    .data( data )
    .enter()
      .append( 'circle' )
      .attr( 'cx', width / 2 )
      .attr( 'cy', height / 2 )
      .attr( 'r', r )
      .attr( 'fill', d => colorScale( d.class ) );

  g3.selectAll( 'circle' )
    .data( data )
    .enter()
      .append( 'circle' )
      .attr( 'cx', width / 2 )
      .attr( 'cy', height / 2 )
      .attr( 'r', r )
      .attr( 'fill', d => colorScale( d.class ) );

}

function run( id ) {

  // Input for t-SNE iterable
  ITERATE = d3.select( 'input#iterate' )
    .property( 'checked' );

  project( id );

}

function project( id ) {

  // Convert data to 2D tensor
  tensorData = tf.tensor2d( arrayData );

  // Get a tsne optimizer
  var tsneOpt = tsne.tsne( tensorData, { perplexity : PERPLEXITY } );

  console.info( 'Projecting data in ' + ITERATIONS + ' iterations!' );

  if( ITERATE ) {

    async function iterateProjection() {
 
      await tsneOpt.iterateKnn();

      for( let i = 0; i < ITERATIONS; i++ ) {
        
        await tsneOpt.iterate();
        
        tsneOpt.coordsArray().then( coords => {

          console.info( 'Projection stepped!' );

          coords.forEach( ( d, i ) => {
              data[ i ].x = d[ 0 ];
              data[ i ].y = d[ 1 ];
          } );

          drawProjection();

        } );

      }

    }

    iterateProjection();

  } else {

    tsneOpt.compute( ITERATIONS ).then( () => {
      
      tsneOpt.coordsArray().then( coords => {

        console.info( 'Projection finished!' );

        coords.forEach( ( d, i ) => {
          data[ i ][ 'x-' + id ] = d[ 0 ];
          data[ i ][ 'y-' + id ] = d[ 1 ];
        } );

        drawProjection( id );

      } );

    } );

  }

}

function drawProjection( id ) {

  var svg;
  if( id == 1 ) svg = svg1;
  if( id == 2 ) svg = svg2;
  if( id == 3 ) svg = svg3; 

  var xScale;
  if( id == 1 ) xScale = xScale1;
  if( id == 2 ) xScale = xScale2;
  if( id == 3 ) xScale = xScale3;
  
  var yScale;
  if( id == 1 ) yScale = yScale1;
  if( id == 2 ) yScale = yScale2;
  if( id == 3 ) yScale = yScale3; 

  var g;
  if( id == 1 ) g = g1;
  if( id == 2 ) g = g2;
  if( id == 3 ) g = g3; 


  svg.append( 'text' )
    .attr( 'x', padding )
    .attr( 'y', padding )
    .text( 'Iterations: ' + ITERATIONS + '\nPerplexity: ' + PERPLEXITY );

  g.selectAll( 'circle' )
    .transition()
      .duration( 1000 )
      .attr( 'transform', d => "translate(" + ( xScale( d[ 'x-' + id ] ) - width / 2 ) + "," + ( yScale( d[ 'y-' + id ] ) - height / 2 ) + ")" );

}

initForm();
loadData();